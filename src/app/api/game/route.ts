import { NextResponse } from 'next/server'
import { NATIONS, GAME_CONSTANTS } from '@/lib/types'

// In-memory game store (production would use Prisma + Redis)
interface GameData {
    id: string
    name: string
    status: 'WAITING' | 'STARTING' | 'PLAYING' | 'PAUSED' | 'ENDED'
    maxPlayers: number
    currentPlayers: number
    players: string[]
    createdAt: Date
    startedAt?: Date
    currentTick: number
}

const games: Map<string, GameData> = new Map()

// GET /api/game - List all games
export async function GET() {
    try {
        const gameList = Array.from(games.values()).map((game) => ({
            id: game.id,
            name: game.name,
            status: game.status,
            maxPlayers: game.maxPlayers,
            currentPlayers: game.currentPlayers,
            createdAt: game.createdAt,
        }))

        return NextResponse.json({
            success: true,
            games: gameList,
            total: gameList.length,
        })
    } catch (error) {
        console.error('Get games error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/game - Create a new game
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name,
            maxPlayers = GAME_CONSTANTS.MAX_PLAYERS,
            duration = GAME_CONSTANTS.MVP_CAMPAIGN_DURATION,
            creatorId,
        } = body

        // Validation
        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Game name is required' },
                { status: 400 }
            )
        }

        if (maxPlayers < GAME_CONSTANTS.MIN_PLAYERS || maxPlayers > GAME_CONSTANTS.MAX_PLAYERS) {
            return NextResponse.json(
                { success: false, error: `Max players must be between ${GAME_CONSTANTS.MIN_PLAYERS} and ${GAME_CONSTANTS.MAX_PLAYERS}` },
                { status: 400 }
            )
        }

        // Create game
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const game: GameData = {
            id: gameId,
            name,
            status: 'WAITING',
            maxPlayers,
            currentPlayers: creatorId ? 1 : 0,
            players: creatorId ? [creatorId] : [],
            createdAt: new Date(),
            currentTick: 0,
        }

        games.set(gameId, game)

        return NextResponse.json({
            success: true,
            game: {
                id: game.id,
                name: game.name,
                status: game.status,
                maxPlayers: game.maxPlayers,
                currentPlayers: game.currentPlayers,
                createdAt: game.createdAt,
            },
            message: 'Game created successfully',
        })
    } catch (error) {
        console.error('Create game error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
