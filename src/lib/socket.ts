'use client'

import { io, Socket } from 'socket.io-client'
import { useSessionStore } from '@/stores/sessionStore'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useUIStore } from '@/stores/uiStore'

// ============================================
// SOCKET CONFIGURATION
// ============================================

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

let socket: Socket | null = null

export const getSocket = (): Socket | null => socket

export const initializeSocket = (token?: string): Socket => {
    if (socket?.connected) {
        return socket
    }

    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: token ? { token } : undefined,
    })

    // Connection events
    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket?.id)
        useSessionStore.getState().setConnectionStatus('connected')
        useSessionStore.getState().setSocketId(socket?.id || null)
        useSessionStore.getState().resetErrorCount()
    })

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason)
        useSessionStore.getState().setConnectionStatus('disconnected')
        useSessionStore.getState().setSocketId(null)
    })

    socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error.message)
        useSessionStore.getState().setConnectionStatus('error')
        useSessionStore.getState().setError(error.message)
        useSessionStore.getState().incrementErrorCount()
    })

    socket.io.on('reconnect_attempt', () => {
        console.log('🔌 Socket reconnecting...')
        useSessionStore.getState().setConnectionStatus('reconnecting')
    })

    socket.io.on('reconnect', () => {
        console.log('🔌 Socket reconnected')
        useSessionStore.getState().setConnectionStatus('connected')
    })

    // Initialize game event listeners
    initializeGameListeners(socket)

    return socket
}

// ============================================
// GAME EVENT LISTENERS
// ============================================

const initializeGameListeners = (socket: Socket) => {
    // System Events
    socket.on('system:ping', () => {
        const start = Date.now()
        socket.emit('system:pong', start)
    })

    socket.on('system:pong', (startTime: number) => {
        const latency = Date.now() - startTime
        useSessionStore.getState().updatePing(latency)
    })

    socket.on('system:notification', (data: { message: string; type: string }) => {
        console.log('📢 Notification:', data.message)
        // Add to notification system
    })

    socket.on('system:error', (data: { message: string; code?: string }) => {
        console.error('❌ Server error:', data.message)
        useSessionStore.getState().setError(data.message)
    })

    // Game Events
    socket.on('game:joined', (data: {
        gameId: string
        gameName: string
        playerId: string
        nation: string
        color: string
        resources: any // Modern resources
        provinces: Array<{
            id: string
            name: string
            coordX: number
            coordY: number
            coordZ: number
            ownerId: string | null
            oilBonus: number
            gasBonus: number
            uraniumBonus: number
            lithiumBonus: number
            rareEarthBonus: number
            copperBonus: number
            goldBonus: number
            steelBonus: number
            siliconBonus: number
            foodBonus: number
            defenseBonus: number
            terrain: string
            buildings: Array<{ id: string; type: string; level: number; isComplete: boolean }>
            units: Array<{ id: string; type: string; quantity: number; strength: number; morale: number }>
        }>
    }) => {
        console.log('🎮 Joined game:', data.gameId)
        useSessionStore.getState().setCurrentGame(data.gameId)
        useGameStore.getState().setGameId(data.gameId)
        useGameStore.getState().setGameInfo({ name: data.gameName, status: 'PLAYING' })
        useGameStore.getState().setPlayerInfo(data.playerId, data.nation, data.color)
        useGameStore.getState().setResources(data.resources)
        useGameStore.getState().setProvinces(data.provinces)
        usePlayerStore.getState().setPlayer({
            playerId: data.playerId,
            nation: data.nation,
            color: data.color,
            isOnline: true,
        })
    })

    socket.on('game:left', () => {
        console.log('🎮 Left game')
        useSessionStore.getState().setCurrentGame(null)
        useGameStore.getState().reset()
    })

    socket.on('game:started', (data: { gameId: string }) => {
        console.log('🎮 Game started:', data.gameId)
        useGameStore.getState().setGameInfo({ status: 'PLAYING' })
    })

    socket.on('game:ended', (data: { gameId: string; winner?: string }) => {
        console.log('🎮 Game ended:', data.gameId, 'Winner:', data.winner)
        useGameStore.getState().setGameInfo({ status: 'ENDED' })
    })

    socket.on('game:tick', (data: { tick: number }) => {
        useGameStore.getState().incrementTick()
    })

    // Player Events
    socket.on('player:joined', (data: { playerId: string; nation: string; color: string }) => {
        console.log('👤 Player joined:', data.playerId)
    })

    socket.on('player:left', (data: { playerId: string }) => {
        console.log('👤 Player left:', data.playerId)
    })

    socket.on('player:resources', (data: any) => {
        useGameStore.getState().setResources(data)
    })

    // Map Events
    socket.on('map:update', (data: { provinceId: string; province: Partial<ReturnType<typeof useGameStore.getState>['provinces'][0]> }) => {
        useGameStore.getState().updateProvince(data.provinceId, data.province)
    })

    socket.on('province:captured', (data: { provinceId: string; newOwnerId: string; newOwnerName: string; newOwnerColor: string }) => {
        console.log('🏰 Province captured:', data.provinceId, 'by', data.newOwnerName)
        useGameStore.getState().updateProvince(data.provinceId, {
            ownerId: data.newOwnerId,
            ownerName: data.newOwnerName,
            ownerColor: data.newOwnerColor,
        })
    })

    // Army Events
    socket.on('army:moved', (data: {
        armyId: string
        currentProvinceId: string
        isMoving: boolean
        destinationId: string | null
    }) => {
        useGameStore.getState().updateArmy(data.armyId, {
            currentProvinceId: data.currentProvinceId,
            isMoving: data.isMoving,
            destinationId: data.destinationId,
        })
    })

    socket.on('army:created', (data: ReturnType<typeof useGameStore.getState>['armies'][0]) => {
        useGameStore.getState().addArmy(data)
    })

    socket.on('army:destroyed', (data: { armyId: string }) => {
        useGameStore.getState().removeArmy(data.armyId)
    })

    // Battle Events
    socket.on('battle:started', (data: ReturnType<typeof useGameStore.getState>['battles'][0]) => {
        console.log('⚔️ Battle started:', data.id)
        useGameStore.getState().addBattle(data)
        useGameStore.getState().setCurrentPhase('battle')
        useUIStore.getState().setActivePanel('battle')
    })

    socket.on('battle:update', (data: { battleId: string; update: Partial<ReturnType<typeof useGameStore.getState>['battles'][0]> }) => {
        useGameStore.getState().updateBattle(data.battleId, data.update)
    })

    socket.on('battle:ended', (data: { battleId: string; winner: string | null; attackerCasualties: number; defenderCasualties: number }) => {
        console.log('⚔️ Battle ended:', data.battleId, 'Winner:', data.winner)
        useGameStore.getState().updateBattle(data.battleId, {
            status: 'COMPLETED',
            winner: data.winner,
            attackerCasualties: data.attackerCasualties,
            defenderCasualties: data.defenderCasualties,
        })
        useGameStore.getState().setCurrentPhase('planning')
    })

    // Diplomacy Events
    socket.on('diplomacy:alliance_created', (data: { allianceId: string; allianceName: string; members: string[] }) => {
        console.log('🤝 Alliance created:', data.allianceName)
        usePlayerStore.getState().setAlliance(data.allianceId, data.allianceName, data.members)
    })

    socket.on('diplomacy:alliance_joined', (data: { allianceId: string; allianceName: string; members: string[] }) => {
        usePlayerStore.getState().setAlliance(data.allianceId, data.allianceName, data.members)
    })

    socket.on('diplomacy:alliance_left', () => {
        usePlayerStore.getState().setAlliance(null, null, [])
    })

    // Chat Events
    socket.on('chat:message', (data: { id: string; playerId: string; playerName: string; message: string; type: 'global' | 'alliance' | 'private'; timestamp: number }) => {
        const currentTab = useUIStore.getState().chatTab
        const activePanel = useUIStore.getState().activePanel

        // Add unread count if not viewing chat
        if (activePanel !== 'chat' || currentTab !== data.type) {
            useUIStore.getState().addUnreadMessage(data.type)
        }
    })
}

