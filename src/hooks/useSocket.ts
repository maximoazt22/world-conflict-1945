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
        setPlayers,
        addPlayer,
        removePlayer,
        updatePlayerStatus,
        updateResources,
        setCurrentTick,
        setProvinces,
        updateProvince,
        setMapSeed,
        setPendingMapUpdates,
        setArmies,
        addArmy,
        updateArmy,
        addBattle,
        updateBattle,
    } = useGameStore()

    const {
        setConnectionStatus,
        updatePing,
    } = useSessionStore()

    // Initialize socket connection
    useEffect(() => {
        // Force Railway URL in production
        const isProd = process.env.NODE_ENV === 'production'
        const railwayUrl = 'https://world-conflict-1945-production.up.railway.app'
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (isProd ? railwayUrl : 'http://localhost:3001')

        console.log('🔌 Connecting to WebSocket:', wsUrl, 'isProd:', isProd)

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

            // Sync players
            if (data.players) {
                setPlayers(data.players)
            }

            if (data.resources) {
                updateResources(data.resources)
            }

            // Sync Map
            if (data.mapSeed) {
                setMapSeed(data.mapSeed)
            }
            if (data.provinces) {
                // IMPORTANT: Since these provinces from server only have ownerId data (not geometry),
                // we treat them as "updates" to be applied after local map generation.
                setPendingMapUpdates(data.provinces)
            }

            // Sync Armies
            if (data.armies) {
                setArmies(data.armies)
            }
        })

        socket.on('player:joined', (player) => {
            console.log('👤 Player joined:', player.username)
            addPlayer(player)
            // Show notification
            // toast.success(`${player.username} se unió a la partida`)
        })

        socket.on('player:left', (data) => {
            console.log('👋 Player left:', data.playerId)
            updatePlayerStatus(data.playerId, false)
            // removePlayer(data.playerId) // Optional: remove or just mark offline
        })

        socket.on('game:tick', (data) => {
            setCurrentTick(data.tick)
        })

        socket.on('player:resources', (data) => {
            if (data.resources) {
                updateResources(data.resources)
            }
        })

        socket.on('province:captured', (data) => {
            updateProvince(data.provinceId, {
                ownerId: data.newOwnerId,
                ownerColor: data.newOwnerColor
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

        // Army events
        socket.on('army:spawned', (army) => {
            console.log('🎖️ Army spawned:', army.name)
            addArmy(army)
        })

        socket.on('army:moved', (data) => {
            console.log('🚶 Army moved:', data.armyId)
            updateArmy(data.armyId, {
                currentProvinceId: data.destinationProvinceId,
                isMoving: false
            })
        })

        socket.on('army:destroyed', (data) => {
            console.log('💀 Army destroyed:', data.armyId)
            useGameStore.getState().removeArmy(data.armyId)
        })

        socket.on('battle:result', (data) => {
            console.log(`⚔️ Battle result: ${data.winnerName} wins! (${data.attackerStrength} vs ${data.defenderStrength})`)
            if (data.attackerRetreated) {
                console.log('❌ Attacker retreated!')
            }
            // Could add toast notification here
        })

        socket.on('game:victory', (data) => {
            console.log(`🏆 GAME OVER! ${data.winnerName} wins with ${data.provinceCount} provinces!`)
            alert(data.message) // Simple victory popup
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
    }, [setGameInfo, updateResources, setCurrentTick, updateProvince, addBattle, updateBattle, setConnectionStatus, updatePing, setMapSeed, setPendingMapUpdates])

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

    const recruitUnit = useCallback((provinceId: string, unitType: string, quantity: number) => {
        socket?.emit('army:recruit', { provinceId, unitType, quantity })
    }, [])

    return {
        socket,
        isConnected,
        latency,
        joinGame,
        leaveGame,
        moveArmy,
        attackProvince,
        recruitUnit,
        sendChat,
    }
}

export default useSocket
