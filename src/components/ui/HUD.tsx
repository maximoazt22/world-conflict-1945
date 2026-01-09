'use client'

import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'
import { ResourceBar } from './ResourceCard'

export function HUD() {
    const { resources, currentTick, gameStatus, gameName } = useGameStore()
    const { username, nation, allianceName } = usePlayerStore()
    const { connectionStatus, latency } = useSessionStore()
    const { showMinimap, toggleMinimap, toggleNotifications, showNotifications } = useUIStore()

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
        <div className="fixed top-0 left-0 right-0 z-50">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-md">
                {/* Left: Game Info */}
                <div className="flex items-center gap-4 px-4 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-lg">🎖️</span>
                        <span className="text-zinc-100 font-semibold">
                            {gameName || 'WORLD CONFLICT 1945'}
                        </span>
                    </div>
                    {gameStatus && (
                        <span className={`
              px-2 py-0.5 rounded text-xs font-medium
              ${gameStatus === 'PLAYING' ? 'bg-green-500/20 text-green-400' : ''}
              ${gameStatus === 'WAITING' ? 'bg-yellow-500/20 text-yellow-400' : ''}
              ${gameStatus === 'ENDED' ? 'bg-red-500/20 text-red-400' : ''}
            `}>
                            {gameStatus}
                        </span>
                    )}
                </div>

                {/* Center: Resources */}
                <ResourceBar resources={resources} rates={rates} />

                {/* Right: Player Info & Controls */}
                <div className="flex items-center gap-4 px-4 py-2">
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
                        <button
                            className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors"
                            title="Settings"
                        >
                            ⚙️
                        </button>
                    </div>
                </div>
            </div>
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
            </nav>
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
        <div className="fixed bottom-0 left-16 right-0 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-md z-40">
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
