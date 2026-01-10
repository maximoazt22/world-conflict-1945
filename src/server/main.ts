import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Game } from './models/Game';
import { Player } from './models/Player';

// --- SYSTEM STARTUP ---
console.log('--- 🎖️ SYSTEM STARTUP: SUPREMACY 2026 ENGINE ---');

const PORT = process.env.PORT || 3001;

// --- CONFIGURATION ---
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-5130638905255947-010916-8d5d897e509bdb3f1705b2169a8d0493-3124472152' });

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

import { Request, Response } from 'express';

// --- ENDPOINTS ---
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', engine: 'Supremacy 2026', timestamp: Date.now() });
});

app.get('/', (req: Request, res: Response) => {
    res.send('SUPREMACY 2026 - Game Server Engine Running');
});

// MercadoPago
app.post('/create_preference', async (req: Request, res: Response) => {
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: 'ARS',
                    id: 'item-ID-1234'
                },
            ],
            back_urls: {
                success: "https://world-conflict-1945.vercel.app/game",
                failure: "https://world-conflict-1945.vercel.app/game",
                pending: "https://world-conflict-1945.vercel.app/game",
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
    transports: ['websocket', 'polling']
});

// --- GAME ENGINE INTIALIZATION ---
const DEFAULT_GAME_ID = 'supremacy_world_1';
const game = new Game(DEFAULT_GAME_ID);
console.log(`🌍 Game Engine initialized: ${DEFAULT_GAME_ID}`);

// Start the Game Loop
setInterval(() => {
    game.processTick();

    // Broadcast updates to room
    io.to(DEFAULT_GAME_ID).emit('game:tick', {
        tick: game.tick,
        day: game.day,
        // TODO: Optimize payload, sending full state is expensive
    });
}, 1000); // 1 tick = 1 second for now

// --- SOCKET EVENTS ---
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('game:join', (data) => {
        const { username, nation, playerId } = data;
        console.log(`👤 ${username} joining as ${nation}`);

        socket.join(DEFAULT_GAME_ID);

        // check if player exists
        let player = game.players.get(playerId);
        if (!player) {
            player = new Player(playerId, username, nation, socket.id);
            game.addPlayer(player);
        } else {
            player.isOnline = true;
            player.socketId = socket.id;
        }

        // Send Initial State
        socket.emit('game:state', {
            gameId: game.id,
            day: game.day,
            player: player,
            resources: player.resources,
            // provinces: Array.from(game.provinces.values()) // TODO: Send provinces
        });
    });

    socket.on('disconnect', () => {
        // Mark player offline
        // Find player by socketId
        for (const player of game.players.values()) {
            if (player.socketId === socket.id) {
                player.isOnline = false;
                break;
            }
        }
    });
});

// --- START SERVER ---
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});
