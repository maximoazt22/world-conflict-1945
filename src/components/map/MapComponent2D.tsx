'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useGameStore, Province, Army } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'
import useSocket from '@/hooks/useSocket'

// ============================================
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
    // Determine hex color based on ownership
    const hexColor = useMemo(() => {
        if (province.ownerColor) return province.ownerColor
        // Terrain-based neutral colors
        if (province.terrain === 'MOUNTAINS') return '#5a5a6a'
        if (province.terrain === 'FOREST') return '#3d5a3d'
        return '#6b7280' // Plains - gray
    }, [province.ownerColor, province.terrain])

    const borderColor = isSelected ? '#fbbf24' : isHovered ? '#60a5fa' : '#374151'
    const scale = isSelected || isHovered ? 1.05 : 1

    return (
        <div
            className="hex-container"
            style={{
                position: 'absolute',
                left: `${province.coordX * 52 + (province.coordY % 2 === 1 ? 26 : 0)}px`,
                top: `${province.coordY * 45}px`,
                transform: `scale(${scale})`,
                transition: 'transform 0.15s ease-out',
                zIndex: isSelected ? 10 : isHovered ? 5 : 1,
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >
            {/* Hexagon Shape */}
            <svg width="52" height="60" viewBox="0 0 52 60" className="hex-svg">
                <polygon
                    points="26,0 52,15 52,45 26,60 0,45 0,15"
                    fill={hexColor}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{ opacity: isHovered ? 1 : 0.85 }}
                />
                {/* Terrain indicator */}
                {province.terrain === 'MOUNTAINS' && (
                    <text x="26" y="25" textAnchor="middle" fill="#fff" fontSize="14">⛰️</text>
                )}
                {province.terrain === 'FOREST' && (
                    <text x="26" y="25" textAnchor="middle" fill="#fff" fontSize="14">🌲</text>
                )}
            </svg>

            {/* Province Label (on hover/select) */}
            {(isSelected || isHovered) && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900/95 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-zinc-700 z-20">
                    {province.name}
                    {province.ownerId && <span className="text-amber-400 ml-1">⚔️</span>}
                </div>
            )}

            {/* Army Icon */}
            {hasArmy && army && (
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer
                        ${isArmySelected ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900' : ''}`}
                    onClick={onArmyClick}
                >
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2"
                        style={{
                            backgroundColor: army.playerColor || '#fbbf24',
                            borderColor: isArmySelected ? '#fbbf24' : '#1f2937',
                        }}
                    >
                        ⚔️
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-white bg-zinc-800/90 px-1 rounded">
                        {army.units.reduce((sum, u) => sum + u.quantity, 0)}
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================
// MAIN MAP COMPONENT
// ============================================

export function MapComponent2D() {
    const { provinces, playerId, mapSeed, setProvinces, pendingMapUpdates, armies } = useGameStore()
    const { selectedProvinceId, selectProvince, hoveredProvinceId, setHoveredProvince, selectedArmyId, selectArmy } = useUIStore()
    const { color: playerColor } = usePlayerStore()
    const { moveArmy } = useSocket()

    // Seeded Random Helper (Mulberry32)
    const mulberry32 = useCallback((a: number) => {
        return function () {
            let t = a += 0x6D2B79F5
            t = Math.imul(t ^ t >>> 15, t | 1)
            t ^= t + Math.imul(t ^ t >>> 7, t | 61)
            return ((t ^ t >>> 14) >>> 0) / 4294967296
        }
    }, [])

    // Generate provinces if needed
    useEffect(() => {
        if (provinces.length === 0 && mapSeed !== null) {
            console.log("🗺️ Generating 2D map with seed:", mapSeed)
            const random = mulberry32(mapSeed)
            const demo: Province[] = []
            const gridSize = 10

            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    const terrainRoll = random()
                    const terrainType = terrainRoll > 0.8 ? 'MOUNTAINS' : terrainRoll > 0.6 ? 'FOREST' : 'PLAINS'

                    const province: Province = {
                        id: `${x}-${y}`,
                        name: `${String.fromCharCode(65 + x)}${y + 1}`,
                        coordX: x,
                        coordY: y,
                        coordZ: 0,
                        ownerId: null,
                        ownerName: undefined,
                        ownerColor: undefined,
                        goldBonus: Math.floor(random() * 10) + 5,
                        ironBonus: Math.floor(random() * 5) + 1,
                        oilBonus: Math.floor(random() * 3),
                        foodBonus: Math.floor(random() * 8) + 2,
                        defenseBonus: terrainType === 'MOUNTAINS' ? 50 : terrainType === 'FOREST' ? 25 : 0,
                        terrain: terrainType,
                        buildings: [],
                        units: [],
                    }
                    demo.push(province)
                }
            }

            // Apply server updates (ownership)
            if (pendingMapUpdates.length > 0) {
                pendingMapUpdates.forEach(update => {
                    const target = demo.find(p => p.id === update.id)
                    if (target) {
                        if (update.ownerId !== undefined) target.ownerId = update.ownerId
                        if (update.ownerColor !== undefined) target.ownerColor = update.ownerColor
                    }
                })
            }

            setProvinces(demo)
        }
    }, [mapSeed, provinces.length, setProvinces, pendingMapUpdates, mulberry32])

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

    return (
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
            {/* Map Container with pan/zoom */}
            <div
                className="absolute inset-0 overflow-auto"
                style={{ padding: '100px' }}
            >
                <div
                    className="relative"
                    style={{
                        width: `${10 * 52 + 26}px`,
                        height: `${10 * 45 + 60}px`,
                        minWidth: '600px',
                        minHeight: '550px',
                    }}
                >
                    {provinces.map(province => {
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
                                onClick={() => handleProvinceClick(province.id)}
                                onArmyClick={(e) => army && handleArmyClick(e, army.id)}
                                onHover={(hover) => setHoveredProvince(hover ? province.id : null)}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-zinc-900/90 p-3 rounded-lg border border-zinc-700 text-xs text-zinc-300">
                <div className="font-semibold mb-2 text-white">Leyenda</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                    <span>Llanura (neutral)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3d5a3d' }}></div>
                    <span>🌲 Bosque (+25% def)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5a5a6a' }}></div>
                    <span>⛰️ Montaña (+50% def)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px]">⚔️</div>
                    <span>Ejército</span>
                </div>
            </div>

            {/* Selected Province Info */}
            {selectedProvinceId && (
                <div className="absolute top-4 right-4 bg-zinc-900/95 p-4 rounded-lg border border-zinc-700 w-64">
                    {(() => {
                        const p = provinces.find(pr => pr.id === selectedProvinceId)
                        if (!p) return null
                        return (
                            <>
                                <div className="font-bold text-amber-400 mb-2">{p.name}</div>
                                <div className="text-xs text-zinc-400 space-y-1">
                                    <div>Terreno: {p.terrain === 'MOUNTAINS' ? '⛰️ Montaña' : p.terrain === 'FOREST' ? '🌲 Bosque' : '🏞️ Llanura'}</div>
                                    <div>Defensa: +{p.defenseBonus}%</div>
                                    <div className="pt-2 border-t border-zinc-700 mt-2">
                                        <span className="text-amber-400">💰</span> +{p.goldBonus}/h
                                        <span className="text-zinc-500 ml-2">⚙️</span> +{p.ironBonus}/h
                                    </div>
                                    {p.ownerId ? (
                                        <div className="text-green-400">✅ Conquistada</div>
                                    ) : (
                                        <div className="text-zinc-500">⚪ Neutral</div>
                                    )}
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}

// Default export for dynamic import compatibility
export default MapComponent2D
