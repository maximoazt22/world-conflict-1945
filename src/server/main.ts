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
// Start the Game Loop
setInterval(() => {
    game.processTick();

    // Broadcast updates to room
    io.to(DEFAULT_GAME_ID).emit('game:tick', {
        tick: game.tick,
        day: game.day,
    });

    // Process Construction Queue
    game.provinces.forEach(province => {
        if (province.construction && province.construction.building) {
            province.construction.timeLeft--;

            if (province.construction.timeLeft <= 0) {
                // Construction Complete
                const bType = province.construction.building;

                // Add to buildings list
                // For simplicity in MVP, we just use a boolean map or level counter
                // Using 'any' cast to bypass strict typing for MVP speed (should fix in Phase 4)
                const buildings = province.buildings as any;
                if (typeof buildings[bType] === 'number') {
                    buildings[bType]++;
                } else {
                    buildings[bType] = true;
                }

                console.log(`✅ Completed ${bType} in ${province.name}`);

                province.construction = { building: null, timeLeft: 0 };
                io.to(DEFAULT_GAME_ID).emit('province:update', province);
            }
        }
    });

}, 1000); // 1 tick = 1 second for now

// --- CONSTANTS ---
const NATION_MAPPING: Record<string, { name: string; provinces: string[]; color: string }> = {
    'usa': { name: 'United States', color: '#0A3161', provinces: ['840'] }, // Removed Canada/Mexico
    'canada': { name: 'Canada', color: '#FF0000', provinces: ['124'] },
    'mexico': { name: 'Mexico', color: '#006847', provinces: ['484'] },
    'china': { name: 'China', color: '#DE2910', provinces: ['156', '496', '704'] },
    'ussr': { name: 'Soviet Union', color: '#CC0000', provinces: ['643', '398', '804'] },
    'germany': { name: 'Germany', color: '#DD0000', provinces: ['276'] }, // Removed Poland/France
    'poland': { name: 'Poland', color: '#DC143C', provinces: ['616'] },
    'japan': { name: 'Japan', color: '#BC002D', provinces: ['392', '410', '158'] },
    'uk': { name: 'United Kingdom', color: '#012169', provinces: ['826', '372', '710'] },
    'france': { name: 'France', color: '#0055A4', provinces: ['250', '012'] }, // Removed Spain
    'spain': { name: 'Spain', color: '#F1BF00', provinces: ['724'] },
    'italy': { name: 'Italy', color: '#008C45', provinces: ['380', '300', '434'] },
    'brazil': { name: 'Brazil', color: '#059669', provinces: ['076', '604'] }, // Removed Argentina
    'argentina': { name: 'Argentina', color: '#75AADB', provinces: ['032'] },
    'india': { name: 'India', color: '#d97706', provinces: ['356', '586', '050'] },
};

const BUILDING_COSTS: Record<string, { money: number, materials: number, energy: number, food: number, time: number }> = {
    'industry': { money: 50, materials: 10, energy: 5, food: 0, time: 30 }, // 30s for demo
    'recruitment_office': { money: 20, materials: 5, energy: 0, food: 0, time: 10 },
    'bunker': { money: 25, materials: 15, energy: 0, food: 0, time: 15 },
    'fortress': { money: 150, materials: 50, energy: 0, food: 0, time: 60 },
    'tank_factory': { money: 100, materials: 30, energy: 5, food: 0, time: 45 },
};

