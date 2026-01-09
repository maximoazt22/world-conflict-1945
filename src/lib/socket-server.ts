import { Server } from 'socket.io'

// Global state (persists across warm invocations)
const connectedPlayers = new Map()
const chatHistory: Array<{ id: string, playerName: string, message: string, timestamp: number }> = []

let io: Server | null = null

export function getSocketServer(server: any) {
    if (io) return io

    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'https://world-conflict-1945.vercel.app',
                /\.vercel\.app$/
            ],
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    })

    io.on('connection', (socket) => {
        console.log('Player connected:', socket.id)

        socket.on('system:ping', (cb) => cb?.())

        socket.on('game:join', (data) => {
            const player = {
                id: data.playerId || `player_${Date.now()}`,
                socketId: socket.id,
                username: data.username || 'Anonymous',
                nation: data.nation || 'USA',
                color: data.color || '#4169E1',
                resources: { gold: 1000, iron: 500, oil: 250, food: 750 }
            }

            connectedPlayers.set(socket.id, player)
            socket.join('main-game')

            socket.emit('game:joined', {
                gameId: 'main-game',
                gameName: 'WORLD CONFLICT 1945',
                playerId: player.id,
                nation: player.nation,
                color: player.color,
                resources: player.resources,
                players: Array.from(connectedPlayers.values())
            })

            socket.to('main-game').emit('player:joined', player)
            socket.emit('chat:history', chatHistory.slice(-50))
        })

        socket.on('chat:send', (data) => {
            const player = connectedPlayers.get(socket.id)
            if (!player) return

            const msg = {
                id: `msg_${Date.now()}`,
                playerName: player.username,
                message: data.message,
                timestamp: Date.now()
            }

            chatHistory.push(msg)
            if (chatHistory.length > 100) chatHistory.shift()

            io?.to('main-game').emit('chat:message', msg)
        })

        socket.on('disconnect', () => {
            const player = connectedPlayers.get(socket.id)
            if (player) {
                socket.to('main-game').emit('player:left', { playerId: player.id })
                connectedPlayers.delete(socket.id)
            }
        })
    })

    return io
}
