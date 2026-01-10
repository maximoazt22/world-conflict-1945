'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { PlayersPanel, ChatPanel, GameInfoPanel } from '@/components/ui/GamePanels'
import useSocket from '@/hooks/useSocket'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'
import { VictoryModal } from '@/components/ui/VictoryModal'

// Dynamic import for World Map
const WorldMapComponent = dynamic(
    () => import('@/components/map/WorldMapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🌍</div>
                    <div className="text-zinc-400">Cargando mapa del mundo...</div>
                </div>
            </div>
        ),
    }
)

export default function GamePage() {
    const { isConnected, latency, joinGame } = useSocket()
    const [showRightPanel, setShowRightPanel] = useState(true)
    const { setPlayer } = usePlayerStore()

    // Auto-join demo game when connected
    useEffect(() => {
        if (isConnected) {
            const userId = localStorage.getItem('userId')
            const username = localStorage.getItem('username')
            const nation = localStorage.getItem('nation') || 'USA'
            const color = localStorage.getItem('color') || '#4169E1'

            if (userId && username) {
                setPlayer({
                    playerId: userId,
                    username,
                    nation,
                    color,
                    isOnline: true
                })
                joinGame('demo-game-1', userId, username, nation, color)
                console.log(`🎮 Joining demo game as ${nation}...`)
            } else {
                const guestId = `guest_${Date.now()}`
                const guestName = `Guest${Math.floor(Math.random() * 1000)}`
                const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF']
                const randomColor = colors[Math.floor(Math.random() * colors.length)]
                localStorage.setItem('userId', guestId)
                localStorage.setItem('username', guestName)
                localStorage.setItem('nation', 'Guest')
                localStorage.setItem('color', randomColor)

                setPlayer({
                    playerId: guestId,
                    username: guestName,
                    nation: 'Guest',
                    color: randomColor,
                    isOnline: true
                })
                joinGame('demo-game-1', guestId, guestName, 'Guest', randomColor)
                console.log('🎮 Joining as guest...')
            }
        }
    }, [isConnected, joinGame, setPlayer])

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-zinc-950">
            {/* Connection Status Banner */}
            {!isConnected && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-zinc-900 px-4 py-2 rounded-lg font-semibold animate-pulse">
                    ⚡ Conectando al servidor de juego...
                </div>
            )}

            {/* Main Game Area - Full Screen Map */}
            <div className="absolute inset-0 flex">
                {/* Map Area - Takes most of the screen */}
                <main className={`flex-1 relative transition-all duration-300 ${showRightPanel ? 'mr-72' : 'mr-0'}`}>
                    <WorldMapComponent />
                </main>

                {/* Right Panel - Players & Chat */}
                {showRightPanel && (
                    <aside className="absolute right-0 top-0 bottom-0 w-72 bg-zinc-900/95 border-l border-zinc-800 p-3 overflow-y-auto">
                        <div className="space-y-3">
                            <GameInfoPanel />
                            <PlayersPanel />
                            <ChatPanel />
                        </div>
                    </aside>
                )}

                {/* Toggle Right Panel */}
                <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-zinc-800 text-zinc-400 px-1 py-4 rounded-l-lg hover:text-zinc-100 hover:bg-zinc-700 transition-colors z-20"
                    style={{ right: showRightPanel ? '288px' : '0' }}
                >
                    {showRightPanel ? '▶' : '◀'}
                </button>
            </div>

            {/* Latency Indicator */}
            {isConnected && (
                <div className="fixed bottom-2 left-2 text-[10px] text-zinc-500 font-mono z-50">
                    {latency}ms
                </div>
            )}

            {/* Victory Modal */}
            <VictoryModal />
        </div>
    )
}
