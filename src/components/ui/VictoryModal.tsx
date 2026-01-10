import React from 'react'
import { Trophy, RotateCcw } from 'lucide-react'
import { useGameStore } from '../../stores/gameStore'
import { useSocket } from '../../hooks/useSocket'

export function VictoryModal() {
    const winner = useGameStore(state => state.winner)
    const { socket } = useSocket()

    if (!winner) return null

    const handleRestart = () => {
        socket?.emit('game:restart')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f1c23] border-2 border-[#fbbf24] p-8 rounded-xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-[#fbbf24]/10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[#fbbf24]/20 rounded-full ring-4 ring-[#fbbf24]/50">
                            <Trophy size={64} className="text-[#fbbf24] animate-bounce" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-2 tracking-wider">VICTORIA</h2>

                    <div className="text-xl text-gray-300 mb-8">
                        El Imperio de <span className="text-[#fbbf24] font-bold">{winner.name}</span> ha conquistado el mundo.
                    </div>

                    <button
                        onClick={handleRestart}
                        className="group relative w-full px-6 py-4 bg-[#fbbf24] hover:bg-[#d97706] text-black font-bold text-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="relative">Reiniciar Partida</span>
                    </button>

                    <p className="mt-4 text-xs text-gray-500">
                        El servidor se reiniciará y se generará un nuevo mapa.
                    </p>
                </div>
            </div>
        </div>
    )
}
