'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useGameStore, Province, Army } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'
import useSocket from '@/hooks/useSocket'

// Shared SVG Definitions for Gradients and Filters
const MapDefs = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
            <linearGradient id="plains-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#166534" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="forest-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#374151" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#172554" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
            <filter id="hex-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    </svg>
)
// 2D HEX MAP COMPONENT
// ============================================

interface HexProps {
    province: Province
    isSelected: boolean
    isHovered: boolean
    hasArmy: boolean
    army?: Army
    isArmySelected: boolean
    onClick: () => void
    onArmyClick: (e: React.MouseEvent) => void
    onHover: (hover: boolean) => void
}

function HexTile({ province, isSelected, isHovered, hasArmy, army, isArmySelected, onClick, onArmyClick, onHover }: HexProps) {
    const fill = useMemo(() => {
        // If owned, use player color but maybe we should texture it later? 
        // For now, solid color is better than gradient for seamless look.
        if (province.ownerColor) return province.ownerColor

        // SEALMESS TERRAIN COLORS (No Gradients)
        switch (province.terrain) {
            case 'MOUNTAINS': return '#374151' // Gray-700
            case 'FOREST': return '#14532d'    // Green-900
            case 'OCEAN': return '#1e3a8a'     // Blue-900 (Deep Sea)
            default: return '#365314'          // Lime-950 (Dark Plains - varying slightly would be nice but flat ensures seamless)
        }
    }, [province.ownerColor, province.terrain])

    const borderColor = isSelected ? '#fbbf24' : isHovered ? '#00aaff' : '#374151'
    const scale = isSelected || isHovered ? 1.05 : 1

    return (
        <div
            className="hex-container"
            style={{
                position: 'absolute',
                left: `${province.coordX * 52 + (province.coordY % 2 === 1 ? 26 : 0)}px`,
                top: `${province.coordY * 45}px`,
                transform: `scale(${scale})`,
                zIndex: isSelected ? 10 : isHovered ? 5 : 1,
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >
            <svg width="52" height="60" viewBox="0 0 52 60" className={`hex-svg ${isSelected || isHovered ? 'map-glow' : ''}`}>
                <polygon
                    points="26,0 52,15 52,45 26,60 0,45 0,15"
                    fill={fill}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
                    strokeOpacity={isSelected || isHovered ? 1 : 0}
                    style={{ transition: 'all 0.3s ease', transform: isSelected || isHovered ? 'scale(0.95)' : 'scale(1.03)', transformBox: 'fill-box', transformOrigin: 'center' }}
                />

                {/* Terrain Visuals */}
                {province.terrain === 'MOUNTAINS' && (
                    <path d="M26 15 L38 40 L14 40 Z" fill="#4b5563" opacity="0.6" />
                )}
                {province.terrain === 'FOREST' && (
                    <g fill="#064e3b" opacity="0.6">
                        <path d="M26 15 L32 25 H20 Z" />
                        <path d="M26 20 L34 35 H18 Z" />
                    </g>
                )}
            </svg>

            {/* Province Label */}
            {(isSelected || isHovered) && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded border border-primary z-20 whitespace-nowrap pointer-events-none">
                    {province.name}
                </div>
            )}

            {/* Army Icon */}
            {hasArmy && army && (
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200
                        ${isArmySelected ? 'scale-125' : 'hover:scale-110'}`}
                    onClick={onArmyClick}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2"
                        style={{
                            backgroundColor: army.playerColor || '#fbbf24',
                            borderColor: isArmySelected ? '#fff' : '#1f2937',
                        }}
                    >
                        {/* Different icon based on unit composition */}
                        {army.units.some(u => u.type === 'battleship') ? (
                            <span className="text-lg">🚢</span>
                        ) : army.units.some(u => u.type === 'fighter') ? (
                            <span className="text-lg">✈️</span>
                        ) : army.units.some(u => u.type === 'artillery') ? (
                            <span className="text-lg">🎯</span>
                        ) : army.units.some(u => u.type === 'tank') ? (
                            <span className="text-lg">🚜</span>
                        ) : (
                            <span className="text-lg">🛡️</span>
                        )}
                    </div>
                </div>
            )}

            {/* Building Icons */}
            {province.buildings && province.buildings.length > 0 && (
                <div className="absolute top-1 right-1 flex gap-0.5 pointer-events-none">
                    {province.buildings.map((building: any) => (
                        <div
                            key={building.id}
                            className="w-5 h-5 bg-black/60 rounded-sm flex items-center justify-center border border-yellow-500/50"
                            title={building.type}
                        >
                            <span className="text-xs">
                                {building.type === 'industry' ? '🏭' : '🏰'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================
// MAIN MAP COMPONENT
// ============================================

export function MapComponent2D() {
    const { provinces, mapSeed, setProvinces, pendingMapUpdates, armies } = useGameStore()
    const { selectedProvinceId, selectProvince, hoveredProvinceId, setHoveredProvince, selectedArmyId, selectArmy } = useUIStore()
    const { color: playerColor, playerId } = usePlayerStore()
    const { moveArmy, recruitUnit } = useSocket()

    // Seeded Random Helper (Mulberry32)
    const mulberry32 = useCallback((a: number) => {
        return function () {
            let t = a += 0x6D2B79F5
            t = Math.imul(t ^ t >>> 15, t | 1)
            t ^= t + Math.imul(t ^ t >>> 7, t | 61)
            return ((t ^ t >>> 14) >>> 0) / 4294967296
        }
    }, [])

    // Map Generation with Continents (Simple Distance Field)
    useEffect(() => {
        // We generate if we have a seed. 
        // We do NOT stop if provinces.length > 0 anymore, because we need to Ensure the "World" exists
        // surrounding the "Server Owned Provinces".
        // Use a ref to prevent infinite loop or use useMemo for the Base Map?
        // Better: Check if provinces.length < fullGridSize

        const gridSize = 30 // Increased grid size
        const totalHexes = gridSize * gridSize

        if (mapSeed !== null && provinces.length < totalHexes) {
            console.log("🗺️ Generating Full World Map with seed:", mapSeed)
            const random = mulberry32(mapSeed)
            const worldMap: Province[] = []

            // Generate "Continent Centers"
            const numContinents = 4
            const centers = []
            for (let i = 0; i < numContinents; i++) {
                centers.push({
                    x: Math.floor(random() * gridSize),
                    y: Math.floor(random() * gridSize),
                    radius: (random() * 5) + 3 // Radius 3-8
                })
            }

            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    // 1. Determine Land vs Ocean (Metaballs-like)
                    let elevation = 0
                    centers.forEach(c => {
                        const dx = x - c.x
                        const dy = y - c.y
                        const dist = Math.sqrt(dx * dx + dy * dy)

                        // Add varying noise to edge
                        const noise = random() * 2.0
                        if (dist < c.radius + noise) {
                            elevation += 1
                        }
                    })

                    let terrainType = 'OCEAN'
                    if (elevation > 0) {
                        // It's Land. Determine Biome.
                        const biomeRoll = random()
                        terrainType = biomeRoll > 0.8 ? 'MOUNTAINS' : biomeRoll > 0.5 ? 'FOREST' : 'PLAINS'
                    }

                    // Base Province
                    const province: Province = {
                        id: `${x}-${y}`,
                        name: terrainType === 'OCEAN' ? `Mar ${x}${y}` : `${String.fromCharCode(65 + (x % 26))}${y + 1}`,
                        coordX: x,
                        coordY: y,
                        coordZ: 0,
                        ownerId: null, // Default neutral
                        oilBonus: terrainType === 'OCEAN' ? 5 : Math.floor(random() * 10),
                        gasBonus: terrainType === 'OCEAN' ? 3 : Math.floor(random() * 8),
                        uraniumBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 3),
                        lithiumBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 5),
                        rareEarthBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 4),
                        copperBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 8),
                        goldBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 6),
                        steelBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 10) + 5,
                        siliconBonus: terrainType === 'OCEAN' ? 0 : Math.floor(random() * 7),
                        foodBonus: terrainType === 'OCEAN' ? 2 : Math.floor(random() * 15) + 5,
                        defenseBonus: terrainType === 'MOUNTAINS' ? 50 : terrainType === 'FOREST' ? 25 : 0,
                        terrain: terrainType,
                        buildings: [],
                        units: [],
                    }
                    worldMap.push(province)
                }
            }

            // Now Sync with Store's existing data (Server Data)
            // If store already has some provinces (from game:joined), we preserve their state
            if (provinces.length > 0) {
                provinces.forEach(p => {
                    const idx = worldMap.findIndex(w => w.id === p.id)
                    if (idx !== -1) {
                        // Merge: Keep World properties but Override Owner/State from Server
                        worldMap[idx] = { ...worldMap[idx], ...p }
                    }
                })
            }

            setProvinces(worldMap)
        }
    }, [mapSeed, provinces, setProvinces, mulberry32]) // Removed provinces.length dependency to allow initial merge, but logic above handles check

    // --- SMOOTH ANIMATION LOOP ---
    const [animatedArmies, setAnimatedArmies] = useState<Record<string, { x: number, y: number }>>({})

    useEffect(() => {
        let animationFrameId: number

        const animate = () => {
            const now = Date.now()
            const newPositions: Record<string, { x: number, y: number }> = {}
            let needsUpdate = false

            armies.forEach(army => {
                if (army.isMoving && army.destinationId && army.fromProvinceId && army.arrivalTime) {
                    const startProv = provinces.find(p => p.id === army.fromProvinceId)
                    const endProv = provinces.find(p => p.id === army.destinationId)

                    // We need Total Duration to calculate progress. 
                    // Current store might not have it, but we can infer or store it.
                    // BETTER: Store 'startTime' in army object?
                    // Workaround: We know arrivalTime. We can guess total time OR just use linear interp if we knew start time.
                    // Let's use a visual trick: Move towards target at constant speed?

                    // Actually, let's use the 'path' if available, otherwise linear.
                    // Simple Linear for MVP:
                    if (startProv && endProv) {
                        // Calculate progress based on time remaining
                        const timeLeft = army.arrivalTime - now
                        // Duration? We don't have it on the army object unless we added it.
                        // Let's assume a default or verify if we can add 'startTime' to store.
                        // Fallback: Just Visual Interpolation. 
                        // To make it smooth without startTime, we can't do exact time-mapping easily.
                        // Alternative: Use a local 'visualStartTime' map.
                    }
                }
            })

            // Wait, to do this properly I need 'startTime' or 'totalDuration' on the army object.
            // I'll update the render loop to just calculate positions roughly or add the field.
            // For this iteration, let's rely on the static dashed lines + server updates, 
            // OR implement a purely visual 'interpolator' that moves the icon towards dest.

            // Since I lack 'startTime', I will add it to the server first? 
            // User wants "caminaran", so I'll prioritize the MAP generation first which is ready above.
            // Animation requires schema change.

            // animationFrameId = requestAnimationFrame(animate)
        }
        // animate()
        // return () => cancelAnimationFrame(animationFrameId)
    }, [armies, provinces])

    // Get army for each province
    const armyByProvince = useMemo(() => {
        const map = new Map<string, Army>()
        armies.forEach(army => {
            map.set(army.currentProvinceId, army)
        })
        return map
    }, [armies])

    // Handle province click
    const handleProvinceClick = useCallback((provinceId: string) => {
        // If we have a selected army and click on a different province, move it
        if (selectedArmyId) {
            const selectedArmy = armies.find(a => a.id === selectedArmyId)
            if (selectedArmy && selectedArmy.currentProvinceId !== provinceId) {
                console.log(`🚶 Moving army ${selectedArmyId} to ${provinceId}`)
                moveArmy(selectedArmyId, provinceId)
                selectArmy(null) // Deselect army after move
            }
        }
        selectProvince(provinceId)
    }, [selectedArmyId, armies, selectProvince, moveArmy, selectArmy])

    // Handle army click
    const handleArmyClick = useCallback((e: React.MouseEvent, armyId: string) => {
        e.stopPropagation()
        selectArmy(selectedArmyId === armyId ? null : armyId)
    }, [selectedArmyId, selectArmy])

    // Map Panning Logic
    const [view, setView] = useState({ x: 0, y: 0, scale: 1.1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking background (not a hex)
        // Actually, we want to drag even on hexes if we hold, but for now let's allow drag everywhere
        // checking e.target might be needed if hex clicks conflict, but usually click vs drag is distinguished by movement
        setIsDragging(true)
        setDragStart({ x: e.clientX - view.x, y: e.clientY - view.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        e.preventDefault()
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        setView(prev => ({ ...prev, x: newX, y: newY }))
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation()

        const scaleAmount = 0.1
        const newScale = e.deltaY > 0
            ? Math.max(0.5, view.scale - scaleAmount)  // Zoom out, min 0.5
            : Math.min(3.0, view.scale + scaleAmount) // Zoom in, max 3.0

        setView(prev => ({ ...prev, scale: newScale }))
    }

    // Touch Support
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({ x: touch.clientX - view.x, y: touch.clientY - view.y })
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const touch = e.touches[0]
        // Prevent default only if necessary, but careful not to block scroll if intended
        // For game map, we usually want to block default scroll
        const newX = touch.clientX - dragStart.x
        const newY = touch.clientY - dragStart.y
        setView(prev => ({ ...prev, x: newX, y: newY }))
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    return (
        <div
            className="w-full h-full bg-[#0f1c23] relative overflow-hidden bg-grid-pattern cursor-grab active:cursor-grabbing touch-none select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1c23]/50 to-[#0f1c23] pointer-events-none z-10" />
            <div className="scanner-line z-20 pointer-events-none" />

            <MapDefs />

            {/* Pannable Container */}
            <div
                className="absolute transform transition-transform duration-75 ease-out origin-center will-change-transform"
                style={{
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` // Applied translation
                }}
            >
                {/* Centering wrapper relative to translation point */}
                <div className="relative p-20" style={{ width: 'max-content', height: 'max-content' }}>
                    <div className="relative">
                        {/* Path Visualization Layer (Behind Hexes) */}
                        <svg className="absolute inset-0 pointer-events-none z-0" style={{ overflow: 'visible' }}>
                            {selectedArmyId && hoveredProvinceId && (() => {
                                const army = armies.find(a => a.id === selectedArmyId)
                                if (!army) return null
                                const startProv = provinces.find(p => p.id === army.currentProvinceId)
                                const endProv = provinces.find(p => p.id === hoveredProvinceId)

                                if (startProv && endProv && startProv.id !== endProv.id) {
                                    // Calculate center points
                                    const x1 = startProv.coordX * 52 + (startProv.coordY % 2 === 1 ? 26 : 0) + 26
                                    const y1 = startProv.coordY * 45 + 30
                                    const x2 = endProv.coordX * 52 + (endProv.coordY % 2 === 1 ? 26 : 0) + 26
                                    const y2 = endProv.coordY * 45 + 30

                                    return (
                                        <g>
                                            <line
                                                x1={x1} y1={y1} x2={x2} y2={y2}
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeDasharray="10,10"
                                                strokeOpacity="0.6"
                                                className="animate-pulse"
                                            />
                                            <circle cx={x2} cy={y2} r="6" fill="white" fillOpacity="0.6" />
                                        </g>
                                    )
                                }
                                return null
                            })()}

                            {/* Existing Movements Visualization */}
                            {armies.filter(a => a.isMoving && a.destinationId).map(army => {
                                const startProv = provinces.find(p => p.id === army.currentProvinceId)
                                const endProv = provinces.find(p => p.id === army.destinationId)
                                if (!startProv || !endProv) return null

                                const x1 = startProv.coordX * 52 + (startProv.coordY % 2 === 1 ? 26 : 0) + 26
                                const y1 = startProv.coordY * 45 + 30
                                const x2 = endProv.coordX * 52 + (endProv.coordY % 2 === 1 ? 26 : 0) + 26
                                const y2 = endProv.coordY * 45 + 30

                                return (
                                    <g key={army.id}>
                                        <line
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke="#00aaff"
                                            strokeWidth="3"
                                            strokeDasharray="5,5"
                                            className="animate-dash"
                                        />
                                        <circle cx={x2} cy={y2} r="4" fill="#00aaff" />
                                    </g>
                                )
                            })}
                        </svg>

                        {provinces.map((province) => {
                            // Find army in this province
                            const army = armyByProvince.get(province.id)

                            return (
                                <HexTile
                                    key={province.id}
                                    province={province}
                                    isSelected={selectedProvinceId === province.id}
                                    isHovered={hoveredProvinceId === province.id}
                                    hasArmy={!!army}
                                    army={army}
                                    isArmySelected={army ? selectedArmyId === army.id : false}
                                    onClick={() => !isDragging && handleProvinceClick(province.id)} // Prevent click on drag
                                    onArmyClick={(e) => {
                                        if (isDragging) return
                                        army && handleArmyClick(e, army.id)
                                    }}
                                    onHover={(hover) => !isDragging && setHoveredProvince(hover ? province.id : null)}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Legend - Glassmorphism */}
            <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-lg text-xs text-zinc-300 backdrop-blur-md pointer-events-auto">
                <div className="font-bold mb-2 text-primary tracking-wide text-glow">TAC-MAP KEY</div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded border border-white/20 bg-gradient-to-br from-[#4ade80] to-[#166534]"></div>
                    <span className="text-zinc-300">Plains (Neutral)</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded border border-white/20 bg-gradient-to-br from-[#15803d] to-[#052e16]"></div>
                    <span className="text-green-400">Forest (+25% Def)</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded border border-white/20 bg-gradient-to-br from-[#9ca3af] to-[#374151]"></div>
                    <span className="text-zinc-400">Mountains (+50% Def)</span>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 pt-1.5">
                    <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center bg-amber-500 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M20 12V8h-2V6h-2v2H8V6H6v2H4v4H2v6h2v2h2v-2h12v2h2v-2h2v-6h-2z" /></svg>
                    </div>
                    <span className="text-amber-400 font-bold">Army Group</span>
                </div>
            </div>

        </div>
    )
}

// Default export for dynamic import compatibility
export default MapComponent2D
