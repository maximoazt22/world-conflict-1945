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
                armies: new Map(), // Track all armies
                tick: 0,
                status: 'PLAYING',
                mapSeed: Math.floor(Math.random() * 1000000),
                provinces: new Map()
            }
            gameRooms.set(gameId, room)
        }

        // Assign starting province (based on player count)
        const playerIndex = room.players.size
        const startX = playerIndex % 10
        const startY = Math.floor(playerIndex / 10)
        const startingProvinceId = `${startX}-${startY}`

        // Create player data
        const player = {
            id: playerId || `player_${Date.now()}`,
            socketId: socket.id,
            username: username || 'Anonymous',
            nation: nation || 'USA',
            color: color || '#4169E1',
            resources: { gold: 1000, iron: 500, oil: 250, food: 750 },
            provinces: [startingProvinceId],
            isOnline: true,
            joinedAt: Date.now()
        }

        // Claim starting province
        room.provinces.set(startingProvinceId, {
            id: startingProvinceId,
            ownerId: player.id,
            ownerColor: player.color
        })

        // Create starting army
        const armyId = `army_${player.id}_1`
        const army = {
            id: armyId,
            playerId: player.id,
            playerColor: player.color,
            name: `${nation} 1st Army`,
            currentProvinceId: startingProvinceId,
            isMoving: false,
            destinationId: null,
            units: [
                { type: 'infantry', quantity: 100, strength: 10 },
                { type: 'tank', quantity: 10, strength: 50 }
            ]
        }
        room.armies.set(armyId, army)

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
            mapSeed: room.mapSeed,
            provinces: Array.from(room.provinces.values()),
            armies: Array.from(room.armies.values()), // Send all armies
            currentPlayers: room.players.size,
            players: Array.from(room.players.values()).map(p => ({
                id: p.id,
                username: p.username,
                nation: p.nation,
                color: p.color,
                isOnline: p.isOnline
            }))
        })

        // Notify other players about new player and their army
        socket.to(gameId).emit('player:joined', {
            playerId: player.id,
            username: player.username,
            nation: player.nation,
            color: player.color
        })

        socket.to(gameId).emit('province:captured', {
            provinceId: startingProvinceId,
            newOwnerId: player.id,
            newOwnerColor: player.color
        })

        socket.to(gameId).emit('army:spawned', army)

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

    // Army movement with conquest
    socket.on('army:move', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const army = room.armies.get(data.armyId)
        if (!army) {
            console.log(`❌ Army not found: ${data.armyId}`)
            return
        }

        // Verify ownership
        if (army.playerId !== playerInfo.playerId) {
            console.log(`❌ Not owner of army ${data.armyId}`)
            return
        }

        const destProvinceId = data.destinationProvinceId
        const destProvince = room.provinces.get(destProvinceId)
        const player = room.players.get(playerInfo.playerId)

        console.log(`🚶 ${playerInfo.username} moving army to ${destProvinceId}`)

        // Update army position
        army.currentProvinceId = destProvinceId
        army.isMoving = false

        // Check province ownership
        if (!destProvince || !destProvince.ownerId) {
            // Neutral province - AUTO CAPTURE
            const newProvince = {
                id: destProvinceId,
                ownerId: playerInfo.playerId,
                ownerColor: player?.color || army.playerColor
            }
            room.provinces.set(destProvinceId, newProvince)

            console.log(`🚩 Province ${destProvinceId} captured by ${playerInfo.username}`)

            // Broadcast capture
            io.to(playerInfo.gameId).emit('province:captured', {
                provinceId: destProvinceId,
                newOwnerId: playerInfo.playerId,
                newOwnerColor: player?.color || army.playerColor
            })
        } else if (destProvince.ownerId !== playerInfo.playerId) {
            // Enemy province - COMBAT (simplified)
            console.log(`⚔️ Battle at ${destProvinceId}!`)

            // Simple combat: attacker wins if they have an army
            // TODO: Implement proper combat system
            const newProvince = {
                id: destProvinceId,
                ownerId: playerInfo.playerId,
                ownerColor: player?.color || army.playerColor
            }
            room.provinces.set(destProvinceId, newProvince)

            io.to(playerInfo.gameId).emit('battle:result', {
                provinceId: destProvinceId,
                winner: playerInfo.playerId,
                winnerName: playerInfo.username
            })

            io.to(playerInfo.gameId).emit('province:captured', {
                provinceId: destProvinceId,
                newOwnerId: playerInfo.playerId,
                newOwnerColor: player?.color || army.playerColor
            })
        }
        // else: own province - just moving

        // Broadcast army movement
        io.to(playerInfo.gameId).emit('army:moved', {
            armyId: data.armyId,
            playerId: playerInfo.playerId,
            fromProvinceId: data.fromProvinceId,
            destinationProvinceId: destProvinceId
        })
    })

    // Capture province (Simple version for MVP)
    socket.on('province:capture', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        // Update server state
        room.provinces.set(data.provinceId, {
            id: data.provinceId,
            ownerId: playerInfo.playerId,
            ownerColor: data.color // Or get from player
        })

        console.log(`🚩 Province ${data.provinceId} captured by ${playerInfo.username}`)

        // Broadcast update
        io.to(playerInfo.gameId).emit('province:captured', {
            provinceId: data.provinceId,
            newOwnerId: playerInfo.playerId,
            newOwnerColor: data.color
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

// Game tick loop - update resources for all players based on owned provinces
setInterval(() => {
    gameRooms.forEach((room) => {
        if (room.status !== 'PLAYING') return

        room.tick++

        room.players.forEach((player) => {
            if (!player.isOnline) return

            // Calculate income from owned provinces
            let goldIncome = RESOURCE_RATE.gold // Base income
            let ironIncome = RESOURCE_RATE.iron
            let oilIncome = RESOURCE_RATE.oil
            let foodIncome = RESOURCE_RATE.food

            // Add bonuses from each owned province
            room.provinces.forEach((province) => {
                if (province.ownerId === player.id) {
                    // Each province adds its bonus (simplified - use fixed values for now)
                    goldIncome += 5
                    ironIncome += 3
                    oilIncome += 1
                    foodIncome += 4
                }
            })

            // Apply income
            player.resources.gold += goldIncome
            player.resources.iron += ironIncome
            player.resources.oil += oilIncome
            player.resources.food += foodIncome
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
                    // Calculate income for display
                    let income = { gold: RESOURCE_RATE.gold, iron: RESOURCE_RATE.iron, oil: RESOURCE_RATE.oil, food: RESOURCE_RATE.food }
                    room.provinces.forEach((prov) => {
                        if (prov.ownerId === player.id) {
                            income.gold += 5
                            income.iron += 3
                            income.oil += 1
                            income.food += 4
                        }
                    })
                    playerSocket.emit('player:resources', {
                        ...player.resources,
                        income // Send income rate too
                    })
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
