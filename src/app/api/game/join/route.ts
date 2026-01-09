import { NextResponse } from 'next/server'
import { GAME_CONSTANTS, NATIONS } from '@/lib/types'

// In-memory game store (same as in /api/game/route.ts - in production, shared state via Redis)
interface GameData {
    id: string
    name: string
    status: 'WAITING' | 'STARTING' | 'PLAYING' | 'PAUSED' | 'ENDED'
    maxPlayers: number
    currentPlayers: number
    players: Array<{
        id: string
        nation: string
        color: string
        resources: { gold: number; iron: number; oil: number; food: number }
    }>
    provinces: Array<{
        id: string
        name: string
        coordX: number
        coordY: number
        ownerId: string | null
    }>
    createdAt: Date
    startedAt?: Date
    currentTick: number
}

const games: Map<string, GameData> = new Map()

// Generate demo provinces for a new game
function generateProvinces(gameId: string): GameData['provinces'] {
    const provinces: GameData['provinces'] = []
    const gridSize = 8

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const offsetX = y % 2 === 0 ? 0 : 0.9
            provinces.push({
                id: `${gameId}_province_${x}_${y}`,
                name: `Province ${String.fromCharCode(65 + x)}${y + 1}`,
                coordX: x * 1.8 + offsetX - gridSize,
                coordY: y * 1.5 - gridSize,
                ownerId: null,
            })
        }
    }

    return provinces
}

// POST /api/game/join
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { gameId, playerId, nation, color } = body

        // Validation
        if (!gameId || !playerId) {
            return NextResponse.json(
                { success: false, error: 'Game ID and Player ID are required' },
                { status: 400 }
            )
        }

        // Find or create game (for demo purposes)
        let game = games.get(gameId)

        if (!game) {
            // Create a demo game if it doesn't exist
            game = {
                id: gameId,
                name: 'Demo Game',
                status: 'WAITING',
                maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
                currentPlayers: 0,
                players: [],
                provinces: generateProvinces(gameId),
                createdAt: new Date(),
                currentTick: 0,
            }
            games.set(gameId, game)
        }

        // Check if game is full
        if (game.currentPlayers >= game.maxPlayers) {
            return NextResponse.json(
                { success: false, error: 'Game is full' },
                { status: 400 }
            )
        }

        // Check if game already started
        if (game.status !== 'WAITING') {
            return NextResponse.json(
                { success: false, error: 'Game has already started' },
                { status: 400 }
            )
        }

        // Check if player already in game
        const existingPlayer = game.players.find((p) => p.id === playerId)
        if (existingPlayer) {
            return NextResponse.json(
                { success: false, error: 'Player already in game' },
                { status: 400 }
            )
        }

        // Assign nation and color
        const selectedNation = nation || NATIONS[game.players.length % NATIONS.length]
        const playerColor = color || selectedNation.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`

        // Add player to game
        const player = {
            id: playerId,
            nation: typeof selectedNation === 'string' ? selectedNation : selectedNation.id,
            color: playerColor,
            resources: { ...GAME_CONSTANTS.STARTING_RESOURCES },
        }
        game.players.push(player)
        game.currentPlayers++

        // Assign starting province to player
        const unownedProvinces = game.provinces.filter((p) => !p.ownerId)
        if (unownedProvinces.length > 0) {
            const startingProvince = unownedProvinces[Math.floor(Math.random() * unownedProvinces.length)]
            startingProvince.ownerId = playerId
        }

        return NextResponse.json({
            success: true,
            gameId: game.id,
            gameName: game.name,
            playerId: player.id,
            nation: player.nation,
            color: player.color,
            resources: player.resources,
            provinces: game.provinces.map((p) => ({
                ...p,
                ownerColor: p.ownerId ? game.players.find((pl) => pl.id === p.ownerId)?.color || null : null,
            })),
            currentPlayers: game.currentPlayers,
            maxPlayers: game.maxPlayers,
            message: 'Joined game successfully',
        })
    } catch (error) {
        console.error('Join game error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
