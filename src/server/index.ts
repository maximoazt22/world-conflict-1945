// Entry point for the Socket.IO game server
// Run with: npx ts-node src/server/index.ts
// Or: bun src/server/index.ts

import { startSocketServer } from './gameServer.js'

console.log('🎖️ WORLD CONFLICT 1945 - Game Server')
console.log('=====================================')

startSocketServer()

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down game server...')
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down game server...')
    process.exit(0)
})
