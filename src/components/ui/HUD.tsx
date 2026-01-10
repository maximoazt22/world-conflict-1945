'use client'

import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'
import useSocket from '@/hooks/useSocket'
import { ResourceBar } from './ResourceCard'
import { DiplomacyPanel } from './DiplomacyPanel'
import { DashboardPanel } from './DashboardPanel'
import { ArmiesPanel } from './ArmiesPanel'

export function HUD() {
    const { resources, currentTick, gameStatus, gameName } = useGameStore()
    const { username, nation, allianceName } = usePlayerStore()
    const { connectionStatus, latency } = useSessionStore()
    const { showMinimap, toggleMinimap, toggleNotifications, showNotifications } = useUIStore()
    const { restartGame } = useSocket()

    // Calculate rates (placeholder - would come from server)
    const rates = {
        gold: 10,
        iron: 5,
        oil: 2.5,
        food: 7.5,
    }

    const getConnectionColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-500'
            case 'connecting':
            case 'reconnecting': return 'bg-yellow-500'
            default: return 'bg-red-500'
        }
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* Top Bar - Glass Panel */}
            <div className="pointer-events-auto flex items-center justify-between glass-panel border-b border-white/5 px-4 py-2">
                {/* Left: Game Info */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-primary text-xl animate-pulse-glow">✪</span>
                        <h1 className="text-white font-bold tracking-widest text-lg text-glow uppercase">
                            {gameName || 'GLOBAL COMMAND'}
                        </h1>
                    </div>
                    {gameStatus && (
                        <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/40 border border-white/10">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${gameStatus === 'PLAYING' ? 'bg-primary shadow-[0_0_8px_#00aaff]' :
                                gameStatus === 'ENDED' ? 'bg-alert-red shadow-[0_0_8px_#E03D3D]' : 'bg-warn-amber'
                                }`} />
                            <span className="text-xs font-mono font-bold tracking-wider text-white/80">
                                DEFCON {gameStatus === 'PLAYING' ? '3' : '1'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Center: Resources */}
                <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                    <ResourceBar resources={resources} rates={rates} />
                </div>

                {/* Right: Player Info & Controls */}
                <div className="flex items-center gap-4">
                    {/* Player Info */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">{nation}</span>
                        <span className="text-zinc-100 font-medium">{username}</span>
                        {allianceName && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                [{allianceName}]
                            </span>
                        )}
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`} />
                        <span className="text-xs text-zinc-500">{latency}ms</span>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleMinimap}
                            className={`
                p-2 rounded-lg transition-colors
                ${showMinimap ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800'}
              `}
                            title="Toggle Minimap"
                        >
                            🗺️
                        </button>
                        <button
                            onClick={toggleNotifications}
                            className={`
                p-2 rounded-lg transition-colors
                ${showNotifications ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800'}
              `}
                            title="Toggle Notifications"
                        >
                            🔔
                        </button>

                        {gameStatus === 'ENDED' && (
                            <button
                                onClick={restartGame}
                                className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors animate-pulse"
                                title="Reiniciar Partida"
                            >
                                🔄
                            </button>
                        )}
                        <button
                            className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors"
                            title="Settings"
                        >
                            ⚙️
                        </button>
                    </div>
                </div>
            </div>
            {/* Game Over / Restart Overlay */}
            {gameStatus === 'ENDED' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-6 max-w-md w-full border-2 border-primary/50 shadow-[0_0_50px_rgba(0,170,255,0.3)]">
                        <div className="text-6xl animate-pulse">☢️</div>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2 text-glow tracking-widest uppercase">MISION CUMPLIDA</h2>
                            <p className="text-zinc-400">La partida ha finalizado.</p>
                        </div>

                        <button
                            onClick={restartGame}
                            className="bg-primary hover:bg-primary/80 text-black font-bold text-xl py-4 px-12 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,170,255,0.5)] uppercase tracking-wider"
                        >
                            REINICIAR SISTEMA
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Side Panel Navigation
export function SideNav() {
    const { activePanel, setActivePanel } = useUIStore()
    const { unreadMessages } = useUIStore()

    const navItems: Array<{ id: string; icon: string; label: string; badge?: number }> = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'army', icon: '⚔️', label: 'Ejércitos' },
        { id: 'construction', icon: '🏗️', label: 'Construcción' },
        { id: 'diplomacy', icon: '🤝', label: 'Diplomacia' },
        { id: 'chat', icon: '💬', label: 'Chat', badge: unreadMessages.global + unreadMessages.alliance + unreadMessages.private },
    ]

    const handlePurchase = async () => {
        try {
            // Use correct backend URL (Railway)
            const isProd = process.env.NODE_ENV === 'production'
            const backendUrl = isProd
                ? 'https://world-conflict-1945-production.up.railway.app'
                : 'http://localhost:3001'

            const response = await fetch(`${backendUrl}/create_preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "War Bonds: 100k Gold",
                    quantity: 1,
                    price: 500
                })
            })

            // Fallback removed as we are using correct URLs now
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.sandbox_init_point) {
                window.open(data.sandbox_init_point, '_blank')
            }
        } catch (err) {
            console.error("Payment Error", err)
            alert("Error conectando con el servidor de pagos")
        }
    }

    return (
        <div className="fixed left-0 top-16 bottom-0 w-16 bg-zinc-900/95 border-r border-zinc-800 backdrop-blur-md z-40">
            <nav className="flex flex-col items-center py-4 gap-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActivePanel(item.id as typeof activePanel)}
                        className={`
              relative w-12 h-12 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${activePanel === item.id
                                ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}
            `}
                        title={item.label}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </button>
                ))}

                {/* Store Button (Mercado Pago) */}
                <button
                    onClick={handlePurchase}
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/30"
                    title="Tienda de Bonos"
                >
                    <span className="text-xl">🛒</span>
                </button>
            </nav>

            {/* Render Active Panel */}
            {activePanel === 'dashboard' && <DashboardPanel onClose={() => setActivePanel(null)} />}
            {activePanel === 'army' && <ArmiesPanel onClose={() => setActivePanel(null)} />}
            {activePanel === 'diplomacy' && <DiplomacyPanel onClose={() => setActivePanel(null)} />}
        </div>
    )
}

// Bottom Action Bar
export function ActionBar() {
    const { selectedProvinceId, selectedArmyId } = useUIStore()
    const { armies } = useGameStore()

    const selectedArmy = selectedArmyId
        ? armies.find(a => a.id === selectedArmyId)
        : null

    if (!selectedProvinceId && !selectedArmyId) return null

    return (
        <div className="fixed bottom-0 left-16 right-0 glass-panel border-t border-white/5 backdrop-blur-md z-40">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Selection Info */}
                <div className="flex items-center gap-4">
                    {selectedProvinceId && (
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500">🏰</span>
                            <span className="text-zinc-100">Province Selected</span>
                        </div>
                    )}
                    {selectedArmy && (
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500">⚔️</span>
                            <span className="text-zinc-100">{selectedArmy.name || 'Army'}</span>
                            <span className="text-zinc-400 text-sm">
                                ({selectedArmy.units.length} units)
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {selectedArmyId && (
                        <>
                            <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                                🚶 Mover
                            </button>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                                ⚔️ Atacar
                            </button>
                        </>
                    )}
                    {selectedProvinceId && (
                        <>
                            <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                                🏗️ Construir
                            </button>
                            <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors">
                                🪖 Reclutar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
