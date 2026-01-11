'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useGameStore, Province, Army } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'
import useSocket from '@/hooks/useSocket'
import * as d3Geo from 'd3-geo'
import * as topojson from 'topojson-client'

const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// 2026 COMMODITY PRICES (Real Market Data)
// Oil ~$55/barrel, Lithium ~$15k/ton, Uranium ~$135/lb, Copper ~$11k/ton, Gold ~$4800/oz
const RESOURCE_CONFIG = {
    money: { icon: '💵', name: 'Dinero', unit: 'M', color: 'text-emerald-400' },
    food: { icon: '🌾', name: 'Alimentos', unit: 't', color: 'text-yellow-400' },
    materials: { icon: '🧱', name: 'Materiales', unit: 't', color: 'text-stone-400' },
    energy: { icon: '⚡', name: 'Energía', unit: 'kWh', color: 'text-amber-500' },
    manpower: { icon: '👷', name: 'Mano de Obra', unit: '', color: 'text-sky-400' },
}

// Unit configs with sprites and stats
const UNIT_SPRITES: Record<string, { icon: string; sprite: string; name: string; hp: number; attack: number; speed: string }> = {
    infantry: { icon: '🚶', sprite: '⚔️🧍', name: 'Soldado', hp: 100, attack: 10, speed: '1h/prov' },
    tank: { icon: '🚜', sprite: '🛡️🚜', name: 'Tanque', hp: 500, attack: 50, speed: '30m/prov' },
    artillery: { icon: '💥', sprite: '🎯💥', name: 'Artillería', hp: 200, attack: 80, speed: '45m/prov' },
    fighter: { icon: '✈️', sprite: '🦅✈️', name: 'Caza', hp: 150, attack: 60, speed: '5m/prov' },
    drone: { icon: '🛸', sprite: '👁️🛸', name: 'Drone', hp: 50, attack: 40, speed: '3m/prov' },
    battleship: { icon: '🚢', sprite: '⚓🚢', name: 'Acorazado', hp: 1000, attack: 100, speed: '90m/prov' },
    submarine: { icon: '🦈', sprite: '🌊🦈', name: 'Submarino', hp: 300, attack: 80, speed: '60m/prov' },
    missile: { icon: '🚀', sprite: '💢🚀', name: 'Misil', hp: 10, attack: 200, speed: '1m/prov' },
}

// Building types that can be constructed
const BUILDING_TYPES: Record<string, {
    name: string; icon: string; cost: string; buildTime: string;
    generates?: { unit: string; qty: number; interval: string }
}> = {
    // Economic
    industry: { name: 'Industria', icon: '🏭', cost: '50💵 10⚙️ 5🔶', buildTime: '30m' },
    refinery: { name: 'Refinería', icon: '⛽', cost: '75💵 20⚙️ 8🔶', buildTime: '40m' },
    lab: { name: 'Laboratorio', icon: '🔬', cost: '100💵 5⚙️ 10💻', buildTime: '1h' },
    // Defense
    bunker: { name: 'Búnker', icon: '🛡️', cost: '25💵 15⚙️', buildTime: '15m' },
    fortress: { name: 'Fortaleza', icon: '🏰', cost: '150💵 50⚙️', buildTime: '2h' },
    // Unit Production
    barracks: { name: 'Cuartel', icon: '🎖️', cost: '30💵 5⚙️ 10🌾', buildTime: '10m', generates: { unit: 'infantry', qty: 10, interval: '5m' } },
    recruitment_office: { name: 'Of. Reclutamiento', icon: '📋', cost: '20💵 2⚙️', buildTime: '5m', generates: { unit: 'infantry', qty: 5, interval: '10m' } },
    tank_factory: { name: 'Fáb. Tanques', icon: '🚜', cost: '100💵 30⚙️ 5🛢️', buildTime: '1h', generates: { unit: 'tank', qty: 2, interval: '30m' } },
    artillery_foundry: { name: 'Fund. Artillería', icon: '💥', cost: '80💵 25⚙️', buildTime: '40m', generates: { unit: 'artillery', qty: 3, interval: '20m' } },
    airport: { name: 'Aeropuerto', icon: '✈️', cost: '150💵 40⚙️ 20🛢️', buildTime: '90m', generates: { unit: 'fighter', qty: 1, interval: '1h' } },
    drone_facility: { name: 'Centro Drones', icon: '🛸', cost: '120💵 15💻 5🔋', buildTime: '80m', generates: { unit: 'drone', qty: 2, interval: '30m' } },
    naval_yard: { name: 'Astillero', icon: '🚢', cost: '200💵 60⚙️ 15🛢️', buildTime: '2h', generates: { unit: 'battleship', qty: 1, interval: '2h' } },
    submarine_pen: { name: 'Base Submarina', icon: '🦈', cost: '180💵 50⚙️ 5☢️', buildTime: '90m', generates: { unit: 'submarine', qty: 1, interval: '90m' } },
    missile_silo: { name: 'Silo Misiles', icon: '🚀', cost: '250💵 30⚙️ 10☢️', buildTime: '3h', generates: { unit: 'missile', qty: 1, interval: '3h' } },
}

