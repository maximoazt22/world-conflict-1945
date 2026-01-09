// Socket.IO Game Server for Railway Deployment
const { createServer } = require('http')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001

// Create HTTP server
const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }))
        return
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('WORLD CONFLICT 1945 - Game Server')
})

// Create Socket.IO server with CORS for Vercel frontend
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:3000',
            'https://world-conflict-1945.vercel.app',
            'https://*.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
})

// Game state
const gameRooms = new Map()
const connectedPlayers = new Map()
const chatHistory = [] // Global chat history

// Game configuration
const TICK_RATE = 1000 // 1 second
const RESOURCE_RATE = { gold: 10, iron: 5, oil: 2, food: 8 }

// Default game room
const DEFAULT_GAME = 'world-war-1945'
gameRooms.set(DEFAULT_GAME, {
    id: DEFAULT_GAME,
    name: 'WORLD CONFLICT 1945',
    players: new Map(),
    tick: 0,
    status: 'PLAYING'
})

// Socket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`)

    // System ping
    socket.on('system:ping', (callback) => {
        if (typeof callback === 'function') callback()
    })

    // Join game
    socket.on('game:join', (data) => {
        const { gameId = DEFAULT_GAME, playerId, username, nation, color } = data

        console.log(`👤 ${username} joining game ${gameId}`)

        // Get or create game room
        let room = gameRooms.get(gameId)
        if (!room) {
            room = {
                id: gameId,
                name: gameId,
                players: new Map(),
                tick: 0,
                status: 'PLAYING'
            }
            gameRooms.set(gameId, room)
        }

        // Create player data
        const player = {
            id: playerId || `player_${Date.now()}`,
            socketId: socket.id,
            username: username || 'Anonymous',
            nation: nation || 'USA',
            color: color || '#4169E1',
            resources: { gold: 1000, iron: 500, oil: 250, food: 750 },
            provinces: [],
            isOnline: true,
            joinedAt: Date.now()
        }

        // Add player to room and tracking
        room.players.set(player.id, player)
        connectedPlayers.set(socket.id, { playerId: player.id, gameId, username })
        socket.join(gameId)

        // Send join confirmation
        socket.emit('game:joined', {
            gameId,
            gameName: room.name,
            playerId: player.id,
            nation: player.nation,
            color: player.color,
            resources: player.resources,
            currentPlayers: room.players.size,
            players: Array.from(room.players.values()).map(p => ({
                id: p.id,
                username: p.username,
                nation: p.nation,
                color: p.color,
                isOnline: p.isOnline
            }))
        })

        // Notify other players
        socket.to(gameId).emit('player:joined', {
            playerId: player.id,
            username: player.username,
            nation: player.nation,
            color: player.color
        })

        // Send chat history
        socket.emit('chat:history', chatHistory.slice(-50))

        console.log(`✅ ${username} joined (${room.players.size} players in room)`)
    })

    // Chat message
    socket.on('chat:send', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: playerInfo.playerId,
            playerName: playerInfo.username,
            message: data.message,
            type: data.type || 'global',
            timestamp: Date.now()
        }

        // Store in history
        chatHistory.push(message)
        if (chatHistory.length > 100) chatHistory.shift()

        // Broadcast to all in game
        if (data.type === 'global') {
            io.to(playerInfo.gameId).emit('chat:message', message)
        } else if (data.type === 'alliance') {
            // TODO: Send only to alliance members
            socket.to(playerInfo.gameId).emit('chat:message', message)
        }

        console.log(`💬 ${playerInfo.username}: ${data.message}`)
    })

    // Army movement
    socket.on('army:move', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        console.log(`🚶 Army move: ${data.armyId} -> ${data.destinationProvinceId}`)

        // Broadcast movement to all players
        io.to(playerInfo.gameId).emit('army:moved', {
            armyId: data.armyId,
            playerId: playerInfo.playerId,
            destinationProvinceId: data.destinationProvinceId,
            isMoving: true
        })
    })

    // Leave game
    socket.on('game:leave', () => {
        handlePlayerLeave(socket)
    })

    // Disconnect
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Player disconnected: ${socket.id} (${reason})`)
        handlePlayerLeave(socket)
    })
})

// Handle player leaving
function handlePlayerLeave(socket) {
    const playerInfo = connectedPlayers.get(socket.id)
    if (!playerInfo) return

    const room = gameRooms.get(playerInfo.gameId)
    if (room) {
        const player = room.players.get(playerInfo.playerId)
        if (player) {
            player.isOnline = false

            // Notify others
            socket.to(playerInfo.gameId).emit('player:left', {
                playerId: playerInfo.playerId,
                username: playerInfo.username
            })
        }
    }

    connectedPlayers.delete(socket.id)
    console.log(`👋 ${playerInfo.username} left the game`)
}

// Game tick loop - update resources for all players
setInterval(() => {
    gameRooms.forEach((room) => {
        if (room.status !== 'PLAYING') return

        room.tick++

        room.players.forEach((player) => {
            if (!player.isOnline) return

            // Add resources
            player.resources.gold += RESOURCE_RATE.gold
            player.resources.iron += RESOURCE_RATE.iron
            player.resources.oil += RESOURCE_RATE.oil
            player.resources.food += RESOURCE_RATE.food
        })

        // Broadcast tick to room
        io.to(room.id).emit('game:tick', {
            tick: room.tick,
            playersOnline: Array.from(room.players.values()).filter(p => p.isOnline).length
        })

        // Send resource updates every 5 ticks
        if (room.tick % 5 === 0) {
            room.players.forEach((player) => {
                if (!player.isOnline) return
                const playerSocket = io.sockets.sockets.get(player.socketId)
                if (playerSocket) {
                    playerSocket.emit('player:resources', player.resources)
                }
            })
        }
    })
}, TICK_RATE)

// Start server
httpServer.listen(PORT, () => {
    console.log('')
    console.log('🎖️  WORLD CONFLICT 1945 - Game Server')
    console.log('=====================================')
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 Ready for connections`)
    console.log('')
})
