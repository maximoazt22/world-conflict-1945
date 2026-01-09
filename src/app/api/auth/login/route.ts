import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'world-conflict-1945-secret-key-mvp'
)

// Demo user (always works without database)
const DEMO_USER = {
    id: 'demo_001',
    username: 'demo',
    password: 'demo123',
    nation: 'USA',
    color: '#4169E1',
}

// POST /api/auth/login
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password, token } = body

        // If token provided, verify it
        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET)
                return NextResponse.json({
                    success: true,
                    token,
                    user: {
                        id: payload.userId,
                        username: payload.username,
                        nation: payload.nation,
                        color: payload.color,
                    },
                })
            } catch {
                return NextResponse.json(
                    { success: false, error: 'Token inválido o expirado' },
                    { status: 401 }
                )
            }
        }

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        // Check demo user first (always works)
        if (username === DEMO_USER.username && password === DEMO_USER.password) {
            const newToken = await new SignJWT({
                userId: DEMO_USER.id,
                username: DEMO_USER.username,
                nation: DEMO_USER.nation,
                color: DEMO_USER.color,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(JWT_SECRET)

            return NextResponse.json({
                success: true,
                token: newToken,
                user: {
                    id: DEMO_USER.id,
                    username: DEMO_USER.username,
                    nation: DEMO_USER.nation,
                    color: DEMO_USER.color,
                },
            })
        }

        // Try database lookup
        try {
            const result = await sql`
                SELECT id, username, password_hash, nation, color 
                FROM users 
                WHERE username = ${username}
            `

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Usuario o contraseña incorrectos' },
                    { status: 401 }
                )
            }

            const user = result.rows[0]
            const passwordValid = await bcrypt.compare(password, user.password_hash)

            if (!passwordValid) {
                return NextResponse.json(
                    { success: false, error: 'Usuario o contraseña incorrectos' },
                    { status: 401 }
                )
            }

            // Create JWT
            const newToken = await new SignJWT({
                userId: user.id,
                username: user.username,
                nation: user.nation,
                color: user.color,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(JWT_SECRET)

            return NextResponse.json({
                success: true,
                token: newToken,
                user: {
                    id: user.id,
                    username: user.username,
                    nation: user.nation,
                    color: user.color,
                },
            })
        } catch (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { success: false, error: 'Usuario o contraseña incorrectos' },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, error: 'Error del servidor' },
            { status: 500 }
        )
    }
}
