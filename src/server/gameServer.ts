import { Server, Socket } from 'socket.io'
import { createServer } from 'http'

// Game state types
interface Player {
    id: string
    socketId: string
    username: string
    nation: string
    color: string
    resources: { gold: number; iron: number; oil: number; food: number }
    isOnline: boolean
}

interface GameRoom {
    id: string
    name: string
    players: Map<string, Player>
    status: 'WAITING' | 'PLAYING' | 'ENDED'
    tick: number
    tickInterval?: ReturnType<typeof setInterval>
}

// In-memory game rooms
const gameRooms: Map<string, GameRoom> = new Map()

// Connected sockets
const connectedSockets: Map<string, { playerId: string; gameId: string | null }> = new Map()

// Create HTTP server for Socket.IO
const httpServer = createServer()

// Create Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
})

// ============================================
// GAME TICK LOOP
// ============================================

const TICK_RATE = 1000 // 1 tick per second for MVP (60 ticks/sec too fast for demo)
const RESOURCE_RATE = 1 / 60 // Resources per tick (per minute rate / 60)

function startGameLoop(gameId: string) {
    const room = gameRooms.get(gameId)
    if (!room) return

    room.tickInterval = setInterval(() => {
        room.tick++

        // Update resources for all players
        room.players.forEach((player) => {
            player.resources.gold += 10 * RESOURCE_RATE
            player.resources.iron += 5 * RESOURCE_RATE
            player.resources.oil += 2.5 * RESOURCE_RATE
            player.resources.food += 7.5 * RESOURCE_RATE
        })

        // Broadcast tick to all players in room
        io.to(gameId).emit('game:tick', {
            tick: room.tick,
            timestamp: Date.now(),
        })

        // Every 10 ticks, send resource updates
        if (room.tick % 10 === 0) {
            room.players.forEach((player) => {
                io.to(player.socketId).emit('player:resources', {
                    gold: Math.floor(player.resources.gold),
                    iron: Math.floor(player.resources.iron),
                    oil: Math.floor(player.resources.oil),
                    food: Math.floor(player.resources.food),
                })
            })
        }
    }, TICK_RATE)

    console.log(`🎮 Game loop started for ${gameId}`)
}

function stopGameLoop(gameId: string) {
    const room = gameRooms.get(gameId)
    if (room?.tickInterval) {
        clearInterval(room.tickInterval)
        room.tickInterval = undefined
        console.log(`🎮 Game loop stopped for ${gameId}`)
    }
}

// ============================================
// SOCKET EVENT HANDLERS
// ============================================

