import Redis from 'ioredis'

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Use lazy connect to avoid connection errors if Redis is not available
let redis: Redis | null = null

export const getRedis = (): Redis => {
    if (!redis) {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000)
                return delay
            },
            lazyConnect: true,
            enableReadyCheck: false,
        })

        redis.on('connect', () => {
            console.log('✅ Redis connected')
        })

        redis.on('error', (err) => {
            console.error('❌ Redis error:', err.message)
        })

        redis.on('close', () => {
            console.log('⚠️ Redis disconnected')
        })
    }

    return redis
}

// Cache helpers
export const cache = {
    // Set with TTL (Time to Live in seconds)
    async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
        try {
            const client = getRedis()
            await client.setex(key, ttl, JSON.stringify(value))
        } catch (error) {
            console.error('Cache set error:', error)
        }
    },

    // Get parsed JSON value
    async get<T>(key: string): Promise<T | null> {
        try {
            const client = getRedis()
            const value = await client.get(key)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.error('Cache get error:', error)
            return null
        }
    },

    // Delete key
    async delete(key: string): Promise<void> {
        try {
            const client = getRedis()
            await client.del(key)
        } catch (error) {
            console.error('Cache delete error:', error)
        }
    },

    // Delete keys by pattern
    async deletePattern(pattern: string): Promise<void> {
        try {
            const client = getRedis()
            const keys = await client.keys(pattern)
            if (keys.length > 0) {
                await client.del(...keys)
            }
        } catch (error) {
            console.error('Cache deletePattern error:', error)
        }
    },

    // Check if key exists
    async exists(key: string): Promise<boolean> {
        try {
            const client = getRedis()
            const result = await client.exists(key)
            return result === 1
        } catch (error) {
            console.error('Cache exists error:', error)
            return false
        }
    },

    // Increment value
    async incr(key: string): Promise<number> {
        try {
            const client = getRedis()
            return await client.incr(key)
        } catch (error) {
            console.error('Cache incr error:', error)
            return 0
        }
    },

    // Get TTL remaining
    async ttl(key: string): Promise<number> {
        try {
            const client = getRedis()
            return await client.ttl(key)
        } catch (error) {
            console.error('Cache ttl error:', error)
            return -1
        }
    },
}

// Game-specific cache keys
export const cacheKeys = {
    // Game state
    gameState: (gameId: string) => `game:${gameId}:state`,
    gameProvinces: (gameId: string) => `game:${gameId}:provinces`,
    gamePlayers: (gameId: string) => `game:${gameId}:players`,
    gameBattles: (gameId: string) => `game:${gameId}:battles`,

    // Player session
    playerSession: (playerId: string) => `player:${playerId}:session`,
    playerResources: (playerId: string) => `player:${playerId}:resources`,
    playerArmies: (playerId: string) => `player:${playerId}:armies`,

    // Leaderboard
    leaderboard: (gameId: string) => `game:${gameId}:leaderboard`,

    // Chat
    chatHistory: (gameId: string, type: string) => `game:${gameId}:chat:${type}`,

    // Rate limiting
    rateLimit: (playerId: string, action: string) => `ratelimit:${playerId}:${action}`,
}

export default getRedis
