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
const VICTORY_THRESHOLD = 30 // Provinces needed to win

const UNIT_COSTS = {
    infantry: { gold: 50, iron: 0, oil: 0, food: 20, strength: 1 },
    tank: { gold: 150, iron: 100, oil: 20, food: 50, strength: 5 }
}

// Default game room
const DEFAULT_GAME = 'world-war-1945'
gameRooms.set(DEFAULT_GAME, {
    id: DEFAULT_GAME,
    name: 'WORLD CONFLICT 1945',
    players: new Map(),
    tick: 0,
    status: 'PLAYING'
})

// Check if player has won
function checkVictory(room, playerInfo, io) {
    let provinceCount = 0
    room.provinces.forEach((prov) => {
        if (prov.ownerId === playerInfo.playerId) {
            provinceCount++
        }
    })

    console.log(`📊 ${playerInfo.username} owns ${provinceCount}/${VICTORY_THRESHOLD} provinces`)

    if (provinceCount >= VICTORY_THRESHOLD) {
        console.log(`🏆 ${playerInfo.username} WINS THE GAME!`)
        room.status = 'ENDED'
        room.winner = playerInfo.playerId

        io.to(playerInfo.gameId).emit('game:victory', {
            winnerId: playerInfo.playerId,
            winnerName: playerInfo.username,
            provinceCount: provinceCount,
            message: `¡${playerInfo.username} ha conquistado ${provinceCount} provincias y gana la partida!`
        })
    }
}

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

    // Unit Recruitment
    socket.on('army:recruit', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const { provinceId, unitType, quantity } = data
        const cost = UNIT_COSTS[unitType]

        if (!cost || quantity < 1) return

        const player = room.players.get(playerInfo.playerId)
        if (!player) return

        // Check ownership
        const province = room.provinces.get(provinceId)
        if (!province || province.ownerId !== playerInfo.playerId) {
            console.log(`❌ Cannot recruit in province ${provinceId} (not owned)`)
            return
        }

        // Check resources
        const totalCost = {
            gold: cost.gold * quantity,
            iron: cost.iron * quantity,
            oil: cost.oil * quantity,
            food: cost.food * quantity
        }

        if (player.resources.gold < totalCost.gold ||
            player.resources.iron < totalCost.iron ||
            player.resources.oil < totalCost.oil ||
            player.resources.food < totalCost.food) {
            socket.emit('error', { message: 'Not enough resources' })
            return
        }

        // Deduct resources
        player.resources.gold -= totalCost.gold
        player.resources.iron -= totalCost.iron
        player.resources.oil -= totalCost.oil
        player.resources.food -= totalCost.food

        // Find existing army in province or create new
        let army = null
        room.armies.forEach(a => {
            if (a.playerId === playerInfo.playerId && a.currentProvinceId === provinceId) {
                army = a
            }
        })

        if (army) {
            // Add to existing army
            const unit = army.units.find(u => u.type === unitType)
            if (unit) {
                unit.quantity += quantity
            } else {
                army.units.push({ type: unitType, quantity, strength: cost.strength })
            }
            // Notify update (using same event as spawn/move to refresh)
            io.to(playerInfo.gameId).emit('army:moved', {
                armyId: army.id,
                destinationProvinceId: provinceId,
                units: army.units
            })
        } else {
            // Create new army
            army = {
                id: `army_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                playerId: playerInfo.playerId,
                playerColor: player.color, // Ensure color comes from player
                currentProvinceId: provinceId,
                units: [{ type: unitType, quantity, strength: cost.strength }],
                isMoving: false,
                name: `${playerInfo.username} ${unitType} Div`
            }
            room.armies.set(army.id, army)
            io.to(playerInfo.gameId).emit('army:spawned', army)
        }

        // Send updated resources
        socket.emit('player:resources', {
            resources: player.resources,
            income: { gold: 0, iron: 0, oil: 0, food: 0 } // Income logic handles the real rate
        })

        console.log(`🏭 ${playerInfo.username} recruited ${quantity} ${unitType} in ${provinceId}`)
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

            // Check victory condition
            checkVictory(room, playerInfo, io)
        } else if (destProvince.ownerId !== playerInfo.playerId) {
            // Enemy province - REAL COMBAT
            console.log(`⚔️ Battle at ${destProvinceId}!`)

            // Calculate attacker strength
            const attackerStrength = army.units.reduce((sum, u) => sum + (u.quantity * u.strength), 0)

            // Find defender army (if any)
            let defenderArmy = null
            room.armies.forEach((a) => {
                if (a.currentProvinceId === destProvinceId && a.playerId === destProvince.ownerId) {
                    defenderArmy = a
                }
            })

            let defenderStrength = 0
            if (defenderArmy) {
                defenderStrength = defenderArmy.units.reduce((sum, u) => sum + (u.quantity * u.strength), 0)
            }

            // Terrain defense bonus (simplified - 20% for defended provinces)
            const defenseBonus = 1.2
            const adjustedDefenderStrength = defenderStrength * defenseBonus

            console.log(`   Attacker: ${attackerStrength} vs Defender: ${adjustedDefenderStrength}`)

            // Combat resolution
            const attackerWins = attackerStrength > adjustedDefenderStrength

            if (attackerWins) {
                // Attacker captures province
                const newProvince = {
                    id: destProvinceId,
                    ownerId: playerInfo.playerId,
                    ownerColor: player?.color || army.playerColor
                }
                room.provinces.set(destProvinceId, newProvince)

                // Remove defender army if exists
                if (defenderArmy) {
                    room.armies.delete(defenderArmy.id)
                    io.to(playerInfo.gameId).emit('army:destroyed', { armyId: defenderArmy.id })
                }

                // Attacker loses some units (30% casualties)
                army.units.forEach(u => {
                    u.quantity = Math.ceil(u.quantity * 0.7)
                })

                io.to(playerInfo.gameId).emit('battle:result', {
                    provinceId: destProvinceId,
                    winner: playerInfo.playerId,
                    winnerName: playerInfo.username,
                    attackerStrength,
                    defenderStrength: Math.floor(adjustedDefenderStrength)
                })

                io.to(playerInfo.gameId).emit('province:captured', {
                    provinceId: destProvinceId,
                    newOwnerId: playerInfo.playerId,
                    newOwnerColor: player?.color || army.playerColor
                })

                // Check victory condition
                checkVictory(room, playerInfo, io)
            } else {
                // Defender wins - attacker retreats
                army.currentProvinceId = data.fromProvinceId || army.currentProvinceId

                // Attacker loses more units (50% casualties)
                army.units.forEach(u => {
                    u.quantity = Math.ceil(u.quantity * 0.5)
                })

                // Defender also loses some (20%)
                if (defenderArmy) {
                    defenderArmy.units.forEach(u => {
                        u.quantity = Math.ceil(u.quantity * 0.8)
                    })
                }

                io.to(playerInfo.gameId).emit('battle:result', {
                    provinceId: destProvinceId,
                    winner: destProvince.ownerId,
                    winnerName: 'Defender',
                    attackerStrength,
                    defenderStrength: Math.floor(adjustedDefenderStrength),
                    attackerRetreated: true
                })

                console.log(`   ❌ Attack failed! Retreating...`)
            }
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

    // Restart Game
    socket.on('game:restart', () => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        console.log(`🔄 Restarting game ${playerInfo.gameId}...`)

        // Reset Room State
        room.status = 'PLAYING'
        room.tick = 0
        room.winner = null
        room.provinces.clear() // Resets all to neutral
        room.armies.clear()
        room.players.clear() // Force re-join logic
        room.mapSeed = Date.now() // New map

        // Broadcast reset to trigger reload
        io.to(playerInfo.gameId).emit('game:restarted')
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
