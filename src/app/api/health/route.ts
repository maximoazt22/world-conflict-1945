import { NextResponse } from 'next/server'

// GET /api/health - Health check endpoint
export async function GET() {
    const now = new Date()

    return NextResponse.json({
        status: 'ok',
        service: 'World Conflict 1945 API',
        version: '0.1.0',
        timestamp: now.toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
            api: 'healthy',
            database: process.env.DATABASE_URL ? 'configured' : 'not configured',
            redis: process.env.REDIS_URL ? 'configured' : 'not configured',
            websocket: process.env.NEXT_PUBLIC_WS_URL ? 'configured' : 'not configured',
        },
    })
}
