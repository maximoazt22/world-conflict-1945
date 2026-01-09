'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore, type Province } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'

// ============================================
// PROVINCE MESH
// ============================================

interface ProvinceMeshProps {
    province: Province
    isSelected: boolean
    isHovered: boolean
    isOwned: boolean
    onClick: () => void
    onHover: (hover: boolean) => void
}

function ProvinceMesh({ province, isSelected, isHovered, isOwned, onClick, onHover }: ProvinceMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Determine color
    const color = useMemo(() => {
        if (isSelected) return '#FFD700' // Gold for selected
        if (province.ownerColor) return province.ownerColor
        if (isOwned) return '#4A5D4F' // Dark green for own
        return '#708090' // Slate gray for neutral
    }, [isSelected, isOwned, province.ownerColor])

    // Animation for selected/hovered
    useFrame((state) => {
        if (meshRef.current) {
            const targetY = isSelected || isHovered ? 0.3 : 0
            meshRef.current.position.y = THREE.MathUtils.lerp(
                meshRef.current.position.y,
                targetY,
                0.1
            )
        }
    })

    return (
        <group position={[province.coordX, 0, province.coordY]}>
            {/* Province Hexagon */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                onPointerEnter={() => onHover(true)}
                onPointerLeave={() => onHover(false)}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.8, 0.9, 0.3, 6]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={isHovered ? 0.9 : 0.75}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* Selection Ring */}
            {isSelected && (
                <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.85, 0.95, 32]} />
                    <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Province Name Label */}
            {(isSelected || isHovered) && (
                <Html
                    position={[0, 0.8, 0]}
                    center
                    style={{
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div className="px-2 py-1 bg-zinc-900/90 rounded text-xs text-white border border-zinc-700">
                        {province.name}
                        {province.ownerName && (
                            <span className="text-zinc-400 ml-1">({province.ownerName})</span>
                        )}
                    </div>
                </Html>
            )}

            {/* Building Indicator */}
            {province.buildings.length > 0 && (
                <mesh position={[0.4, 0.3, 0.4]}>
                    <boxGeometry args={[0.15, 0.3, 0.15]} />
                    <meshStandardMaterial color="#8B4513" />
                </mesh>
            )}

            {/* Units Indicator */}
            {province.units.length > 0 && (
                <mesh position={[-0.4, 0.25, -0.4]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="#CD5C5C" />
                </mesh>
            )}
        </group>
    )
}

// ============================================
// ARMY MESH COMPONENT
// ============================================

interface ArmyMeshProps {
    army: {
        id: string
        playerId: string
        playerColor: string
        name: string
        currentProvinceId: string
        units: { type: string; quantity: number; strength: number }[]
    }
    position: [number, number, number]
    isSelected: boolean
    onClick: () => void
}

function ArmyMesh({ army, position, isSelected, onClick }: ArmyMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Floating animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        }
    })

    return (
        <group position={position}>
            {/* Army Icon (Tank/Soldier) */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                castShadow
            >
                <coneGeometry args={[0.25, 0.5, 4]} />
                <meshStandardMaterial
                    color={army.playerColor || '#FFD700'}
                    metalness={0.6}
                    roughness={0.3}
                    emissive={isSelected ? '#FFD700' : army.playerColor || '#FFD700'}
                    emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
            </mesh>

            {/* Selection Ring */}
            {isSelected && (
                <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.3, 0.4, 16]} />
                    <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Army Name Label */}
            <Html
                position={[0, 1.2, 0]}
                center
                style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
                <div className="px-1.5 py-0.5 bg-zinc-900/90 rounded text-[10px] text-white border border-zinc-600">
                    ⚔️ {army.units.reduce((sum, u) => sum + u.quantity, 0)} units
                </div>
            </Html>
        </group>
    )
}

// ============================================
// MAP SCENE
// ============================================