io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id)

    // Track socket connection
    connectedSockets.set(socket.id, { playerId: '', gameId: null })

    // ============================================
    // SYSTEM EVENTS
    // ============================================

    socket.on('system:ping', (callback) => {
        if (typeof callback === 'function') {
            callback({ message: 'pong', timestamp: Date.now() })
        }
    })

    // ============================================
    // GAME EVENTS
    // ============================================

    socket.on('game:join', (data: { gameId: string; playerId: string; username: string; nation: string; color: string }) => {
        const { gameId, playerId, username, nation, color } = data

        console.log(`👤 Player ${username} joining game ${gameId}`)

        // Get or create game room
        let room = gameRooms.get(gameId)
        if (!room) {
            room = {
                id: gameId,
                name: `Game ${gameId}`,
                players: new Map(),
                status: 'WAITING',
                tick: 0,
            }
            gameRooms.set(gameId, room)
        }

        // Create player with STARTER KIT
        const player: Player = {
            id: playerId,
            socketId: socket.id,
            username,
            nation,
            color,
            resources: { gold: 20000, iron: 10000, oil: 5000, food: 50000 },
            isOnline: true,
        }

        // Add player to room
        room.players.set(playerId, player)

        // Join Socket.IO room
        socket.join(gameId)

        // Update socket tracking
        connectedSockets.set(socket.id, { playerId, gameId })

        // Notify player they've joined
        socket.emit('game:joined', {
            gameId,
            gameName: room.name,
            playerId,
            nation,
            color,
            resources: player.resources,
            currentPlayers: room.players.size,
            status: room.status,
        })

        // Notify other players
        socket.to(gameId).emit('player:joined', {
            playerId,
            username,
            nation,
            color,
        })

        // Start game if enough players (2 for MVP)
        if (room.players.size >= 2 && room.status === 'WAITING') {
            room.status = 'PLAYING'
            startGameLoop(gameId)
            io.to(gameId).emit('game:started', { gameId })
        }

        console.log(`✅ Player ${username} joined game ${gameId} (${room.players.size} players)`)
    })

    socket.on('game:leave', () => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId) return

        const { playerId, gameId } = socketData
        const room = gameRooms.get(gameId)
        if (!room) return

        // Remove player from room
        room.players.delete(playerId)
        socket.leave(gameId)

        // Update socket tracking
        connectedSockets.set(socket.id, { playerId: '', gameId: null })

        // Notify other players
        io.to(gameId).emit('player:left', { playerId })

        // Stop game if no players
        if (room.players.size === 0) {
            stopGameLoop(gameId)
            gameRooms.delete(gameId)
        }

        socket.emit('game:left')
        console.log(`👤 Player left game ${gameId}`)
    })

    // ============================================
    // ARMY EVENTS
    // ============================================

    socket.on('army:move', (data: { armyId: string; destinationProvinceId: string }) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId) return

        const { gameId } = socketData

        // Broadcast army movement to all players in game
        io.to(gameId).emit('army:moved', {
            armyId: data.armyId,
            destinationProvinceId: data.destinationProvinceId,
            isMoving: true,
        })

        console.log(`🚶 Army ${data.armyId} moving to ${data.destinationProvinceId}`)
    })

    socket.on('army:attack', (data: { armyId: string; targetProvinceId: string }) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId || !socketData.playerId) return

        const { gameId, playerId } = socketData

        // Create battle
        const battleId = `battle_${Date.now()}`

        io.to(gameId).emit('battle:started', {
            id: battleId,
            attackerId: playerId,
            attackerArmyId: data.armyId,
            provinceId: data.targetProvinceId,
            startTime: Date.now(),
            duration: 60, // 1 minute battle
            status: 'ACTIVE',
        })

        console.log(`⚔️ Battle started: ${battleId}`)

        // Simulate battle end after duration
        setTimeout(() => {
            const winner = Math.random() > 0.5 ? playerId : 'defender'
            io.to(gameId).emit('battle:ended', {
                battleId,
                winner,
                attackerCasualties: Math.floor(Math.random() * 50),
                defenderCasualties: Math.floor(Math.random() * 50),
            })

            // If attacker wins, capture province
            if (winner === playerId) {
                io.to(gameId).emit('province:captured', {
                    provinceId: data.targetProvinceId,
                    newOwnerId: playerId,
                })
            }
        }, 60000) // 1 minute
    })

    // ============================================
    // CHAT EVENTS
    // ============================================

    socket.on('chat:send', (data: { message: string; type: 'global' | 'alliance' | 'private'; recipientId?: string }) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId || !socketData.playerId) return

        const { gameId, playerId } = socketData
        const room = gameRooms.get(gameId)
        const player = room?.players.get(playerId)

        const chatMessage = {
            id: `msg_${Date.now()}`,
            playerId,
            playerName: player?.username || 'Unknown',
            message: data.message,
            type: data.type,
            timestamp: Date.now(),
        }

        if (data.type === 'global') {
            io.to(gameId).emit('chat:message', chatMessage)
        } else if (data.type === 'private' && data.recipientId) {
            const recipient = room?.players.get(data.recipientId)
            if (recipient) {
                io.to(recipient.socketId).emit('chat:message', chatMessage)
                socket.emit('chat:message', chatMessage)
            }
        }

        console.log(`💬 Chat [${data.type}]: ${data.message}`)
    })

    // ============================================
    // DIPLOMACY EVENTS
    // ============================================

    socket.on('diplomacy:create_alliance', (data: { name: string }) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId || !socketData.playerId) return

        const allianceId = `alliance_${Date.now()}`

        socket.emit('diplomacy:alliance_created', {
            allianceId,
            allianceName: data.name,
            members: [socketData.playerId],
        })

        console.log(`🤝 Alliance created: ${data.name}`)
    })

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', (reason) => {
        const socketData = connectedSockets.get(socket.id)

        if (socketData?.gameId && socketData.playerId) {
            const room = gameRooms.get(socketData.gameId)
            const player = room?.players.get(socketData.playerId)

            if (player) {
                player.isOnline = false
                io.to(socketData.gameId).emit('player:disconnected', {
                    playerId: socketData.playerId,
                })
            }
        }

        connectedSockets.delete(socket.id)
        console.log('🔌 Client disconnected:', socket.id, 'reason:', reason)
    })
})

// ============================================
// START SERVER
// ============================================

const PORT = process.env.WS_PORT || 3001

export function startSocketServer() {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Socket.IO server running on port ${PORT}`)
        console.log(`   WebSocket URL: ws://localhost:${PORT}`)
    })
}

export { io, gameRooms, connectedSockets }
