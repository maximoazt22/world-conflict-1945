'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { HUD, SideNav, ActionBar } from '@/components/ui/HUD'
import { PlayersPanel, ChatPanel, GameInfoPanel } from '@/components/ui/GamePanels'
import useSocket from '@/hooks/useSocket'
import { useUIStore } from '@/stores/uiStore'
import { usePlayerStore } from '@/stores/playerStore'

// Dynamic import for 2D Map
const MapComponent2D = dynamic(
    () => import('@/components/map/MapComponent2D'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🗺️</div>
                    <div className="text-zinc-400">Cargando mapa...</div>
                </div>
            </div>
        ),
    }
)

export default function GamePage() {
    const { isConnected, latency, joinGame } = useSocket()
    const [showRightPanel, setShowRightPanel] = useState(true)
    const { activePanel } = useUIStore()
    const { setPlayer } = usePlayerStore()

    // Auto-join demo game when connected
    useEffect(() => {
        if (isConnected) {
            const userId = localStorage.getItem('userId')
            const username = localStorage.getItem('username')
            const nation = localStorage.getItem('nation') || 'USA'
            const color = localStorage.getItem('color') || '#4169E1'

            if (userId && username) {
                // Initialize player store
                setPlayer({
                    playerId: userId,
                    username,
                    nation,
                    color,
                    isOnline: true
                })

                joinGame(
                    'demo-game-1',
                    userId,
                    username,
                    nation,
                    color
                )
                console.log(`🎮 Joining demo game as ${nation}...`)
            } else {
                // If no login, create a guest session with random nation
                const guestId = `guest_${Date.now()}`
                const guestName = `Guest${Math.floor(Math.random() * 1000)}`
                const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF']
                const randomColor = colors[Math.floor(Math.random() * colors.length)]
                localStorage.setItem('userId', guestId)
                localStorage.setItem('username', guestName)
                localStorage.setItem('nation', 'Guest')
                localStorage.setItem('color', randomColor)

                // Initialize guest in player store
                setPlayer({
                    playerId: guestId,
                    username: guestName,
                    nation: 'Guest',
                    color: randomColor,
                    isOnline: true
                })

                joinGame(
                    'demo-game-1',
                    guestId,
                    guestName,
                    'Guest',
                    randomColor
                )
                console.log('🎮 Joining as guest...')
            }
        }
    }, [isConnected, joinGame, setPlayer])

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-zinc-950">
            {/* Connection Status Banner */}
            {!isConnected && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-zinc-900 px-4 py-2 rounded-lg font-semibold animate-pulse">
                    ⚡ Conectando al servidor de juego...
                </div>
            )}

            {/* HUD - Top Bar */}
            <HUD />

            {/* Side Navigation */}
            <SideNav />

            {/* Main Content Area */}
            <div className="absolute inset-0 pt-14 pl-16 flex">
                {/* Map Area */}
                <main className={`flex-1 relative transition-all duration-300 ${showRightPanel ? 'mr-80' : 'mr-0'}`}>
                    <MapComponent2D />
                </main>

                {/* Right Panel - Players & Chat */}
                {showRightPanel && (
                    <aside className="absolute right-0 top-14 bottom-0 w-80 bg-zinc-900/50 border-l border-zinc-800 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Connection Info */}
                            <GameInfoPanel />

                            {/* Players List */}
                            <PlayersPanel />

                            {/* Chat */}
                            <ChatPanel />
                        </div>
                    </aside>
                )}

                {/* Toggle Right Panel */}
                <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-zinc-800 text-zinc-400 px-1 py-4 rounded-l-lg hover:text-zinc-100 hover:bg-zinc-700 transition-colors z-10"
                >
                    {showRightPanel ? '▶' : '◀'}
                </button>
            </div>

            {/* Action Bar - Bottom */}
            <ActionBar />

            {/* Latency Indicator (when connected) */}
            {isConnected && (
                <div className="fixed bottom-4 left-20 text-xs text-zinc-500">
                    🟢 {latency}ms
                </div>
            )}
        </div>
    )
}