const C = {
    waterLight: '#0f172a', // Slate 900
    waterDark: '#020617',  // Slate 950
    land: '#1e293b',       // Slate 800 (Dark metallic)
    landHover: '#334155',  // Slate 700
    border: '#0ea5e9',     // Cyan Neon
    borderSelected: '#f43f5e', // Rose Neon
    uiBg: '#000000cc',     // Glass Black
    uiPanel: '#0f172acc',  // Glass Slate
    uiAccent: '#0ea5e9',   // Cyan
}

interface MapCell { id: string; name: string; path: string; centroid: [number, number]; area: number }

export function WorldMapComponent() {
    const provinces = useGameStore(state => state.provinces)
    const setProvinces = useGameStore(state => state.setProvinces)
    const updateProvince = useGameStore(state => state.updateProvince)
    const armies = useGameStore(state => state.armies)
    const resources = useGameStore(state => state.resources)

    const selectedProvinceId = useUIStore(state => state.selectedProvinceId)
    const selectProvince = useUIStore(state => state.selectProvince)
    const hoveredProvinceId = useUIStore(state => state.hoveredProvinceId)
    const setHoveredProvince = useUIStore(state => state.setHoveredProvince)
    const selectedArmyId = useUIStore(state => state.selectedArmyId)
    const selectArmy = useUIStore(state => state.selectArmy)

    const playerId = usePlayerStore(state => state.playerId)
    const color = usePlayerStore(state => state.color)
    const username = usePlayerStore(state => state.username)

    const { socket, moveArmy, recruitUnit, constructBuilding } = useSocket()

    const [cells, setCells] = useState<MapCell[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState({ x: 0, y: 0, scale: 0.55 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [gameDay, setGameDay] = useState(1)
    const [lastTouchDist, setLastTouchDist] = useState(0)
    const [activeTab, setActiveTab] = useState<'units' | 'buildings' | 'info'>('info')

    const containerRef = useRef<HTMLDivElement>(null)
    const width = 2000, height = 950

    useEffect(() => { const t = setInterval(() => setGameDay(d => d + 1), 300000); return () => clearInterval(t) }, [])

    const projection = useMemo(() => d3Geo.geoMercator().scale(280).center([20, 25]).translate([width / 2, height / 2]), [])
    const pathGenerator = useMemo(() => d3Geo.geoPath().projection(projection), [projection])

    useEffect(() => {
        const loadMap = async () => {
            try {
                const res = await fetch(WORLD_URL)
                const topo = await res.json()
                const geo = topojson.feature(topo, topo.objects.countries) as any
                const allCells: MapCell[] = geo.features.map((f: any) => {
                    const path = pathGenerator(f)
                    if (!path) return null
                    const centroid = pathGenerator.centroid(f)
                    const bounds = pathGenerator.bounds(f)
                    const area = Math.abs((bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]))
                    // Robust ID generation to avoid duplicate keys
                    const cellId = f.id ? String(f.id) : `region_${Math.random().toString(36).substr(2, 9)}`;
                    return { id: cellId, name: f.properties?.name || `Region ${cellId}`, path, centroid, area }
                }).filter(Boolean) as MapCell[]

                setCells(allCells)

                if (provinces.length === 0) {
                    // Real 2026 Country Resource Data (ISO numeric codes)
                    const COUNTRY_RESOURCES: Record<string, Partial<Province>> = {
                        // Top Oil Producers
                        '840': { oilBonus: 50, gasBonus: 40, steelBonus: 30, siliconBonus: 25, foodBonus: 60 }, // USA
                        '643': { oilBonus: 45, gasBonus: 60, uraniumBonus: 15, steelBonus: 25 }, // Russia
                        '682': { oilBonus: 55, gasBonus: 45 }, // Saudi Arabia
                        '784': { oilBonus: 35, gasBonus: 25, goldBonus: 5 }, // UAE
                        '634': { oilBonus: 20, gasBonus: 80 }, // Qatar
                        '364': { oilBonus: 25, gasBonus: 30, uraniumBonus: 5 }, // Iran
                        '368': { oilBonus: 30, gasBonus: 15 }, // Iraq
                        '414': { oilBonus: 25, gasBonus: 20 }, // Kuwait
                        // Lithium Triangle
                        '152': { lithiumBonus: 40, copperBonus: 35 }, // Chile
                        '032': { lithiumBonus: 25, foodBonus: 45, copperBonus: 10 }, // Argentina
                        '068': { lithiumBonus: 15, gasBonus: 8 }, // Bolivia
                        '036': { lithiumBonus: 20, uraniumBonus: 12, steelBonus: 15, goldBonus: 10 }, // Australia
                        // Rare Earths
                        '156': { rareEarthBonus: 45, steelBonus: 55, siliconBonus: 40, lithiumBonus: 15, copperBonus: 20 }, // China
                        '392': { siliconBonus: 35, steelBonus: 20, rareEarthBonus: 8 }, // Japan
                        '410': { siliconBonus: 30, steelBonus: 15 }, // South Korea
                        '158': { siliconBonus: 45, rareEarthBonus: 5 }, // Taiwan
                        // Uranium
                        '398': { uraniumBonus: 25, oilBonus: 15, gasBonus: 12 }, // Kazakhstan
                        '124': { uraniumBonus: 18, oilBonus: 20, gasBonus: 15, foodBonus: 35 }, // Canada
                        '516': { uraniumBonus: 12 }, // Namibia
                        // Europe
                        '826': { oilBonus: 8, gasBonus: 12, goldBonus: 5, steelBonus: 10 }, // UK
                        '250': { foodBonus: 35, steelBonus: 12 }, // France
                        '276': { steelBonus: 25, siliconBonus: 15, copperBonus: 10 }, // Germany
                    }

                    const gameProvinces: Province[] = allCells.map((c, i) => {
                        const countryData = COUNTRY_RESOURCES[c.id] || {}
                        let rType: 'FOOD' | 'MATERIALS' | 'ENERGY' = 'FOOD'

                        // Heuristic
                        if (countryData.oilBonus || countryData.gasBonus || countryData.uraniumBonus) rType = 'ENERGY'
                        else if (countryData.steelBonus || countryData.rareEarthBonus || countryData.lithiumBonus) rType = 'MATERIALS'
                        else if (!countryData.oilBonus && Math.random() > 0.6) rType = Math.random() > 0.5 ? 'MATERIALS' : 'ENERGY'

                        return {
                            id: c.id, name: c.name,
                            coordX: c.centroid[0], coordY: c.centroid[1], coordZ: 0,
                            ownerId: null, ownerColor: undefined,
                            resourceType: rType,
                            baseProduction: 1000 + Math.floor(Math.random() * 500),
                            morale: 100,
                            terrain: 'PLAINS',
                            buildings: {},
                            units: [],
                            // Bonus properties
                            oilBonus: countryData.oilBonus || 0,
                            gasBonus: countryData.gasBonus || 0,
                            uraniumBonus: countryData.uraniumBonus || 0,
                            lithiumBonus: countryData.lithiumBonus || 0,
                            rareEarthBonus: countryData.rareEarthBonus || 0,
                            copperBonus: countryData.copperBonus || 0,
                            goldBonus: countryData.goldBonus || 0,
                            steelBonus: countryData.steelBonus || 0,
                            siliconBonus: countryData.siliconBonus || 0,
                            foodBonus: countryData.foodBonus || 0,
                            defenseBonus: countryData.defenseBonus || 0,
                            construction: { building: null, timeLeft: 0 }
                        }
                    })
                    setProvinces(gameProvinces)
                }
                setLoading(false)

                // Auto-center
                setTimeout(() => {
                    if (containerRef.current) {
                        const r = containerRef.current.getBoundingClientRect()
                        const mapW = width * 0.55
                        const mapH = height * 0.55
                        const cx = (r.width - mapW) / 2
                        const cy = (r.height - mapH) / 2
                        setView(v => ({ ...v, x: cx, y: cy, scale: 0.55 }))
                    }
                }, 100)
            } catch (err) { console.error(err); setLoading(false) }
        }
        loadMap()
    }, [pathGenerator, provinces.length, setProvinces])

    const getProvince = useCallback((id: string) => provinces.find(p => p.id === id), [provinces])
    const armyMap = useMemo(() => { const m = new Map<string, Army>(); armies.forEach(a => m.set(a.currentProvinceId, a)); return m }, [armies])
    const s = useCallback((base: number) => base / Math.max(view.scale, 0.3), [view.scale])
    const getFillColor = useCallback((id: string) => {
        const p = getProvince(id), isH = hoveredProvinceId === id
        if (p?.ownerColor) return isH ? p.ownerColor : p.ownerColor + 'cc'
        return isH ? C.landHover : C.land
    }, [getProvince, hoveredProvinceId])

    const handleClick = useCallback((id: string) => {
        if (selectedArmyId) { const a = armies.find(x => x.id === selectedArmyId); if (a && a.currentProvinceId !== id) { moveArmy?.(selectedArmyId, id); selectArmy(null) } }
        selectProvince(id)
    }, [selectedArmyId, armies, moveArmy, selectArmy, selectProvince])



    const handleRecruit = useCallback((type: string) => { if (selectedProvinceId) recruitUnit?.(selectedProvinceId, type) }, [selectedProvinceId, recruitUnit])
    const handleBuild = useCallback((type: string) => { if (selectedProvinceId) constructBuilding?.(selectedProvinceId, type) }, [selectedProvinceId, constructBuilding])
    const handleArmyClick = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => { e.stopPropagation(); selectArmy(selectedArmyId === id ? null : id) }, [selectedArmyId, selectArmy])

    // Controls
    const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - view.x, y: e.clientY - view.y }) }
    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const r = containerRef.current?.getBoundingClientRect()
            if (!r) return
            const rawX = e.clientX - dragStart.x
            const rawY = e.clientY - dragStart.y

            // Constrain Pan
            const mw = width * view.scale, mh = height * view.scale
            const cx = mw < r.width ? (r.width - mw) / 2 : Math.max(r.width - mw, Math.min(0, rawX))
            const cy = mh < r.height ? (r.height - mh) / 2 : Math.max(r.height - mh, Math.min(0, rawY))

            setView({ ...view, x: cx, y: cy })
        }
    }
    const onMouseUp = () => setIsDragging(false)
    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault(); const r = containerRef.current?.getBoundingClientRect(); if (!r) return
        const mx = e.clientX - r.left, my = e.clientY - r.top, f = e.deltaY > 0 ? 0.85 : 1.18 // 0.85/1.18 for smooth zoom

        // Constrain Zoom (250% to 2000% as requested)
        const ns = Math.max(2.5, Math.min(20, view.scale * f))
        const sc = ns / view.scale

        const rawX = mx - (mx - view.x) * sc
        const rawY = my - (my - view.y) * sc

        // Constrain Pan after zoom
        const mw = width * ns, mh = height * ns
        const cx = mw < r.width ? (r.width - mw) / 2 : Math.max(r.width - mw, Math.min(0, rawX))
        const cy = mh < r.height ? (r.height - mh) / 2 : Math.max(r.height - mh, Math.min(0, rawY))

        setView({ x: cx, y: cy, scale: ns })
    }, [view, width, height])

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - view.x, y: e.touches[0].clientY - view.y }) }
        else if (e.touches.length === 2) setLastTouchDist(Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY))
    }
    const onTouchMove = (e: React.TouchEvent) => {
        e.preventDefault(); const r = containerRef.current?.getBoundingClientRect(); if (!r) return

        if (e.touches.length === 1 && isDragging) {
            const rawX = e.touches[0].clientX - dragStart.x
            const rawY = e.touches[0].clientY - dragStart.y
            const mw = width * view.scale, mh = height * view.scale
            const cx = mw < r.width ? (r.width - mw) / 2 : Math.max(r.width - mw, Math.min(0, rawX))
            const cy = mh < r.height ? (r.height - mh) / 2 : Math.max(r.height - mh, Math.min(0, rawY))
            setView({ ...view, x: cx, y: cy })
        }
        else if (e.touches.length === 2 && lastTouchDist > 0) {
            const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
            const f = nd / lastTouchDist
            const ns = Math.max(2.5, Math.min(20, view.scale * f))
            // Center zoom for touch is tricky without midpoint, simplifying to center-screen zoom or previous center
            // For robust pinch zoom, we need midpoint. For now, keeping simple scale constraint.
            setView(v => ({ ...v, scale: ns })); setLastTouchDist(nd)
        }
    }
    const onTouchEnd = () => { setIsDragging(false); setLastTouchDist(0) }

    const showLabels = view.scale >= 0.5

    if (loading) return <div className="w-full h-full flex items-center justify-center" style={{ background: C.waterDark }}><div className="text-white text-2xl animate-pulse">⚔️ WORLD CONFLICT 2026</div></div>

    const selectedProv = selectedProvinceId ? getProvince(selectedProvinceId) : null
    const selectedCell = selectedProvinceId ? cells.find(c => c.id === selectedProvinceId) : null
    const selectedArmy = selectedArmyId ? armies.find(a => a.id === selectedArmyId) : null
    const canClaim = selectedProv && !selectedProv.ownerId
    const isOwned = selectedProv?.ownerId === playerId
    const myProvinces = provinces.filter(p => p.ownerId === playerId).length

    return (
        <div className="w-full h-full flex flex-col" style={{ background: C.uiBg }}>
            {/* TOP BAR - COMPACT RESOURCES */}
            <div className="flex items-center justify-between px-2 py-1 shrink-0" style={{ background: C.uiPanel, borderBottom: `1px solid ${C.uiAccent}40` }}>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">DÍA</span>
                    <span className="text-lg font-bold" style={{ color: C.uiAccent }}>{gameDay}</span>
                </div>
                <div className="flex items-center gap-4 overflow-x-auto text-xs px-2">
                    <R icon="💵" val={resources?.money || 0} rate={100} unit="M" c="text-emerald-400" />
                    <R icon="🌾" val={resources?.food || 0} rate={50} unit="t" c="text-yellow-400" />
                    <R icon="🧱" val={resources?.materials || 0} rate={50} unit="t" c="text-stone-400" />
                    <R icon="⚡" val={resources?.energy || 0} rate={50} unit="kWh" c="text-amber-500" />
                    <R icon="👷" val={resources?.manpower || 0} rate={10} unit="" c="text-sky-400" />
                </div>
                <div className="text-xs text-gray-400">{username} | <span className="text-white font-bold">{myProvinces}</span> prov</div>
            </div>

            {/* MAIN AREA */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-10 shrink-0 flex flex-col items-center py-2 gap-1 border-r border-zinc-800" style={{ background: C.uiPanel }}>
                    <SB icon="📍" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                    <SB icon="🚶" active={activeTab === 'units'} onClick={() => setActiveTab('units')} />
                    <SB icon="🏭" active={activeTab === 'buildings'} onClick={() => setActiveTab('buildings')} />
                </div>

                {/* MAP */}
                <div ref={containerRef} className="flex-1 relative overflow-hidden select-none touch-none"
                    style={{ background: `linear-gradient(${C.waterLight}, ${C.waterDark})`, cursor: isDragging ? 'grabbing' : 'grab' }}
                    onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                    onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}>
                        {cells.map(cell => {
                            const sel = selectedProvinceId === cell.id, army = armyMap.get(cell.id)
                            return (
                                <g key={cell.id}>
                                    <path d={cell.path} fill={getFillColor(cell.id)} stroke={sel ? C.borderSelected : C.border} strokeWidth={s(sel ? 3 : 0.7)}
                                        style={{ cursor: 'pointer' }} onClick={() => !isDragging && handleClick(cell.id)}
                                        onMouseEnter={() => !isDragging && setHoveredProvince(cell.id)} onMouseLeave={() => setHoveredProvince(null)} />
                                    {showLabels && cell.area > 600 && <text x={cell.centroid[0]} y={cell.centroid[1]} textAnchor="middle" dominantBaseline="middle"
                                        fill="#cbd5e1" fontSize={s(Math.min(11, Math.max(6, cell.area / 700)))} fontWeight="600" style={{ pointerEvents: 'none', textTransform: 'uppercase', textShadow: '0px 1px 2px #000' }}>{cell.name}</text>}

                                    {/* Units / Garrisons */}
                                    {getProvince(cell.id)?.units && (getProvince(cell.id)?.units?.length || 0) > 0 && (
                                        <g transform={`translate(${cell.centroid[0]}, ${cell.centroid[1] + s(16)})`} style={{ cursor: 'pointer' }} onClick={(e) => !isDragging && handleArmyClick(e, cell.id)}>
                                            <rect x={s(-18)} y={s(-12)} width={s(36)} height={s(24)} rx={s(3)} fill={getProvince(cell.id)?.ownerColor || '#444'} stroke={selectedArmyId === cell.id ? '#fff' : '#000'} strokeWidth={s(2)} />
                                            <text textAnchor="middle" dy={s(4)} fontSize={s(14)} fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none' }}>
                                                {(getProvince(cell.id)?.units as any[]).reduce((sum, u) => sum + (u.quantity || 1), 0)}
                                            </text>
                                            {/* Unit Icon Badge */}
                                            {(getProvince(cell.id)?.units as any[])[0] && UNIT_SPRITES[(getProvince(cell.id)?.units as any[])[0].type.toLowerCase()]?.icon && (
                                                <text x={s(12)} y={s(-8)} fontSize={s(10)}>{UNIT_SPRITES[(getProvince(cell.id)?.units as any[])[0].type.toLowerCase()].icon}</text>
                                            )}
                                        </g>
                                    )}

                                    {/* Moving Armies (Separate Layer) */}
                                    {army && <g transform={`translate(${cell.centroid[0]}, ${cell.centroid[1] + s(16)})`} style={{ cursor: 'pointer' }} onClick={(e) => !isDragging && handleArmyClick(e, army.id)}>
                                        <rect x={s(-18)} y={s(-12)} width={s(36)} height={s(24)} rx={s(3)} fill={army.playerColor || '#c44'} stroke={selectedArmyId === army.id ? '#fff' : '#000'} strokeWidth={s(2)} />
                                        <text textAnchor="middle" dy={s(4)} fontSize={s(14)} fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none' }}>{army.units.reduce((s, u) => s + u.quantity, 0)}</text>
                                    </g>}
                                </g>
                            )
                        })}
                    </svg>
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button onClick={() => setView(v => {
                            const ns = Math.min(20, v.scale * 1.5)
                            const r = containerRef.current?.getBoundingClientRect()
                            if (!r) return { ...v, scale: ns }
                            const mw = width * ns, mh = height * ns
                            // Apply clamping based on current center ratio? Simplified to clamping edges.
                            const cx = mw < r.width ? (r.width - mw) / 2 : Math.max(r.width - mw, Math.min(0, v.x)) // Keep x if valid, else clamp
                            const cy = mh < r.height ? (r.height - mh) / 2 : Math.max(r.height - mh, Math.min(0, v.y))
                            return { x: cx, y: cy, scale: ns }
                        })} className="w-7 h-7 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded border border-zinc-600">+</button>
                        <button onClick={() => setView(v => {
                            const ns = Math.max(2.5, v.scale / 1.5)
                            const r = containerRef.current?.getBoundingClientRect()
                            if (!r) return { ...v, scale: ns }
                            const mw = width * ns, mh = height * ns
                            const cx = mw < r.width ? (r.width - mw) / 2 : Math.max(r.width - mw, Math.min(0, v.x))
                            const cy = mh < r.height ? (r.height - mh) / 2 : Math.max(r.height - mh, Math.min(0, v.y))
                            return { x: cx, y: cy, scale: ns }
                        })} className="w-7 h-7 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded border border-zinc-600">−</button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-gray-300">{Math.round(view.scale * 100)}%</div>
                </div>
            </div>

            {/* BOTTOM PANEL - SUPREMACY 1914 STYLE */}
            <div className={`fixed bottom-0 left-0 right-0 border-t border-white/10 transition-transform duration-300 ease-out z-50 ${selectedProv ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ background: 'rgba(5, 10, 20, 0.95)', backdropFilter: 'blur(12px)', height: '240px', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
                {selectedProv && selectedCell && (
                    <div className="flex h-full text-zinc-100 max-w-7xl mx-auto">
                        {/* LEFT: PROVINCE INFO & RESOURCES */}
                        <div className="w-72 flex flex-col border-r border-white/10 relative shrink-0">
                            {/* Province Header */}
                            <div className="p-4 bg-gradient-to-r from-zinc-900 to-transparent border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="font-black text-xl tracking-widest text-white truncate uppercase drop-shadow-lg">{selectedCell.name}</div>
                                    <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isOwned ? 'text-emerald-400' : (canClaim ? 'text-zinc-400' : 'text-rose-500')}`}>
                                        {isOwned ? 'TERRITORIO NACIONAL' : (canClaim ? 'ZONA NEUTRAL' : 'TERRITORIO ENEMIGO')}
                                    </div>
                                </div>
                                <div className="text-2xl">{isOwned ? '🚩' : (canClaim ? '🏳️' : '⚔️')}</div>
                            </div>

                            {/* Moral Bar */}
                            <div className="px-5 py-3 border-b border-white/5 bg-black/20">
                                <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5 ">
                                    <span>MORAL PÚBLICA</span>
                                    <span className={isOwned ? 'text-emerald-400' : 'text-zinc-500'}>{(selectedProv as any).moral || 100}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" style={{ width: `${(selectedProv as any).moral || 100}%` }} />
                                </div>
                            </div>

                            {/* Resource Bonuses */}
                            <div className="flex-1 p-3 flex flex-col gap-2 content-start overflow-y-auto">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">PRODUCCIÓN LOCAL</div>
                                {selectedProv && (selectedProv as any).resourceType && (
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/5">
                                        <span className="text-3xl filter drop-shadow opacity-90">
                                            {(RESOURCE_CONFIG as any)[(selectedProv as any).resourceType.toLowerCase()]?.icon || '📦'}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-400 uppercase font-bold">
                                                {(RESOURCE_CONFIG as any)[(selectedProv as any).resourceType.toLowerCase()]?.name || 'Recurso'}
                                            </span>
                                            <span className="text-xl font-bold text-emerald-400">
                                                +{(selectedProv as any).baseProduction || 1000} <span className="text-xs text-zinc-500">/ día</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MIDDLE: BUILDINGS & QUEUE */}
                        <div className="flex-1 flex flex-col border-r border-white/10 min-w-0">
                            <div className="p-3 bg-black/20 border-b border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">INFRAESTRUCTURA Y CONSTRUCCIÓN</span>
                                <button onClick={() => isOwned && setActiveTab('buildings')} className={`text-xs px-3 py-1 rounded border ${isOwned ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10' : 'border-zinc-700 text-zinc-600 cursor-not-allowed'} transition-all uppercase font-bold`}>
                                    {isOwned ? '+ NUEVA ORDEN' : 'REQUIERE CONQUISTA'}
                                </button>
                            </div>

                            {/* Buildings Grid */}
                            <div className="p-4 flex gap-3 overflow-x-auto h-full items-center content-center scrollbar-thin scrollbar-thumb-zinc-700">
                                {selectedProv.buildings && Object.keys(selectedProv.buildings).length > 0 ? Object.keys(selectedProv.buildings).filter(k => (selectedProv.buildings as any)[k]).map((type, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center shrink-0 w-24 h-32 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg border border-zinc-700 relative group hover:border-amber-500/50 hover:shadow-lg transition-all shadow-black/50 shadow-md">
                                        <span className="text-4xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">{BUILDING_TYPES[type]?.icon || '🏗️'}</span>
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate w-full text-center px-1">{BUILDING_TYPES[type]?.name || type}</span>
                                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                    </div>
                                )) : (
                                    <div className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600">
                                        <span className="text-3xl mb-1 opacity-20">🏗️</span>
                                        <span className="text-xs font-bold uppercase tracking-wide opacity-50">Sin edificios activos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: TABS AND ACTIONS (Control Panel) */}
                        <div className="w-96 flex flex-col bg-zinc-900/80 backdrop-blur-xl shrink-0">
                            {/* Tabs */}
                            <div className="flex border-b border-white/10 bg-black/40">
                                <button onClick={() => setActiveTab('units')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'units' ? 'bg-amber-600/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-600 hover:text-zinc-300'}`}>RECLUTAMIENTO</button>
                                <button onClick={() => setActiveTab('buildings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buildings' ? 'bg-amber-600/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-600 hover:text-zinc-300'}`}>CONSTRUCCIÓN</button>
                                <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-amber-600/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-600 hover:text-zinc-300'}`}>ESPIONAJE</button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-zinc-900/50 to-black/20">
                                {activeTab === 'units' && isOwned && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(UNIT_SPRITES).map(([t, u]) => {
                                            const isProducing = (selectedProv as any).production?.unitType === t;
                                            const isBusy = !!(selectedProv as any).production?.unitType;

                                            return (
                                                <button key={t} onClick={() => !isBusy && handleRecruit(t)} disabled={isBusy} className={`flex flex-col items-center justify-center p-1 border rounded transition-all group h-20 relative overflow-hidden
                                                ${isProducing ? 'bg-indigo-900/40 border-indigo-500' : (isBusy ? 'bg-zinc-800/30 border-zinc-800 opacity-50 cursor-not-allowed' : 'bg-zinc-800/50 hover:bg-zinc-700/80 border-zinc-700 hover:border-amber-500/50')}
                                            `}>
                                                    <span className="text-2xl group-hover:scale-110 transition-transform mb-1">{u.sprite}</span>
                                                    <span className="text-[8px] font-bold text-zinc-400 group-hover:text-white uppercase truncate w-full text-center">{u.name}</span>

                                                    {/* Production Progress Overlay */}
                                                    {isProducing && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                                                            <span className="text-indigo-400 animate-spin text-xs">⚙️</span>
                                                            <span className="text-[10px] font-bold text-white">{(selectedProv as any).production?.timeLeft}s</span>
                                                        </div>
                                                    )}
                                                    <div className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors ${isProducing ? 'bg-indigo-500' : 'bg-indigo-500/0 group-hover:bg-indigo-500'}`}></div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                                {activeTab === 'buildings' && isOwned && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(BUILDING_TYPES).map(([k, b]) => {
                                            const isConstructing = selectedProv.construction?.building === k;
                                            const isBusy = !!selectedProv.construction?.building;

                                            // Determine if we can afford it (simple check vs cost string parsing? Logic is complex string parsing, skip for now or doing it properly?)
                                            // For MVP, just show button. Validation is server-side.

                                            return (
                                                <button key={k}
                                                    onClick={() => !isBusy && handleBuild(k)}
                                                    disabled={isBusy}
                                                    className={`flex flex-col items-center p-2 border rounded transition-all text-left h-24 relative overflow-hidden group 
                                                    ${isConstructing ? 'bg-amber-900/40 border-amber-500' : (isBusy ? 'bg-zinc-800/30 border-zinc-800 opacity-50 cursor-not-allowed' : 'bg-zinc-800/50 hover:bg-zinc-700/80 border-zinc-700 hover:border-amber-500/50')}
                                                `}
                                                >
                                                    <span className="text-xl mb-1 z-10">{b.icon}</span>
                                                    <span className="text-[8px] font-bold text-zinc-400 group-hover:text-white uppercase z-10 truncate w-full text-center">{b.name}</span>
                                                    <span className="text-[8px] text-zinc-500 z-10">{b.buildTime}</span>

                                                    {/* Construction Progress Overlay */}
                                                    {isConstructing && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                                                            <span className="text-amber-500 animate-spin mb-1">⚙️</span>
                                                            <span className="text-[10px] font-bold text-white">{selectedProv.construction?.timeLeft}s</span>
                                                        </div>
                                                    )}

                                                    <div className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors ${isConstructing ? 'bg-amber-500' : 'bg-amber-500/0 group-hover:bg-amber-500'}`}></div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                                {activeTab === 'info' && !isOwned && (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <span className="text-4xl mb-3 opacity-30">🛡️</span>
                                        <p className="text-xs text-zinc-400 mb-4">Esta provincia no está bajo tu control.</p>
                                        {canClaim && <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full animate-pulse border border-amber-500/20">ENVÍA TROPAS PARA INICIAR SITIO</div>}
                                    </div>
                                )}
                                {/* Fallback for owned info tab/espionage placeholder */}
                                {activeTab === 'info' && isOwned && (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                        <span className="text-3xl mb-2">🕵️</span>
                                        <span className="text-xs uppercase font-bold tracking-widest">RED DE ESPIONAJE (WIP)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function R({ icon, val, rate, unit, c }: { icon: string; val: number; rate: number; unit?: string; c: string }) {
    const fmt = (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(v < 10 ? 1 : 0)
    return <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/30"><span className="text-sm">{icon}</span><span className={`font-bold text-xs ${c}`}>{fmt(val)}{unit && <span className="text-[8px] opacity-60">{unit}</span>}</span><span className={`text-[8px] ${rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>{rate >= 0 ? '+' : ''}{rate}</span></div>
}
function SB({ icon, active, onClick }: { icon: string; active?: boolean; onClick: () => void }) {
    return <button onClick={onClick} className={`w-8 h-8 flex items-center justify-center rounded text-lg ${active ? 'bg-amber-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'}`}>{icon}</button>
}

export default WorldMapComponent
