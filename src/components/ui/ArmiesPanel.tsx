'use client'

import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useUIStore } from '@/stores/uiStore'

interface ArmiesPanelProps {
    onClose: () => void
}

export function ArmiesPanel({ onClose }: ArmiesPanelProps) {
    const { armies } = useGameStore()
    const { playerId } = usePlayerStore()
    const { selectArmy } = useUIStore()

    const myArmies = Array.from(armies.values()).filter(a => a.playerId === playerId)

    return (
        <div className="fixed left-20 top-20 w-96 h-[600px] glass-panel rounded-lg border border-white/10 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">⚔️ Ejércitos</h2>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white text-2xl leading-none"
                >×</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {myArmies.length === 0 ? (
                    <div className="text-center text-zinc-400 py-8">
                        No tienes ejércitos reclutados
                    </div>
                ) : myArmies.map(army => {
                    const totalUnits = army.units.reduce((sum, u) => sum + u.quantity, 0)
                    const totalStrength = army.units.reduce((sum, u) => sum + u.quantity * u.strength, 0)
                    const primaryType = army.units.sort((a, b) => b.quantity - a.quantity)[0].type

                    const getIcon = (type: string) => {
                        switch (type) {
                            case 'infantry': return '🛡️'
                            case 'tank': return '🚜'
                            case 'artillery': return '🎯'
                            case 'fighter': return '✈️'
                            case 'battleship': return '🚢'
                            default: return '⚔️'
                        }
                    }

                    return (
                        <div
                            key={army.id}
                            onClick={() => { selectArmy(army.id); onClose(); }}
                            className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getIcon(primaryType)}</span>
                                    <div>
                                        <div className="font-bold text-white text-sm">{army.name || 'División'}</div>
                                        <div className="text-xs text-zinc-400">Provincia: {army.currentProvinceId}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-400">Fuerza</div>
                                    <div className="text-lg font-bold text-primary">{totalStrength}</div>
                                </div>
                            </div>

                            {/* Unit Breakdown */}
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                                {army.units.map(unit => (
                                    <div key={unit.type} className="flex items-center gap-1 text-xs">
                                        <span>{getIcon(unit.type)}</span>
                                        <span className="text-zinc-300">{unit.type}:</span>
                                        <span className="text-white font-mono">{unit.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {army.isMoving && (
                                <div className="mt-2 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs border border-blue-600/30">
                                    → En movimiento
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