// ============================================
// SOCKET ACTIONS (EMIT HELPERS)
// ============================================

export const socketActions = {
    // Game Actions
    joinGame: (gameId: string) => {
        socket?.emit('game:join', { gameId })
    },

    leaveGame: () => {
        socket?.emit('game:leave')
    },

    // Army Actions
    moveArmy: (armyId: string, destinationProvinceId: string) => {
        socket?.emit('army:move', { armyId, destinationProvinceId })
    },

    attackProvince: (armyId: string, targetProvinceId: string) => {
        socket?.emit('army:attack', { armyId, targetProvinceId })
    },

    recruitUnits: (provinceId: string, unitType: string, quantity: number) => {
        socket?.emit('army:recruit', { provinceId, unitType, quantity })
    },

    // Battle Actions
    reinforceBattle: (battleId: string, armyId: string) => {
        socket?.emit('battle:reinforce', { battleId, armyId })
    },

    retreatBattle: (battleId: string) => {
        socket?.emit('battle:retreat', { battleId })
    },

    // Diplomacy Actions
    createAlliance: (name: string) => {
        socket?.emit('diplomacy:create_alliance', { name })
    },

    inviteToAlliance: (playerId: string) => {
        socket?.emit('diplomacy:invite', { playerId })
    },

    leaveAlliance: () => {
        socket?.emit('diplomacy:leave_alliance')
    },

    proposePact: (playerId: string, pactType: string, duration: number) => {
        socket?.emit('diplomacy:propose_pact', { playerId, pactType, duration })
    },

    declareWar: (playerId: string) => {
        socket?.emit('diplomacy:declare_war', { playerId })
    },

    // Chat Actions
    sendMessage: (message: string, type: 'global' | 'alliance' | 'private', recipientId?: string) => {
        socket?.emit('chat:send', { message, type, recipientId })
    },

    // Building Actions
    constructBuilding: (provinceId: string, buildingType: string) => {
        socket?.emit('building:construct', { provinceId, buildingType })
    },

    upgradeBuilding: (buildingId: string) => {
        socket?.emit('building:upgrade', { buildingId })
    },
}

// ============================================
// CLEANUP
// ============================================

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export default socket