function MapScene() {
    const { provinces, playerId, mapSeed, setProvinces, pendingMapUpdates, armies } = useGameStore()
    const { selectedProvinceId, selectProvince, hoveredProvinceId, setHoveredProvince, selectedArmyId, selectArmy } = useUIStore()
    const { color: playerColor } = usePlayerStore()

    // Seeded Random Helper (Mulberry32)
    const mulberry32 = (a: number) => {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // Generate provinces if none exist AND we have a seed
    useEffect(() => {
        if (provinces.length === 0 && mapSeed !== null) {
            console.log("Generating map with seed:", mapSeed);
            const random = mulberry32(mapSeed);

            const demo: Province[] = []
            const gridSize = 10 // Increased size for better map

            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    // Offset every other row for hex pattern
                    const offsetX = y % 2 === 0 ? 0 : 0.9
                    const terrainType = random() > 0.8 ? 'MOUNTAINS' : random() > 0.6 ? 'FOREST' : 'PLAINS'

                    // Create base province
                    const province: Province = {
                        id: `${x}-${y}`,
                        name: `Provincia ${x}-${y}`,
                        coordX: x * 1.8 + offsetX - gridSize + 2,
                        coordY: y * 1.5 - gridSize + 2,
                        coordZ: 0,
                        ownerId: null, // Default neutral
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

            // Apply any pending updates from server (e.g. captured provinces)
            if (pendingMapUpdates.length > 0) {
                console.log("Applying pending map updates:", pendingMapUpdates.length);
                pendingMapUpdates.forEach(update => {
                    const target = demo.find(p => p.id === update.id);
                    if (target) {
                        if (update.ownerId !== undefined) target.ownerId = update.ownerId;
                        if (update.ownerColor !== undefined) target.ownerColor = update.ownerColor;
                    }
                });
            }

            setProvinces(demo)
        }
    }, [mapSeed, provinces.length, setProvinces, pendingMapUpdates])

    // Memoize provinces for rendering
    const displayProvinces = useMemo(() => provinces, [provinces]);

    // Get army positions based on their current province
    const armyPositions = useMemo(() => {
        return armies.map(army => {
            const province = provinces.find(p => p.id === army.currentProvinceId)
            if (!province) return null
            return {
                army,
                position: [province.coordX, 0, province.coordY] as [number, number, number]
            }
        }).filter(Boolean)
    }, [armies, provinces])

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={0.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.3} color="#FFE4B5" />

            {/* Ground Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#1a2520" />
            </mesh>

            {/* Grid Lines */}
            <gridHelper args={[100, 50, '#2a3a35', '#1a2a25']} position={[0, -0.15, 0]} />

            {/* Provinces */}
            {displayProvinces.map((province) => (
                <ProvinceMesh
                    key={province.id}
                    province={province}
                    isSelected={selectedProvinceId === province.id}
                    isHovered={hoveredProvinceId === province.id}
                    isOwned={province.ownerId === playerId}
                    onClick={() => selectProvince(province.id)}
                    onHover={(hover) => setHoveredProvince(hover ? province.id : null)}
                />
            ))}

            {/* Armies */}
            {(armyPositions as Array<{ army: ArmyMeshProps['army']; position: [number, number, number] }>).map((item) => (
                <ArmyMesh
                    key={item.army.id}
                    army={item.army}
                    position={item.position}
                    isSelected={selectedArmyId === item.army.id}
                    onClick={() => selectArmy(item.army.id)}
                />
            ))}

            {/* Camera Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 6}
            />
        </>
    )
}

// ============================================
// MAP COMPONENT (Main Export)
// ============================================

export function MapComponent() {
    return (
        <div className="w-full h-full bg-zinc-950">
            <Canvas
                shadows
                camera={{
                    position: [0, 15, 20],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                }}
            >
                <color attach="background" args={['#0a0f0d']} />
                <fog attach="fog" args={['#0a0f0d', 30, 80]} />
                <MapScene />
            </Canvas>
        </div>
    )
}

// ============================================
// MINIMAP
// ============================================

export function Minimap() {
    const { provinces, playerId } = useGameStore()
    const { selectedProvinceId, selectProvince, showMinimap } = useUIStore()

    if (!showMinimap) return null

    // Calculate bounds
    const bounds = useMemo(() => {
        if (provinces.length === 0) {
            return { minX: -10, maxX: 10, minY: -10, maxY: 10 }
        }
        return {
            minX: Math.min(...provinces.map(p => p.coordX)) - 1,
            maxX: Math.max(...provinces.map(p => p.coordX)) + 1,
            minY: Math.min(...provinces.map(p => p.coordY)) - 1,
            maxY: Math.max(...provinces.map(p => p.coordY)) + 1,
        }
    }, [provinces])

    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY

    return (
        <div className="fixed bottom-4 right-4 w-48 h-48 bg-zinc-900/90 border border-zinc-700 rounded-lg overflow-hidden z-40">
            <div className="relative w-full h-full">
                {provinces.map((province) => {
                    const x = ((province.coordX - bounds.minX) / width) * 100
                    const y = ((province.coordY - bounds.minY) / height) * 100
                    const isOwned = province.ownerId === playerId
                    const isSelected = selectedProvinceId === province.id

                    return (
                        <button
                            key={province.id}
                            className={`
                absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-150
                ${isSelected ? 'ring-2 ring-amber-400 scale-150' : ''}
              `}
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                backgroundColor: province.ownerColor || (isOwned ? '#4A5D4F' : '#708090'),
                            }}
                            onClick={() => selectProvince(province.id)}
                        />
                    )
                })}
            </div>
            <div className="absolute bottom-1 left-2 text-xs text-zinc-500">
                Minimap
            </div>
        </div>
    )
}
