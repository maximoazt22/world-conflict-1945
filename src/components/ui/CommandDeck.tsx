'use client'

import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'
import useSocket from '@/hooks/useSocket'
import { useMemo } from 'react'

export function CommandDeck() {
    const { provinces, armies } = useGameStore()
    const { selectedProvinceId, selectedArmyId, selectProvince, selectArmy } = useUIStore()
    const { playerId } = usePlayerStore()
    const { recruitUnit, constructBuilding } = useSocket()

    // Resolve successful selections from store
    const selectedProvince = useMemo(() =>
        selectedProvinceId ? provinces.find(p => p.id === selectedProvinceId) : null,
        [selectedProvinceId, provinces])

    const selectedArmy = useMemo(() =>
        selectedArmyId ? armies.find(a => a.id === selectedArmyId) : null,
        [selectedArmyId, armies])

    // Determine context
    const isOwnProvince = selectedProvince?.ownerId === playerId
    const isOwnArmy = selectedArmy?.playerId === playerId

    if (!selectedProvince && !selectedArmy) {
        return (
            <div className="fixed bottom-0 left-0 right-0 h-32 glass-panel border-t border-white/10 flex items-center justify-center text-zinc-500 animate-pulse-glow z-40">
                <span className="tracking-widest uppercase text-sm">Escaneando mapa... Selecciona un objetivo</span>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-40 glass-panel border-t-2 border-primary/20 bg-[#0f1c23]/95 backdrop-blur-xl z-50 flex overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

            {/* LEFT PANEL: Context Info */}
            <div className="w-1/3 border-r border-white/5 p-4 flex flex-col relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent" />

                {selectedProvince ? (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-display text-glow truncate pr-2">
                                {selectedProvince.name}
                            </h2>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${isOwnProvince ? 'border-primary text-primary bg-primary/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                                {isOwnProvince ? 'Bajo tu control' : 'Territorio Hostil'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/10 shadow-inner shrink-0">
                                <span className="text-3xl filter drop-shadow animate-float">
                                    {selectedProvince.terrain === 'MOUNTAINS' ? '⛰️' : selectedProvince.terrain === 'FOREST' ? '🌲' : '🟩'}
                                </span>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Terreno</div>
                                <div className="text-sm font-bold text-zinc-200">{selectedProvince.terrain}</div>
                                <div className="text-[10px] text-primary/80 truncate">
                                    {selectedProvince.terrain === 'MOUNTAINS' ? 'Defensa +50%' :
                                        selectedProvince.terrain === 'FOREST' ? 'Defensa +25%' : 'Sin Bonus'}
                                </div>
                            </div>
                        </div>
                    </>
                ) : selectedArmy && (
                    <>
                        {(() => {
                            // Determine primary unit type (most numerous)
                            const primaryUnit = selectedArmy.units.reduce((prev, curr) =>
                                curr.quantity > prev.quantity ? curr : prev
                            )
                            const unitType = primaryUnit.type

                            // Unit-specific icons and labels
                            const unitConfig: Record<string, { icon: string; label: string; moveLabel: string; attackLabel: string }> = {
                                infantry: { icon: '🛡️', label: 'División de Infantería', moveLabel: 'Marchar', attackLabel: 'Asaltar' },
                                tank: { icon: '🚜', label: 'División Blindada', moveLabel: 'Blitzkrieg', attackLabel: 'Flanquear' },
                                artillery: { icon: '🎯', label: 'Batería de Artillería', moveLabel: 'Reposicionar', attackLabel: 'Bombardear' },
                                fighter: { icon: '✈️', label: 'Escuadrón Aéreo', moveLabel: 'Patrullar', attackLabel: 'Interceptar' },
                                battleship: { icon: '🚢', label: 'Flota Naval', moveLabel: 'Zarpar', attackLabel: 'Bloqueo' }
                            }

                            const config = unitConfig[unitType] || unitConfig.infantry

                            return (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-display text-glow truncate pr-2">
                                            {config.label}
                                        </h2>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${isOwnArmy ? 'border-primary text-primary bg-primary/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                                            {isOwnArmy ? 'Aliado' : 'Enemigo'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/10 shadow-inner shrink-0">
                                            <span className="text-3xl">{config.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Fuerza Total</div>
                                            <div className="text-sm font-bold text-zinc-200">{selectedArmy.units.reduce((sum, u) => sum + u.quantity, 0)} unidades</div>
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </>
                )}
            </div>

            {/* CENTER PANEL: Actions */}
            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                {selectedProvince && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                        <ResourceStat label="Oro" value={formatResource(selectedProvince.goldBonus || 0)} icon="🪙" color="text-amber-400" />
                        <ResourceStat label="Petróleo" value={formatResource(selectedProvince.oilBonus || 0)} icon="🛢️" color="text-orange-400" />
                        <ResourceStat label="Litio" value={formatResource(selectedProvince.lithiumBonus || 0)} icon="🔋" color="text-cyan-400" />
                        <ResourceStat label="Comida" value={formatResource(selectedProvince.foodBonus || 0)} icon="🌾" color="text-green-400" />
                    </div>
                )}

                <div className="flex items-center justify-center gap-3">
                    {selectedProvince && isOwnProvince && (
                        <>
                            <ActionButton
                                icon="🛡️"
                                label="Infantería"
                                cost={'5k💰\n2k🌾'}
                                onClick={() => recruitUnit(selectedProvince.id, 'infantry')}
                            />
                            <ActionButton
                                icon="🚜"
                                label="Tanque"
                                cost={'25k💰\n5k🛢️'}
                                onClick={() => recruitUnit(selectedProvince.id, 'tank')}
                                highlight
                            />
                        </>
                    )}

                    {selectedProvince && isOwnProvince && (
                        <>
                            <ActionButton
                                icon="🎯"
                                label="Artillería"
                                cost={'15k💰\n8k⚙️'}
                                onClick={() => recruitUnit(selectedProvince.id, 'artillery')}
                            />
                            <ActionButton
                                icon="✈️"
                                label="Aviación"
                                cost={'30k💰\n10k⚙️\n8k🛢️'}
                                onClick={() => recruitUnit(selectedProvince.id, 'fighter')}
                                highlight
                            />
                            <ActionButton
                                icon="🚢"
                                label="Marina"
                                cost={'50k💰\n20k⚙️\n15k🛢️'}
                                onClick={() => recruitUnit(selectedProvince.id, 'battleship')}
                                highlight
                            />
                        </>
                    )}

                    {selectedProvince && isOwnProvince && (
                        <>
                            <ActionButton
                                icon="🏭"
                                label="Industria"
                                cost={'20k💰\n10k⚙️\n5k🛢️'}
                                onClick={() => constructBuilding(selectedProvince.id, 'industry')}
                            />
                            <ActionButton
                                icon="🏰"
                                label="Bunker"
                                cost={'10k💰\n15k⚙️'}
                                onClick={() => constructBuilding(selectedProvince.id, 'bunker')}
                            />
                        </>
                    )}

                    {selectedArmy && isOwnArmy && (
                        <div className="flex gap-2">
                            <button className="w-24 h-24 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-2 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all active:scale-95 group">
                                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📍</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Mover</span>
                            </button>
                            <button className="w-24 h-24 flex flex-col items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-lg border-2 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all active:scale-95 group">
                                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">⚔️</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Atacar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Details */}
            <div className="w-1/4 border-l border-white/5 p-4 bg-black/20 relative">
                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={() => { selectProvince(null); selectArmy(null) }}
                        className="text-zinc-500 hover:text-white p-1"
                    >
                        ❌
                    </button>
                </div>

                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Reporte de Inteligencia</h3>
                <div className="text-xs text-zinc-400 font-mono leading-relaxed">
                    {selectedProvince && (
                        <>
                            <p>Ubicación estratégica en sector {selectedProvince.coordX},{selectedProvince.coordY}.</p>
                            <p className="mt-2">
                                {selectedProvince.terrain === 'MOUNTAINS' ? 'El terreno montañoso dificulta el avance de blindados pero favorece la defensa.' :
                                    selectedProvince.terrain === 'FOREST' ? 'Cobertura vegetal densa. Ideal para emboscadas de infantería.' :
                                        'Terreno abierto. Óptimo para despliegues rápidos mecanizados.'}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper for realistic resource formatting
const formatResource = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}m`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return val.toString()
}

function ResourceStat({ label, value, icon, color }: { label: string, value: number | string, icon: string, color: string }) {
    const displayValue = typeof value === 'number' ? formatResource(value) : value
    return (
        <div className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded border border-white/5">
            <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">{label}</span>
            </div>
            <span className={`font-mono text-sm font-bold ${color}`}>+{displayValue}</span>
        </div>
    )
}

function ActionButton({ icon, label, cost, onClick, highlight }: { icon: string, label: string, cost: string, onClick: () => void, highlight?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative w-24 h-24 flex flex-col items-center justify-center rounded-lg border transition-all active:scale-95 group
                ${highlight
                    ? 'bg-primary/20 hover:bg-primary/30 border-primary/50 hover:border-primary text-primary shadow-[0_0_15px_rgba(0,170,255,0.2)]'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 hover:border-zinc-500 text-zinc-300'}
            `}
        >
            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform opacity-90">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider mb-1">{label}</span>
            <span className="absolute bottom-1 right-2 text-[9px] font-mono opacity-60 text-right whitespace-pre-line leading-tight">{cost}</span>
        </button>
    )
}
