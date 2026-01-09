'use client'

import { useState, useEffect, useRef } from 'react'
import useSocket from '@/hooks/useSocket'

interface ChatMessage {
    id: string
    playerId: string
    playerName: string
    message: string
    timestamp: number
    type: 'global' | 'alliance' | 'private'
}

interface ConnectedPlayer {
    id: string
    username: string
    nation: string
    color: string
    isOnline: boolean
}

export function PlayersPanel() {
    const { isConnected } = useSocket()
    const [players, setPlayers] = useState<ConnectedPlayer[]>([])

    // Listen for player updates (would connect to socket events)
    useEffect(() => {
        // Demo players for now
        if (isConnected) {
            setPlayers([
                { id: 'demo_001', username: 'demo', nation: 'USA', color: '#4169E1', isOnline: true },
            ])
        }
    }, [isConnected])

    return (
        <div className="bg-zinc-800/90 border border-zinc-700 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                <span>👥</span>
                <span>Jugadores ({players.length})</span>
            </h3>

            <div className="space-y-2">
                {players.map((player) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50"
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-500' : 'bg-zinc-500'}`}
                        />
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: player.color + '40', color: player.color }}
                        >
                            {player.nation.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-100 truncate">
                                {player.username}
                            </div>
                            <div className="text-xs text-zinc-500">
                                {player.nation}
                            </div>
                        </div>
                    </div>
                ))}

                {players.length === 0 && (
                    <div className="text-sm text-zinc-500 text-center py-4">
                        Esperando jugadores...
                    </div>
                )}
            </div>

            {isConnected && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                    <button className="w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-500/30 transition-colors">
                        + Invitar Jugador
                    </button>
                </div>
            )}
        </div>
    )
}

export function ChatPanel() {
    const { isConnected, sendChat } = useSocket()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [activeTab, setActiveTab] = useState<'global' | 'alliance'>('global')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Listen for incoming messages (from socket)
    useEffect(() => {
        // Demo message
        if (isConnected && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    playerId: 'system',
                    playerName: '🎖️ Sistema',
                    message: '¡Bienvenido a WORLD CONFLICT 1945! Usa el chat para comunicarte con otros jugadores.',
                    timestamp: Date.now(),
                    type: 'global',
                },
            ])
        }
    }, [isConnected, messages.length])

    const handleSend = () => {
        if (!inputText.trim() || !isConnected) return

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            playerId: localStorage.getItem('userId') || 'unknown',
            playerName: localStorage.getItem('username') || 'Jugador',
            message: inputText.trim(),
            timestamp: Date.now(),
            type: activeTab,
        }

        // Add locally
        setMessages((prev) => [...prev, newMessage])

        // Send to server
        sendChat(inputText.trim(), activeTab)

        setInputText('')
    }

    return (
        <div className="bg-zinc-800/90 border border-zinc-700 rounded-xl backdrop-blur-sm flex flex-col h-80">
            {/* Tabs */}
            <div className="flex border-b border-zinc-700">
                {(['global', 'alliance'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? 'text-amber-400 border-b-2 border-amber-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {tab === 'global' ? '🌍 Global' : '🤝 Alianza'}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages
                    .filter((m) => m.type === activeTab || m.type === 'global')
                    .map((msg) => (
                        <div key={msg.id} className="text-sm">
                            <span className="font-semibold text-amber-400">{msg.playerName}: </span>
                            <span className="text-zinc-300">{msg.message}</span>
                        </div>
                    ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isConnected ? 'Escribe un mensaje...' : 'Conectando...'}
                        disabled={!isConnected}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!isConnected || !inputText.trim()}
                        className="px-4 py-2 bg-amber-500 text-zinc-900 rounded-lg font-semibold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}

export function GameInfoPanel() {
    const { isConnected, latency } = useSocket()

    return (
        <div className="bg-zinc-800/90 border border-zinc-700 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                <span>🎮</span>
                <span>Info del Juego</span>
            </h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-zinc-500">Estado:</span>
                    <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Latencia:</span>
                    <span className="text-zinc-100">{latency}ms</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Partida:</span>
                    <span className="text-zinc-100">demo-game-1</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Servidor:</span>
                    <span className="text-zinc-100">ws://localhost:3001</span>
                </div>
            </div>
        </div>
    )
}
