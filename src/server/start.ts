// Entry point for the Socket.IO game server
// Run with: npx ts-node src/server/start.ts

const { Server } = require('socket.io')
const http = require('http')

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
const httpServer = http.createServer()

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

// Game tick loop
const TICK_RATE = 1000 // 1 tick per second
const RESOURCE_RATE = 1 / 60

function startGameLoop(gameId: string) {
    const room = gameRooms.get(gameId)
    if (!room) return

    room.tickInterval = setInterval(() => {
        room.tick++

        // Update resources
        room.players.forEach((player) => {
            player.resources.gold += 10 * RESOURCE_RATE
            player.resources.iron += 5 * RESOURCE_RATE
            player.resources.oil += 2.5 * RESOURCE_RATE
            player.resources.food += 7.5 * RESOURCE_RATE
        })

        // Broadcast tick
        io.to(gameId).emit('game:tick', { tick: room.tick, timestamp: Date.now() })

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

    console.log(`🎮 Game loop started: ${gameId}`)
}

// Socket event handlers
io.on('connection', (socket: any) => {
    console.log('🔌 Client connected:', socket.id)
    connectedSockets.set(socket.id, { playerId: '', gameId: null })

    // System ping
    socket.on('system:ping', (callback: Function) => {
        if (typeof callback === 'function') {
            callback({ message: 'pong', timestamp: Date.now() })
        }
    })

    // Join game
    socket.on('game:join', (data: any) => {
        const { gameId, playerId, username, nation, color } = data
        console.log(`👤 Player ${username} joining game ${gameId}`)

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

        const player: Player = {
            id: playerId,
            socketId: socket.id,
            username,
            nation,
            color,
            resources: { gold: 1000, iron: 500, oil: 250, food: 750 },
            isOnline: true,
        }

        room.players.set(playerId, player)
        socket.join(gameId)
        connectedSockets.set(socket.id, { playerId, gameId })

        socket.emit('game:joined', {
            gameId,
            gameName: room.name,
            playerId,
            nation,
            color,
            resources: player.resources,
        })

        socket.to(gameId).emit('player:joined', { playerId, username, nation, color })

        if (room.players.size >= 2 && room.status === 'WAITING') {
            room.status = 'PLAYING'
            startGameLoop(gameId)
            io.to(gameId).emit('game:started', { gameId })
        }

        console.log(`✅ Player ${username} joined (${room.players.size} players)`)
    })

    // Army movement
    socket.on('army:move', (data: any) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId) return
        io.to(socketData.gameId).emit('army:moved', { ...data, isMoving: true })
    })

    // Army attack
    socket.on('army:attack', (data: any) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId) return

        const battleId = `battle_${Date.now()}`
        io.to(socketData.gameId).emit('battle:started', {
            id: battleId,
            attackerId: socketData.playerId,
            ...data,
            status: 'ACTIVE',
        })
    })

    // Chat
    socket.on('chat:send', (data: any) => {
        const socketData = connectedSockets.get(socket.id)
        if (!socketData?.gameId) return

        const room = gameRooms.get(socketData.gameId)
        const player = room?.players.get(socketData.playerId)

        io.to(socketData.gameId).emit('chat:message', {
            id: `msg_${Date.now()}`,
            playerId: socketData.playerId,
            playerName: player?.username || 'Unknown',
            ...data,
            timestamp: Date.now(),
        })
    })

    // Disconnect
    socket.on('disconnect', (reason: string) => {
        const socketData = connectedSockets.get(socket.id)
        if (socketData?.gameId && socketData.playerId) {
            io.to(socketData.gameId).emit('player:disconnected', { playerId: socketData.playerId })
        }
        connectedSockets.delete(socket.id)
        console.log('🔌 Client disconnected:', socket.id)
    })
})

// Start server
const PORT = 3001
console.log('🎖️ WORLD CONFLICT 1945 - Game Server')
console.log('=====================================')

httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`)
    console.log(`   WebSocket URL: ws://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...')
    process.exit(0)
})
