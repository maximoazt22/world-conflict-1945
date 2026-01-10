'use client'

import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'

interface DashboardPanelProps {
    onClose: () => void
}

export function DashboardPanel({ onClose }: DashboardPanelProps) {
    const { provinces, armies, players, currentTick } = useGameStore()
    const { playerId } = usePlayerStore()

    const myProvinces = Array.from(provinces.values()).filter(p => p.ownerId === playerId)
    const myArmies = Array.from(armies.values()).filter(a => a.playerId === playerId)
    const totalUnits = myArmies.reduce((sum, army) => sum + army.units.reduce((s, u) => s + u.quantity, 0), 0)

    return (
        <div className="fixed left-20 top-20 w-96 h-[600px] glass-panel rounded-lg border border-white/10 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">📊 Dashboard</h2>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white text-2xl leading-none"
                >×</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Game Stats */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-primary mb-3">Estado del Juego</h3>
                    <div className="space-y-2 text-sm text-zinc-300">
                        <div className="flex justify-between">
                            <span>Tick actual:</span>
                            <span className="text-white font-mono">{currentTick}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Jugadores conectados:</span>
                            <span className="text-white font-mono">{Array.from(players.values()).length}</span>
                        </div>
                    </div>
                </div>

                {/* My Empire Stats */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-primary mb-3">Tu Imperio</h3>
                    <div className="space-y-2 text-sm text-zinc-300">
                        <div className="flex justify-between">
                            <span>🗺️ Provincias:</span>
                            <span className="text-white font-mono font-bold">{myProvinces.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>⚔️ Ejércitos:</span>
                            <span className="text-white font-mono font-bold">{myArmies.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>👥 Unidades totales:</span>
                            <span className="text-white font-mono font-bold">{totalUnits}</span>
                        </div>
                    </div>
                </div>

                {/* Rankings */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-primary mb-3">Clasificación</h3>
                    <div className="space-y-2">
                        {Array.from(players.values())
                            .sort((a, b) => {
                                const aProvinces = Array.from(provinces.values()).filter(p => p.ownerId === a.id).length
                                const bProvinces = Array.from(provinces.values()).filter(p => p.ownerId === b.id).length
                                return bProvinces - aProvinces
                            })
                            .map((player, index) => {
                                const playerProvinces = Array.from(provinces.values()).filter(p => p.ownerId === player.id).length
                                return (
                                    <div key={player.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 font-mono w-4">#{index + 1}</span>
                                            <div
                                                className="w-3 h-3 rounded-full border border-white/30"
                                                style={{ backgroundColor: player.color }}
                                            />
                                            <span className={player.id === playerId ? 'text-primary font-bold' : 'text-zinc-300'}>
                                                {player.username}
                                            </span>
                                        </div>
                                        <span className="text-white font-mono">{playerProvinces} provincias</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
