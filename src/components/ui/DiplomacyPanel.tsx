'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'

interface DiplomacyPanelProps {
    onClose: () => void
}

export function DiplomacyPanel({ onClose }: DiplomacyPanelProps) {
    const { players } = useGameStore()
    const { playerId } = usePlayerStore()
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
    const [tradeGive, setTradeGive] = useState({ gold: 0, iron: 0, oil: 0, food: 0 })
    const [tradeReceive, setTradeReceive] = useState({ gold: 0, iron: 0, oil: 0, food: 0 })

    const otherPlayers = Array.from(players.values()).filter(p => p.id !== playerId)

    const handleDiplomacy = (targetId: string, action: 'war' | 'ally' | 'peace') => {
        // @ts-ignore
        window.socket?.emit(`diplomacy:${action}`, { targetPlayerId: targetId })
    }

    const handleTrade = () => {
        if (!selectedPlayer) return
        // @ts-ignore
        window.socket?.emit('trade:offer', {
            targetPlayerId: selectedPlayer,
            give: tradeGive,
            receive: tradeReceive
        })
        // Reset form
        setTradeGive({ gold: 0, iron: 0, oil: 0, food: 0 })
        setTradeReceive({ gold: 0, iron: 0, oil: 0, food: 0 })
    }

    return (
        <div className="fixed left-20 top-20 w-96 h-[600px] glass-panel rounded-lg border border-white/10 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">🤝 Diplomacia &amp; Comercio</h2>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white text-2xl leading-none"
                >×</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {otherPlayers.length === 0 ? (
                    <div className="text-center text-zinc-400 py-8">
                        No hay otros jugadores conectados
                    </div>
                ) : otherPlayers.map(player => (
                    <div key={player.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <span className="font-bold text-white">{player.username}</span>
                                <span className="text-xs text-zinc-400 ml-2">{player.nation}</span>
                            </div>
                            <div
                                className="w-4 h-4 rounded-full border-2 border-white/30"
                                style={{ backgroundColor: player.color }}
                            />
                        </div>

                        {/* Diplomatic Actions */}
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => handleDiplomacy(player.id, 'war')}
                                className="flex-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs border border-red-600/30"
                            >
                                ⚔️ Guerra
                            </button>
                            <button
                                onClick={() => handleDiplomacy(player.id, 'ally')}
                                className="flex-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs border border-green-600/30"
                            >
                                🤝 Alianza
                            </button>
                            <button
                                onClick={() => handleDiplomacy(player.id, 'peace')}
                                className="flex-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded text-xs border border-blue-600/30"
                            >
                                🕊️ Paz
                            </button>
                        </div>

                        {/* Trade Button */}
                        <button
                            onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                            className="w-full px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded text-xs border border-yellow-600/30"
                        >
                            💱 {selectedPlayer === player.id ? 'Cancelar Comercio' : 'Proponer Comercio'}
                        </button>

                        {/* Trade Form */}
                        {selectedPlayer === player.id && (
                            <div className="mt-3 p-3 bg-black/30 rounded border border-yellow-600/20">
                                <div className="text-xs text-yellow-400 mb-2">Tú das:</div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <input type="number" placeholder="💰 Oro" value={tradeGive.gold} onChange={e => setTradeGive({ ...tradeGive, gold: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="⚙️ Hierro" value={tradeGive.iron} onChange={e => setTradeGive({ ...tradeGive, iron: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="🛢️ Petróleo" value={tradeGive.oil} onChange={e => setTradeGive({ ...tradeGive, oil: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="🌾 Comida" value={tradeGive.food} onChange={e => setTradeGive({ ...tradeGive, food: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                </div>

                                <div className="text-xs text-yellow-400 mb-2">Recibes:</div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <input type="number" placeholder="💰 Oro" value={tradeReceive.gold} onChange={e => setTradeReceive({ ...tradeReceive, gold: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="⚙️ Hierro" value={tradeReceive.iron} onChange={e => setTradeReceive({ ...tradeReceive, iron: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="🛢️ Petróleo" value={tradeReceive.oil} onChange={e => setTradeReceive({ ...tradeReceive, oil: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                    <input type="number" placeholder="🌾 Comida" value={tradeReceive.food} onChange={e => setTradeReceive({ ...tradeReceive, food: Number(e.target.value) })} className="bg-white/10 px-2 py-1 rounded text-xs text-white" />
                                </div>

                                <button
                                    onClick={handleTrade}
                                    className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm font-bold"
                                >
                                    Enviar Oferta
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