// --- SOCKET EVENTS ---
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // --- BUILDING CONSTRUCTION ---
    socket.on('building:construct', (data) => {
        const { provinceId, type, playerId } = data;
        const player = game.players.get(playerId);
        const province = game.provinces.get(provinceId);

        if (!player || !province) return;

        // Validation
        if (province.ownerId !== playerId) {
            return; // Not your province
        }
        if (province.construction.building) {
            return; // Already building
        }

        const cost = BUILDING_COSTS[type];
        if (!cost) return;

        // check resources
        if (player.resources.money < cost.money ||
            player.resources.materials < cost.materials ||
            player.resources.energy < cost.energy ||
            player.resources.food < cost.food) {
            return; // Not enough resources
        }

        // Processing
        player.resources.money -= cost.money;
        player.resources.materials -= cost.materials;
        player.resources.energy -= cost.energy;
        player.resources.food -= cost.food;

        province.construction = {
            building: type,
            timeLeft: cost.time
        };

        // Emit updates
        socket.emit('game:state', { resources: player.resources }); // Update player UI
        io.to(DEFAULT_GAME_ID).emit('province:update', province); // Update map for everyone
        console.log(`🔨 ${player.username} started building ${type} in ${province.name}`);
    });

    // --- UNIT SYSTEM ---
    const UNIT_COSTS: Record<string, any> = {
        'INFANTRY': { money: 1000, food: 500, manpower: 100, time: 20 }, // 20 ticks (fast for testing)
        'TANK': { money: 5000, steel: 1000, oil: 500, manpower: 200, time: 60 }
    };

    socket.on('unit:recruit', (data: { provinceId: string, type: string }) => {
        const { provinceId, type } = data;
        // Access 'game' from closure scope
        const province = game.provinces.get(provinceId);

        // Find player by socket (Auth check)
        // In this MVP, we trust the client sends valid requests if they are authenticated via socket
        let player: Player | undefined;
        for (const p of game.players.values()) {
            if (p.socketId === socket.id) {
                player = p;
                break;
            }
        }

        if (!player) return; // Not authenticated / Not found
        if (!province || province.ownerId !== player.id) return; // Not owner

        // Check if already producing
        if (province.production.unitType) return;

        // Check prerequisites
        if (type === 'INFANTRY' && !province.buildings.barracks) {
            console.log(`❌ Recruitment failed: No Barracks in ${province.name}`);
            return;
        }
        if (type === 'TANK' && province.buildings.factory < 1) {
            console.log(`❌ Recruitment failed: No Factory in ${province.name}`);
            return;
        }

        const cost = UNIT_COSTS[type];
        if (!cost) return;

        // Check resources 
        if (player.resources.money < cost.money || player.resources.food < (cost.food || 0)) {
            return; // Not enough
        }

        // Deduct
        player.resources.money -= cost.money;
        if (cost.food) player.resources.food -= cost.food;
        // TODO: Materials/Energy deduction

        // Start Production
        province.production = {
            unitType: type,
            timeLeft: cost.time,
            queue: []
        };

        socket.emit('game:state', { resources: player.resources });
        io.to(DEFAULT_GAME_ID).emit('province:update', province);
        console.log(`🪖 ${player.username} recruiting ${type} in ${province.name}`);
    });


    socket.on('game:join', (data) => {
        const { username, nation, playerId } = data;
        console.log(`👤 ${username} joining as ${nation}`);

        socket.join(DEFAULT_GAME_ID);

        // check if player exists
        let player = game.players.get(playerId);
        if (!player) {
            player = new Player(playerId, username, nation, socket.id);

            // STARTER KIT IMPLEMENTATION
            const nationConfig = NATION_MAPPING[nation];
            if (nationConfig && player) {
                player.color = nationConfig.color; // Set player color from mapping

                // Assign Provinces
                let provincesAssigned = 0;

                nationConfig.provinces.forEach(provId => {
                    let prov = game.provinces.get(provId);
                    const DEFAULT_BUILDINGS = {
                        recruitment_office: false,
                        barracks: false,
                        workshop: 0,
                        factory: 0,
                        aerodrome: false,
                        harbor: false,
                        railroad: false,
                        fortress: 0
                    };

                    if (!prov) {
                        // Create placeholder province if not exists (Server authoritative state)
                        game.provinces.set(provId, {
                            id: provId,
                            name: `Region ${provId}`,
                            ownerId: player!.id,
                            ownerColor: player!.color,
                            resourceType: 'FOOD', // Default
                            baseProduction: 1000,
                            morale: 100,
                            buildings: { ...DEFAULT_BUILDINGS },
                            units: [],
                            coordX: 0, coordY: 0, coordZ: 0,
                            terrain: 'PLAINS',
                            construction: { building: null, timeLeft: 0 } // INIT CONSTRUCTION
                        } as any);
                    } else {
                        prov.ownerId = player!.id;
                        prov.ownerColor = player!.color;
                        if (!prov.construction) prov.construction = { building: null, timeLeft: 0 };
                        if (Array.isArray(prov.buildings)) prov.buildings = { ...DEFAULT_BUILDINGS };
                    }
                    provincesAssigned++;
                });

                console.log(`🗺️ Assigned ${provincesAssigned} initial provinces to ${username}`);
            }

            game.addPlayer(player);
        } else {
            player.isOnline = true;
            player.socketId = socket.id;
            // Optionally update color/nation if they changed it? No, keep persistence.
        }

        // Send Initial State
        // Convert Map to Array for JSON serialization
        const provincesArray = Array.from(game.provinces.values());
        const playersArray = Array.from(game.players.values());

        socket.emit('game:joined', {
            gameId: game.id,
            gameName: 'Global Conflict 1945',
            day: game.day,
            player: player,
            players: playersArray,
            resources: player.resources,
            provinces: provincesArray
        });

        // Broadcast new player to others (so they see the new territory)
        socket.broadcast.to(DEFAULT_GAME_ID).emit('game:update_provinces', provincesArray);
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
