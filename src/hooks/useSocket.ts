'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import { useSessionStore } from '@/stores/sessionStore'

// Socket instance (singleton)
let socket: Socket | null = null

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [latency, setLatency] = useState(0)

    const {
        setGameInfo,
        updateResources,
        setCurrentTick,
        updateProvince,
        addBattle,
        updateBattle,
    } = useGameStore()

    const {
        setConnectionStatus,
        updatePing,
    } = useSessionStore()

    // Initialize socket connection
    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

        if (!socket) {
            socket = io(wsUrl, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 10,
            })
        }

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket.IO connected:', socket?.id)
            setIsConnected(true)
            setConnectionStatus('connected')
        })

        socket.on('disconnect', (reason) => {
            console.log('⚠️ Socket.IO disconnected:', reason)
            setIsConnected(false)
            setConnectionStatus('disconnected')
        })

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message)
            setIsConnected(false)
            setConnectionStatus('error')
        })

        // Game events
        socket.on('game:joined', (data) => {
            console.log('🎮 Joined game:', data)
            setGameInfo({
                id: data.gameId,
                name: data.gameName,
                status: 'PLAYING',
                maxPlayers: data.maxPlayers || 50,
                currentPlayers: data.currentPlayers || 1,
            })
            if (data.resources) {
                updateResources(data.resources)
            }
        })

        socket.on('game:tick', (data) => {
            setCurrentTick(data.tick)
        })

        socket.on('player:resources', (data) => {
            updateResources(data)
        })

        socket.on('province:captured', (data) => {
            updateProvince(data.provinceId, {
                ownerId: data.newOwnerId,
            })
        })

        socket.on('battle:started', (data) => {
            addBattle(data)
        })

        socket.on('battle:ended', (data) => {
            updateBattle(data.battleId, {
                status: 'COMPLETED',
                winner: data.winner,
            })
        })

        socket.on('chat:message', (data) => {
            console.log('💬 Chat:', data.playerName, data.message)
        })

        // Ping to measure latency
        const pingInterval = setInterval(() => {
            if (socket?.connected) {
                const start = Date.now()
                socket.emit('system:ping', () => {
                    const ping = Date.now() - start
                    setLatency(ping)
                    updatePing(ping)
                })
            }
        }, 5000)

        return () => {
            clearInterval(pingInterval)
            socket?.off('connect')
            socket?.off('disconnect')
            socket?.off('connect_error')
            socket?.off('game:joined')
            socket?.off('game:tick')
            socket?.off('player:resources')
            socket?.off('province:captured')
            socket?.off('battle:started')
            socket?.off('battle:ended')
            socket?.off('chat:message')
        }
    }, [setGameInfo, updateResources, setCurrentTick, updateProvince, addBattle, updateBattle, setConnectionStatus, updatePing])

    // Actions
    const joinGame = useCallback((gameId: string, playerId: string, username: string, nation: string, color: string) => {
        socket?.emit('game:join', { gameId, playerId, username, nation, color })
    }, [])

    const leaveGame = useCallback(() => {
        socket?.emit('game:leave')
    }, [])

    const moveArmy = useCallback((armyId: string, destinationProvinceId: string) => {
        socket?.emit('army:move', { armyId, destinationProvinceId })
    }, [])

    const attackProvince = useCallback((armyId: string, targetProvinceId: string) => {
        socket?.emit('army:attack', { armyId, targetProvinceId })
    }, [])

    const sendChat = useCallback((message: string, type: 'global' | 'alliance' | 'private' = 'global') => {
        socket?.emit('chat:send', { message, type })
    }, [])

    return {
        socket,
        isConnected,
        latency,
        joinGame,
        leaveGame,
        moveArmy,
        attackProvince,
        sendChat,
    }
}

export default useSocket
