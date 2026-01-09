# WORLD CONFLICT 1945 - Environment Configuration
# ================================================
# Copy this content to a file named `.env.local` in the root directory
# The .env.local file is gitignored for security

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/worldconflict1945"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# WebSocket Server
NEXT_PUBLIC_WS_URL="http://localhost:3001"

# Redis (optional for MVP - can work without it)
REDIS_URL="redis://localhost:6379"

# Development
NODE_ENV="development"

# ================================================
# SETUP INSTRUCTIONS
# ================================================
# 1. Copy this file content to `.env.local`
# 2. Install PostgreSQL and create database: worldconflict1945
# 3. Run `npx prisma db push` to create tables
# 4. Run `npm run dev` to start the development server
