import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'world-conflict-1945-secret-key-mvp'
)

// Initialize users table if it doesn't exist
async function initializeTable() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password_hash TEXT NOT NULL,
                nation TEXT DEFAULT 'USA',
                color TEXT DEFAULT '#4169E1',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `
    } catch (error) {
        console.error('Table initialization error:', error)
    }
}

// POST /api/auth/register
export async function POST(request: Request) {
    try {
        // Initialize table on first request
        await initializeTable()

        const body = await request.json()
        const { username, email, password, nation, color } = body

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        if (username.length < 3) {
            return NextResponse.json(
                { success: false, error: 'Usuario debe tener al menos 3 caracteres' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await sql`
            SELECT id FROM users WHERE username = ${username}
        `

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { success: false, error: 'El usuario ya existe' },
                { status: 409 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const userNation = nation || 'USA'
        const userColor = color || '#4169E1'

        await sql`
            INSERT INTO users (id, username, email, password_hash, nation, color)
            VALUES (${userId}, ${username}, ${email || null}, ${passwordHash}, ${userNation}, ${userColor})
        `

        // Create JWT token
        const token = await new SignJWT({
            userId,
            username,
            nation: userNation,
            color: userColor,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET)

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: userId,
                username,
                email,
                nation: userNation,
                color: userColor,
            },
            message: '¡Usuario registrado exitosamente!',
        })
    } catch (error) {
        console.error('Registration error:', error)

        // Check if it's a database connection error
        if (error instanceof Error && error.message.includes('POSTGRES')) {
            return NextResponse.json(
                { success: false, error: 'Base de datos no configurada. Contacta al admin.' },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Error del servidor' },
            { status: 500 }
        )
    }
}
