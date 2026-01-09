'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { HUD, SideNav, ActionBar } from '@/components/ui/HUD'
import { Minimap } from '@/components/map/MapComponent'
import { PlayersPanel, ChatPanel, GameInfoPanel } from '@/components/ui/GamePanels'
import useSocket from '@/hooks/useSocket'
import { useUIStore } from '@/stores/uiStore'

// Dynamic import for Three.js to avoid SSR issues
const MapComponent = dynamic(
    () => import('@/components/map/MapComponent').then(mod => mod.MapComponent),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🎖️</div>
                    <div className="text-zinc-400">Loading map...</div>
                </div>
            </div>
        ),
    }
)

export default function GamePage() {
    const { isConnected, latency, joinGame } = useSocket()
    const [showRightPanel, setShowRightPanel] = useState(true)
    const { activePanel } = useUIStore()

    // Auto-join demo game when connected
    useEffect(() => {
        if (isConnected) {
            const userId = localStorage.getItem('userId')
            const username = localStorage.getItem('username')

            if (userId && username) {
                joinGame(
                    'demo-game-1',
                    userId,
                    username,
                    'USA',
                    '#4169E1'
                )
                console.log('🎮 Joining demo game...')
            } else {
                // If no login, create a guest session
                const guestId = `guest_${Date.now()}`
                const guestName = `Guest${Math.floor(Math.random() * 1000)}`
                localStorage.setItem('userId', guestId)
                localStorage.setItem('username', guestName)
                joinGame(
                    'demo-game-1',
                    guestId,
                    guestName,
                    'USA',
                    '#4169E1'
                )
                console.log('🎮 Joining as guest...')
            }
        }
    }, [isConnected, joinGame])

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
                    <MapComponent />

                    {/* Minimap */}
                    <div className="absolute bottom-20 right-4">
                        <Minimap />
                    </div>
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
