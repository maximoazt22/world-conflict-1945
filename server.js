const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { MercadoPagoConfig, Preference } = require('mercadopago')

const PORT = process.env.PORT || 3001
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-5130638905255947-010916-8d5d897e509bdb3f1705b2169a8d0493-3124472152' });

const app = express()
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() })
})

app.get('/', (req, res) => {
    res.send('WORLD CONFLICT 1945 - Game Server')
})

// Mercado Pago Preference Endpoint
app.post('/create_preference', async (req, res) => {
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: 'ARS',
                },
            ],
            back_urls: {
                success: "https://world-conflict-1945.vercel.app/game", // Return to game
                failure: "https://world-conflict-1945.vercel.app/game",
                pending: "https://world-conflict-1945.vercel.app/game",
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const httpServer = createServer(app)

// Create Socket.IO server within existing Express server
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
})

// Game state
const gameRooms = new Map()
const connectedPlayers = new Map()
const chatHistory = [] // Global chat history

// Game configuration
const TICK_RATE = 1000 // 1 second
const VICTORY_THRESHOLD = 30 // Provinces needed to win

// 2026 RESOURCE SYSTEM - Real Market Prices
// money: Billones USD, oil: Mb (millones barriles), gas: Bcf, uranium: klb
// lithium: kt, rareEarth: kt, copper: kt, gold: toneladas, steel: Mt
// silicon: kt, food: Mt, manpower: Millones
const RESOURCE_RATE = {
    money: 25,      // $25B per province/day
    oil: 3,         // 3 Mb per province  
    gas: 2,         // 2 Bcf
    uranium: 0.3,   // 0.3 klb
    lithium: 0.5,   // 0.5 kt
    rareEarth: 0.2, // 0.2 kt
    copper: 5,      // 5 kt
    gold: 0.1,      // 0.1 t
    steel: 8,       // 8 Mt
    silicon: 1,     // 1 kt
    food: 10,       // 10 Mt
    manpower: 2     // 2 M
}

// Unit costs in 2026 resources (more realistic war economy)
const UNIT_COSTS = {
    infantry: { money: 1, steel: 0.1, food: 0.5, manpower: 1, strength: 1 },
    tank: { money: 10, steel: 2, oil: 1, copper: 0.5, strength: 5 },
    artillery: { money: 5, steel: 1.5, copper: 0.3, strength: 3 },
    fighter: { money: 25, steel: 1, oil: 2, silicon: 0.5, strength: 6 },
    drone: { money: 15, silicon: 1, lithium: 0.5, rareEarth: 0.2, strength: 4 },
    battleship: { money: 100, steel: 10, oil: 5, copper: 2, strength: 10 },
    submarine: { money: 80, steel: 8, uranium: 1, silicon: 0.5, strength: 8 },
    missile: { money: 50, uranium: 0.5, rareEarth: 0.3, silicon: 0.5, strength: 15 }
}

// ========================================
// UNIT SPRITES / AVATARS - Ragnarok Style
// Each unit has an icon, name, and visual style
// ========================================
const UNIT_SPRITES = {
    infantry: {
        icon: '🚶',
        sprite: '⚔️🧍',      // Soldier with weapon
        name: 'Soldado',
        nameEn: 'Infantry',
        hp: 100,
        attack: 10,
        defense: 8,
        speed: 1,           // Slowest
        range: 1,           // Melee
        terrain: ['PLAINS', 'FOREST', 'URBAN', 'MOUNTAINS', 'DESERT', 'JUNGLE']
    },
    tank: {
        icon: '🚜',
        sprite: '🛡️🚜',     // Armored vehicle
        name: 'Tanque',
        nameEn: 'Tank',
        hp: 500,
        attack: 50,
        defense: 40,
        speed: 2,
        range: 2,
        terrain: ['PLAINS', 'DESERT', 'URBAN']  // Can't go in jungle/mountains
    },
    artillery: {
        icon: '💥',
        sprite: '🎯💥',     // Long range cannon
        name: 'Artillería',
        nameEn: 'Artillery',
        hp: 200,
        attack: 80,
        defense: 15,
        speed: 0.5,         // Very slow
        range: 5,           // Long range
        terrain: ['PLAINS', 'DESERT']
    },
    fighter: {
        icon: '✈️',
        sprite: '🦅✈️',     // Combat aircraft
        name: 'Caza',
        nameEn: 'Fighter',
        hp: 150,
        attack: 60,
        defense: 20,
        speed: 10,          // Very fast
        range: 8,           // Air superiority
        terrain: ['ALL']    // Flies over everything
    },
    drone: {
        icon: '🛸',
        sprite: '👁️🛸',     // Surveillance drone
        name: 'Drone',
        nameEn: 'Drone',
        hp: 50,
        attack: 40,
        defense: 5,
        speed: 12,          // Fastest
        range: 6,
        terrain: ['ALL']
    },
    battleship: {
        icon: '🚢',
        sprite: '⚓🚢',     // Naval warship
        name: 'Acorazado',
        nameEn: 'Battleship',
        hp: 1000,
        attack: 100,
        defense: 80,
        speed: 0.3,         // Very slow
        range: 10,          // Coastal bombardment
        terrain: ['COASTAL', 'OCEAN']
    },
    submarine: {
        icon: '🦈',
        sprite: '🌊🦈',     // Stealth submarine
        name: 'Submarino',
        nameEn: 'Submarine',
        hp: 300,
        attack: 80,
        defense: 30,
        speed: 0.5,
        range: 4,
        stealth: true,      // Hidden until attacks
        terrain: ['COASTAL', 'OCEAN']
    },
    missile: {
        icon: '🚀',
        sprite: '💢🚀',     // Ballistic missile
        name: 'Misil',
        nameEn: 'Missile',
        hp: 10,             // One-shot weapon
        attack: 200,        // Devastating
        defense: 0,
        speed: 50,          // Fastest
        range: 20,          // Intercontinental
        oneShot: true,      // Destroyed after use
        terrain: ['ALL']
    }
}

// --- COMBAT & PATHFINDING CONSTANTS ---
// Combat effectiveness matrix (attacker vs defender)
// Values > 1.0 = advantage, < 1.0 = disadvantage
const COMBAT_MULTIPLIERS = {
    infantry: { infantry: 1.0, tank: 0.4, artillery: 1.3, fighter: 0.2, drone: 0.3, battleship: 0.1, submarine: 0.1, missile: 0.1 },
    tank: { infantry: 2.5, tank: 1.0, artillery: 1.5, fighter: 0.4, drone: 0.5, battleship: 0.2, submarine: 0.1, missile: 0.2 },
    artillery: { infantry: 2.0, tank: 1.2, artillery: 1.0, fighter: 0.3, drone: 0.4, battleship: 1.8, submarine: 0.2, missile: 0.3 },
    fighter: { infantry: 3.0, tank: 2.0, artillery: 1.5, fighter: 1.0, drone: 1.5, battleship: 0.8, submarine: 0.3, missile: 0.2 },
    drone: { infantry: 2.5, tank: 1.5, artillery: 2.0, fighter: 0.7, drone: 1.0, battleship: 0.5, submarine: 0.4, missile: 0.3 },
    battleship: { infantry: 4.0, tank: 3.0, artillery: 2.5, fighter: 1.5, drone: 2.0, battleship: 1.0, submarine: 0.6, missile: 0.4 },
    submarine: { infantry: 1.0, tank: 0.5, artillery: 0.3, fighter: 0.2, drone: 0.3, battleship: 2.5, submarine: 1.0, missile: 0.3 },
    missile: { infantry: 5.0, tank: 4.0, artillery: 3.5, fighter: 2.0, drone: 2.5, battleship: 3.0, submarine: 2.0, missile: 1.0 },
}

// Country Border Adjacency (for real world map)
const COUNTRY_BORDERS = {
    // North America
    "840": ["124", "484", "192"], // USA -> CAN, MEX, CUB (by numeric ISO)
    "124": ["840"], // CAN -> USA
    "484": ["840", "320", "84"], // MEX -> USA, GTM, BLZ
    // South America  
    "076": ["858", "032", "600", "068", "604", "170", "862", "328", "740"], // BRA
    "032": ["152", "068", "600", "076", "858"], // ARG
    "152": ["032", "068", "604"], // CHL
    // Europe
    "276": ["208", "616", "203", "40", "756", "250", "442", "56", "528"], // DEU
    "250": ["724", "380", "756", "276", "442", "56", "826"], // FRA
    "826": ["372", "250"], // GBR
    "643": ["578", "246", "233", "428", "440", "616", "112", "804", "268", "31", "398", "156", "496", "408", "840"], // RUS
    // Asia
    "156": ["643", "496", "408", "410", "704", "418", "104", "356", "64", "524", "586", "4", "762", "417", "398"], // CHN
    "356": ["586", "156", "524", "64", "50", "104", "144"], // IND
    "392": ["410", "156", "643"], // JPN
    "410": ["408", "392", "156"], // KOR
    // Oceania
    "036": ["360", "598", "554"], // AUS
    // Africa
    "818": ["434", "729", "562", "466", "887", "788", "504"], // EGY
    "710": ["72", "516", "426", "508", "748", "894"], // ZAF
    // Middle East
    "682": ["887", "400", "368", "414", "784", "512", "512"], // SAU
    "792": ["300", "100", "268", "51", "364", "368", "760"], // TUR
}

// Alternative: Allow any-to-any movement (simplified for MVP - distance-based delay)
function findPath(startId, endId, provinces) {
    // For country IDs, we use the COUNTRY_BORDERS or allow direct movement
    const neighbors = COUNTRY_BORDERS[startId]

    if (neighbors && neighbors.includes(endId)) {
        // Direct neighbor - 1 step
        return [startId, endId]
    }

    // Not direct neighbor - BFS through borders
    const queue = [[startId]]
    const visited = new Set([startId])

    const getNeighbors = (id) => {
        return COUNTRY_BORDERS[id] || []
    }

    while (queue.length > 0) {
        const path = queue.shift()
        const node = path[path.length - 1]

        if (node === endId) return path

        for (const neighbor of getNeighbors(node)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push([...path, neighbor])
            }
        }
    }

    // Fallback: Allow any movement (for countries not in adjacency list)
    // Distance would be 1 for simplicity
    return [startId, endId]
}

// ========================================
// BUILDING SYSTEM - Age of Empires Style
// Buildings can generate units over time!
// ========================================

const BUILDING_TYPES = {
    // Economic Buildings
    industry: {
        name: 'Industria',
        icon: '🏭',
        cost: { money: 50, steel: 10, copper: 5 },
        buildTime: 1800000, // 30 min
        effect: { steelBonus: 5, copperBonus: 2 },
        generates: null
    },
    refinery: {
        name: 'Refinería',
        icon: '⛽',
        cost: { money: 75, steel: 20, copper: 8 },
        buildTime: 2400000, // 40 min
        effect: { oilBonus: 5, gasBonus: 3 },
        generates: null
    },
    lab: {
        name: 'Laboratorio',
        icon: '🔬',
        cost: { money: 100, steel: 5, silicon: 10, rareEarth: 2 },
        buildTime: 3600000, // 1 hour
        effect: { siliconBonus: 3, uraniumBonus: 1 },
        generates: null
    },

    // Defense Buildings
    bunker: {
        name: 'Búnker',
        icon: '🛡️',
        cost: { money: 25, steel: 15, copper: 2 },
        buildTime: 900000, // 15 min
        effect: { defenseBonus: 30 },
        generates: null
    },
    fortress: {
        name: 'Fortaleza',
        icon: '🏰',
        cost: { money: 150, steel: 50, copper: 15 },
        buildTime: 7200000, // 2 hours
        effect: { defenseBonus: 60 },
        generates: null
    },

    // UNIT PRODUCTION BUILDINGS
    barracks: {
        name: 'Cuartel',
        icon: '🎖️',
        cost: { money: 30, steel: 5, food: 10 },
        buildTime: 600000, // 10 min
        effect: {},
        generates: {
            unitType: 'infantry',
            quantity: 10,           // 10 soldiers
            interval: 300000,       // Every 5 minutes
            requires: { food: 5, manpower: 1 }
        }
    },
    recruitment_office: {
        name: 'Oficina Reclutamiento',
        icon: '📋',
        cost: { money: 20, steel: 2 },
        buildTime: 300000, // 5 min
        effect: {},
        generates: {
            unitType: 'infantry',
            quantity: 5,            // 5 soldiers (less than barracks)
            interval: 600000,       // Every 10 minutes
            requires: { food: 2, manpower: 0.5 }
        }
    },
    tank_factory: {
        name: 'Fábrica de Tanques',
        icon: '🚜',
        cost: { money: 100, steel: 30, copper: 10, oil: 5 },
        buildTime: 3600000, // 1 hour
        effect: {},
        generates: {
            unitType: 'tank',
            quantity: 2,            // 2 tanks
            interval: 1800000,      // Every 30 min
            requires: { steel: 5, oil: 3 }
        }
    },
    artillery_foundry: {
        name: 'Fundición Artillería',
        icon: '💥',
        cost: { money: 80, steel: 25, copper: 8 },
        buildTime: 2400000, // 40 min
        effect: {},
        generates: {
            unitType: 'artillery',
            quantity: 3,
            interval: 1200000,      // Every 20 min
            requires: { steel: 3, copper: 1 }
        }
    },
    airport: {
        name: 'Aeropuerto',
        icon: '✈️',
        cost: { money: 150, steel: 40, oil: 20, silicon: 5 },
        buildTime: 5400000, // 90 min
        effect: {},
        generates: {
            unitType: 'fighter',
            quantity: 1,            // 1 fighter
            interval: 3600000,      // Every 1 hour
            requires: { oil: 10, silicon: 2 }
        }
    },
    drone_facility: {
        name: 'Centro de Drones',
        icon: '🛸',
        cost: { money: 120, silicon: 15, lithium: 5, rareEarth: 3 },
        buildTime: 4800000, // 80 min
        effect: {},
        generates: {
            unitType: 'drone',
            quantity: 2,            // 2 drones
            interval: 1800000,      // Every 30 min
            requires: { silicon: 3, lithium: 1 }
        }
    },
    naval_yard: {
        name: 'Astillero Naval',
        icon: '🚢',
        cost: { money: 200, steel: 60, copper: 20, oil: 15 },
        buildTime: 7200000, // 2 hours
        effect: {},
        generates: {
            unitType: 'battleship',
            quantity: 1,
            interval: 7200000,      // Every 2 hours
            requires: { steel: 15, oil: 10 }
        }
    },
    submarine_pen: {
        name: 'Base Submarina',
        icon: '🦈',
        cost: { money: 180, steel: 50, uranium: 5, silicon: 8 },
        buildTime: 5400000, // 90 min
        effect: {},
        generates: {
            unitType: 'submarine',
            quantity: 1,
            interval: 5400000,      // Every 90 min
            requires: { steel: 10, uranium: 2 }
        }
    },
    missile_silo: {
        name: 'Silo de Misiles',
        icon: '🚀',
        cost: { money: 250, steel: 30, uranium: 10, rareEarth: 5, silicon: 10 },
        buildTime: 10800000, // 3 hours
        effect: {},
        generates: {
            unitType: 'missile',
            quantity: 1,
            interval: 10800000,     // Every 3 hours
            requires: { uranium: 3, rareEarth: 2 }
        }
    }
}

// Legacy compat
const BUILDING_COSTS = Object.fromEntries(
    Object.entries(BUILDING_TYPES).map(([k, v]) => [k, { ...v.cost, buildTime: v.buildTime }])
)

const GAME_TIMINGS = {
    CAPTURE_TIME: 900000, // 15 minutes to capture
    RECRUITMENT_TIME: 300000, // 5 minutes to recruit
}

// ========================================
// SUPREMACY-STYLE INVASION SYSTEM
// ========================================

// Velocidades de movimiento (milisegundos por provincia)
// REALISTIC WALKING TIMES - A soldier walking across a country border
// Real world: ~50km border, walking 5km/h = 10 hours
// We'll use shorter times for gameplay but still VERY slow
const MOVEMENT_SPEEDS = {
    infantry: 3600000,   // 1 HORA por provincia (soldados a pie, lento)
    tank: 1800000,       // 30 min (blindados - más rápidos)
    artillery: 2700000,  // 45 min (artillería pesada - muy lenta)
    fighter: 300000,     // 5 min (aviones - rápidos)
    drone: 180000,       // 3 min (drones - muy rápidos)
    battleship: 5400000, // 90 min (naval - lentos, océanos grandes)
    submarine: 3600000,  // 60 min (submarinos - sigilosos pero lentos)
    missile: 60000       // 1 min (misiles - impacto casi instantáneo)
}

// Terrain modifiers for movement and combat
const TERRAIN_MODIFIERS = {
    PLAINS: { moveSpeed: 1.0, attackBonus: 1.0, defenseBonus: 1.0 },
    FOREST: { moveSpeed: 0.7, attackBonus: 0.8, defenseBonus: 1.3 },  // Harder to attack
    MOUNTAINS: { moveSpeed: 0.5, attackBonus: 0.6, defenseBonus: 1.5 },  // Very defensive
    URBAN: { moveSpeed: 0.8, attackBonus: 0.7, defenseBonus: 1.4 },  // City fighting
    DESERT: { moveSpeed: 0.9, attackBonus: 1.1, defenseBonus: 0.9 },  // Open terrain
    COASTAL: { moveSpeed: 1.0, attackBonus: 1.0, defenseBonus: 1.0 },  // Naval access
    JUNGLE: { moveSpeed: 0.4, attackBonus: 0.5, defenseBonus: 1.6 },  // Guerrilla advantage
}

// Province morale system (0-100%)
// Low morale = less production, easier to capture
// High morale = bonus production, harder to capture
const MORALE_CONFIG = {
    BASE_MORALE: 75,           // Starting morale for neutral provinces
    OWNED_MORALE: 85,          // Starting morale when you capture
    MORALE_DECAY_RATE: 0.5,    // % per hour if under attack
    MORALE_RECOVERY_RATE: 1,   // % per hour when peaceful
    MIN_MORALE: 10,            // Minimum (rebellion threshold)
    MAX_MORALE: 100,
    REBELLION_THRESHOLD: 20,   // Below this, province may revolt
    PRODUCTION_MODIFIER: 0.5,  // At 50% morale = 75% production
}

// Siege/Capture mechanics (Supremacy 1914 style)
// Provinces don't flip instantly - they require sustained presence
const SIEGE_CONFIG = {
    // Time to capture based on garrison/attackers ratio
    // If attackers outnumber 10:1, capture in 5 min
    // If equal forces, capture in 2 hours
    BASE_CAPTURE_TIME: 7200000,  // 2 hours base (ms)
    MIN_CAPTURE_TIME: 300000,    // 5 min minimum
    MAX_CAPTURE_TIME: 14400000,  // 4 hours maximum

    // Capture progress (0-100%)
    PROGRESS_TICK_RATE: 60000,   // Update every 1 min

    // Defender bonuses
    FORTIFICATION_BONUS: 0.5,    // 50% slower capture if fortified
    BUNKER_BONUS: 0.3,           // Additional 30% with bunker
    CAPITAL_BONUS: 0.5,          // 50% harder to capture capitals
}

// Combat resolution (battles are not instant)
const COMBAT_CONFIG = {
    BATTLE_TICK_RATE: 60000,     // Combat round every 1 min
    DAMAGE_VARIANCE: 0.2,        // ±20% random damage
    RETREAT_THRESHOLD: 0.3,      // Auto-retreat at 30% strength
    PURSUIT_DAMAGE: 1.5,         // 50% extra damage when retreating
    ENCIRCLEMENT_BONUS: 1.3,     // 30% bonus if attacking from multiple provinces
}

// ========================================
// INVASION HELPER FUNCTIONS
// ========================================

// Calculate time needed to capture a province
function calculateCaptureTime(attackerStrength, defenderStrength, provinceTerrain, buildings) {
    // Base time modified by force ratio
    const ratio = defenderStrength > 0 ? attackerStrength / defenderStrength : 10
    let captureTime = SIEGE_CONFIG.BASE_CAPTURE_TIME / Math.min(ratio, 10)

    // Apply terrain defense bonus
    const terrain = TERRAIN_MODIFIERS[provinceTerrain] || TERRAIN_MODIFIERS.PLAINS
    captureTime *= terrain.defenseBonus

    // Apply building bonuses
    if (buildings && buildings.includes('bunker')) {
        captureTime *= (1 + SIEGE_CONFIG.BUNKER_BONUS)
    }
    if (buildings && buildings.includes('fortress')) {
        captureTime *= (1 + SIEGE_CONFIG.FORTIFICATION_BONUS)
    }

    // Clamp to min/max
    return Math.max(SIEGE_CONFIG.MIN_CAPTURE_TIME, Math.min(SIEGE_CONFIG.MAX_CAPTURE_TIME, captureTime))
}

// Calculate combat damage per tick
function calculateCombatDamage(attackerUnits, defenderUnits, terrain) {
    let attackerDamage = 0
    let defenderDamage = 0

    const terrainMod = TERRAIN_MODIFIERS[terrain] || TERRAIN_MODIFIERS.PLAINS

    // Each attacker unit type deals damage to each defender type
    for (const aUnit of attackerUnits) {
        const aType = aUnit.type
        const aStrength = aUnit.quantity * (aUnit.strength || 1)

        for (const dUnit of defenderUnits) {
            const dType = dUnit.type
            const multiplier = COMBAT_MULTIPLIERS[aType]?.[dType] || 1.0

            // Attacker deals damage modified by multiplier and attack terrain bonus
            const variance = 1 + (Math.random() * COMBAT_CONFIG.DAMAGE_VARIANCE * 2 - COMBAT_CONFIG.DAMAGE_VARIANCE)
            attackerDamage += aStrength * multiplier * terrainMod.attackBonus * variance * 0.1
        }
    }

    // Defenders deal counter damage with defense bonus
    for (const dUnit of defenderUnits) {
        const dType = dUnit.type
        const dStrength = dUnit.quantity * (dUnit.strength || 1)

        for (const aUnit of attackerUnits) {
            const aType = aUnit.type
            const multiplier = COMBAT_MULTIPLIERS[dType]?.[aType] || 1.0

            const variance = 1 + (Math.random() * COMBAT_CONFIG.DAMAGE_VARIANCE * 2 - COMBAT_CONFIG.DAMAGE_VARIANCE)
            defenderDamage += dStrength * multiplier * terrainMod.defenseBonus * variance * 0.1
        }
    }

    return { attackerDamage, defenderDamage }
}

// Apply damage to units, returns remaining units
function applyDamage(units, damage) {
    let remainingDamage = damage
    const result = []

    for (const unit of [...units].sort((a, b) => a.strength - b.strength)) {
        if (remainingDamage <= 0) {
            result.push(unit)
            continue
        }

        const unitStrength = unit.quantity * (unit.strength || 1)
        if (remainingDamage >= unitStrength) {
            // Unit destroyed
            remainingDamage -= unitStrength
            console.log(`💀 ${unit.type} x${unit.quantity} destroyed`)
        } else {
            // Partial damage - reduce quantity
            const casualtyRatio = remainingDamage / unitStrength
            const casualties = Math.ceil(unit.quantity * casualtyRatio)
            unit.quantity = Math.max(0, unit.quantity - casualties)
            remainingDamage = 0
            if (unit.quantity > 0) result.push(unit)
            console.log(`🩸 ${unit.type} lost ${casualties}, ${unit.quantity} remaining`)
        }
    }

    return result.filter(u => u.quantity > 0)
}

// Calculate morale effect on production
function getMoraleProductionModifier(morale) {
    // 100 morale = 100% production
    // 50 morale = 75% production
    // 10 morale = 55% production
    const modifier = MORALE_CONFIG.PRODUCTION_MODIFIER
    return modifier + ((1 - modifier) * (morale / 100))
}

// Check if province should revolt (very low morale)
function checkRebellion(province) {
    if (province.morale <= MORALE_CONFIG.REBELLION_THRESHOLD) {
        // 10% chance per tick when below threshold
        return Math.random() < 0.1
    }
    return false
}

// Helper to reset game
function resetGame(room) {
    room.status = 'WAITING'
    room.provinces.clear()
    room.armies.clear()

    // New Seed
    const newSeed = Math.floor(Math.random() * 10000)
    room.mapSeed = newSeed

    // Notify all
    io.to(room.id).emit('game:reset', { mapSeed: newSeed })
    io.to(room.id).emit('game:victory', { // Clear victory screen
        winnerId: null,
        winnerName: null,
        provinceCount: 0,
        message: 'NEW_GAME'
    })

    // Clear server state
    room.provinces.clear()
    room.armies.clear()
    room.players.forEach(p => {
        p.resources = {
            money: 500, oil: 50, gas: 30, uranium: 5, lithium: 10,
            rareEarth: 3, copper: 200, gold: 2, steel: 100,
            silicon: 15, food: 500, manpower: 50
        }
        p.provinces = []
    })

    // Request clients to rejoin/resync
    io.to(room.id).emit('system:reload')

    console.log(`🔄 Game ${room.id} restarted! New Seed: ${newSeed}`)
}

// Default game room
const DEFAULT_GAME = 'world-war-1945'
gameRooms.set(DEFAULT_GAME, {
    id: DEFAULT_GAME,
    name: 'WORLD CONFLICT 1945',
    players: new Map(),
    tick: 0,
    status: 'PLAYING',
    diplomacy: new Map(), // key: "player1_player2" -> value: "ally"/"war"/"neutral"
    tradeOffers: [] // Array of pending trade offers
})

// Check if player has won
function checkVictory(room, playerInfo, io) {
    let provinceCount = 0
    room.provinces.forEach((prov) => {
        if (prov.ownerId === playerInfo.playerId) {
            provinceCount++
        }
    })

    console.log(`📊 ${playerInfo.username} owns ${provinceCount}/${VICTORY_THRESHOLD} provinces`)

    if (provinceCount >= VICTORY_THRESHOLD) {
        console.log(`🏆 ${playerInfo.username} WINS THE GAME!`)
        room.status = 'ENDED'
        room.winner = playerInfo.playerId

        io.to(playerInfo.gameId).emit('game:victory', {
            winnerId: playerInfo.playerId,
            winnerName: playerInfo.username,
            provinceCount: provinceCount,
            message: `¡${playerInfo.username} ha conquistado ${provinceCount} provincias y gana la partida!`
        })
    }
}

// Socket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`)

    // System ping
    socket.on('system:ping', (callback) => {
        if (typeof callback === 'function') callback()
    })

    // VS Code / Dev Restart
    socket.on('game:restart', () => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (room) {
            resetGame(room)
        }
    })

    // Join game
    socket.on('game:join', (data) => {
        const { gameId = DEFAULT_GAME, playerId, username, nation, color } = data

        console.log(`👤 ${username} joining game ${gameId}`)

        // Get or create game room
        let room = gameRooms.get(gameId)
        if (!room) {
            room = {
                id: gameId,
                name: gameId,
                players: new Map(),
                armies: new Map(), // Track all armies
                tick: 0,
                status: 'PLAYING',
                mapSeed: Math.floor(Math.random() * 1000000),
                provinces: new Map()
            }
            gameRooms.set(gameId, room)
        }

        // Check unique nation
        if (nation) {
            for (const [pid, p] of room.players) {
                if (p.nation === nation && pid !== playerId) {
                    socket.emit('error', { message: `La nación ${nation} ya está ocupada por ${p.username}` })
                    return
                }
            }
        }

        // Assign starting province based on real geography
        // Maps user selection (types.ts IDs) to Map IDs (ISO Numeric)
        const NATION_MAPPING = {
            'usa': '840',      // United States
            'ussr': '643',     // Russia
            'germany': '276',  // Germany
            'uk': '826',       // United Kingdom
            'japan': '392',    // Japan
            'italy': '380',    // Italy
            'france': '250',   // France
            'china': '156',    // China
            'brazil': '076',   // Brazil
            'argentina': '032',// Argentina
            'chile': '152',    // Chile
            'spain': '724',    // Spain
            'canada': '124',   // Canada
            'australia': '036' // Australia
        }

        const startingProvinceId = NATION_MAPPING[nation] || '840' // Default to USA if unknown

        // Create player data
        // Create player data
        const player = {
            id: playerId || `player_${Date.now()}`,
            socketId: socket.id,
            username: username || 'Anonymous',
            nation: nation || 'USA',
            color: color || '#4169E1',
            // STARTER KIT: High resources for immediate action
            resources: {
                money: 20000, oil: 5000, gas: 3000, uranium: 500, lithium: 1000,
                rareEarth: 300, copper: 2000, gold: 200, steel: 10000,
                silicon: 1500, food: 50000, manpower: 5000
            },
            provinces: [startingProvinceId],
            isOnline: true,
            joinedAt: Date.now()
        }

        // Claim starting province WITH BUILDINGS
        const existingProv = room.provinces.get(startingProvinceId) || {}
        room.provinces.set(startingProvinceId, {
            ...existingProv,
            id: startingProvinceId,
            ownerId: player.id,
            ownerColor: player.color,
            buildings: [
                { type: 'industry', status: 'active' },
                { type: 'recruitment_office', status: 'active' },
                { type: 'barracks', status: 'active' },
                { type: 'bunker', status: 'active' }
            ]
        })

        // Create starting army
        const armyId = `army_${player.id}_1`
        const army = {
            id: armyId,
            playerId: player.id,
            playerColor: player.color,
            name: `${nation} 1st Army`,
            currentProvinceId: startingProvinceId,
            isMoving: false,
            destinationId: null,
            units: [
                { type: 'infantry', quantity: 50, strength: 50 },
                { type: 'tank', quantity: 10, strength: 50 },
                { type: 'artillery', quantity: 5, strength: 15 }
            ]
        }
        room.armies.set(armyId, army)

        // Add player to room and tracking
        room.players.set(player.id, player)
        connectedPlayers.set(socket.id, { playerId: player.id, gameId, username })
        socket.join(gameId)

        // Send join confirmation
        socket.emit('game:joined', {
            gameId,
            gameName: room.name,
            playerId: player.id,
            nation: player.nation,
            color: player.color,
            resources: player.resources,
            mapSeed: room.mapSeed,
            provinces: Array.from(room.provinces.values()),
            armies: Array.from(room.armies.values()), // Send all armies
            currentPlayers: room.players.size,
            players: Array.from(room.players.values()).map(p => ({
                id: p.id,
                username: p.username,
                nation: p.nation,
                color: p.color,
                isOnline: p.isOnline
            }))
        })

        // Notify other players about new player and their army
        socket.to(gameId).emit('player:joined', {
            playerId: player.id,
            username: player.username,
            nation: player.nation,
            color: player.color
        })

        socket.to(gameId).emit('province:captured', {
            provinceId: startingProvinceId,
            newOwnerId: player.id,
            newOwnerColor: player.color
        })

        socket.to(gameId).emit('army:spawned', army)

        // Send chat history
        socket.emit('chat:history', chatHistory.slice(-50))

        console.log(`✅ ${username} joined (${room.players.size} players in room)`)
    })

    // Chat message
    socket.on('chat:send', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: playerInfo.playerId,
            playerName: playerInfo.username,
            message: data.message,
            type: data.type || 'global',
            timestamp: Date.now()
        }

        // Store in history
        chatHistory.push(message)
        if (chatHistory.length > 100) chatHistory.shift()

        // Broadcast to all in game
        if (data.type === 'global') {
            io.to(playerInfo.gameId).emit('chat:message', message)
        } else if (data.type === 'alliance') {
            // TODO: Send only to alliance members
            socket.to(playerInfo.gameId).emit('chat:message', message)
        }

        console.log(`💬 ${playerInfo.username}: ${data.message}`)
    })

    // Unit Recruitment
    socket.on('army:recruit', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const { provinceId, unitType, quantity } = data
        const cost = UNIT_COSTS[unitType]

        if (!cost || quantity < 1) return

        const player = room.players.get(playerInfo.playerId)
        if (!player) return

        // Check ownership
        const province = room.provinces.get(provinceId)
        if (!province || province.ownerId !== playerInfo.playerId) {
            console.log(`❌ Cannot recruit in province ${provinceId} (not owned)`)
            return
        }

        // Check resources
        const totalCost = {
            gold: cost.gold * quantity,
            iron: cost.iron * quantity,
            oil: cost.oil * quantity,
            food: cost.food * quantity
        }

        if (player.resources.gold < totalCost.gold ||
            player.resources.iron < totalCost.iron ||
            player.resources.oil < totalCost.oil ||
            player.resources.food < totalCost.food) {
            socket.emit('error', { message: 'Not enough resources' })
            return
        }

        // Deduct resources
        for (const [res, amount] of Object.entries(totalCost)) {
            if (res !== 'strength') { // Skip strength property
                player.resources[res] = (player.resources[res] || 0) - amount
            }
        }

        // Find existing army in province or create new
        let army = null
        room.armies.forEach(a => {
            if (a.playerId === playerInfo.playerId && a.currentProvinceId === provinceId) {
                army = a
            }
        })

        if (army) {
            // Add to existing army
            const unit = army.units.find(u => u.type === unitType)
            if (unit) {
                unit.quantity += quantity
            } else {
                army.units.push({ type: unitType, quantity, strength: cost.strength })
            }
            // Notify update (using same event as spawn/move to refresh)
            io.to(playerInfo.gameId).emit('army:moved', {
                armyId: army.id,
                destinationProvinceId: provinceId,
                units: army.units
            })
        } else {
            // Create new army
            army = {
                id: `army_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                playerId: playerInfo.playerId,
                playerColor: player.color, // Ensure color comes from player
                currentProvinceId: provinceId,
                units: [{ type: unitType, quantity, strength: cost.strength }],
                isMoving: false,
                name: `${playerInfo.username} ${unitType} Div`
            }
            room.armies.set(army.id, army)
            io.to(playerInfo.gameId).emit('army:spawned', army)
        }

        // Send updated resources
        socket.emit('player:resources', {
            resources: player.resources,
            income: { gold: 0, iron: 0, oil: 0, food: 0 } // Income logic handles the real rate
        })

        console.log(`🏭 ${playerInfo.username} recruited ${quantity} ${unitType} in ${provinceId}`)
    })

    // Army movement with conquest
    socket.on('army:move', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const army = room.armies.get(data.armyId)
        if (!army) {
            console.log(`❌ Army not found: ${data.armyId}`)
            return
        }

        // Verify ownership
        if (army.playerId !== playerInfo.playerId) {
            console.log(`❌ Not owner of army ${data.armyId}`)
            return
        }

        const startProvinceId = data.fromProvinceId
        const destProvinceId = data.destinationProvinceId

        // Validate Path
        const path = findPath(startProvinceId, destProvinceId, room.provinces)
        if (!path) {
            socket.emit('error', { message: 'Destino inalcanzable' })
            return
        }

        const distance = path.length - 1
        if (distance === 0) return

        console.log(`🚶 ${playerInfo.username} moving army to ${destProvinceId} (Distance: ${distance})`)

        // Calculate movement speed based on army composition (use slowest unit)
        // Note: Higher value = Slower speed (ms per province)
        let maxUnitDelay = 0
        army.units.forEach(unit => {
            const delay = MOVEMENT_SPEEDS[unit.type] || 5000 // Default to infantry speed
            if (delay > maxUnitDelay) maxUnitDelay = delay
        })

        const totalTravelTime = maxUnitDelay * distance

        // Mark as moving
        army.isMoving = true
        army.destinationId = destProvinceId

        // Broadcast movement started
        io.to(playerInfo.gameId).emit('army:moving', {
            armyId: data.armyId,
            fromProvinceId: startProvinceId,
            destinationProvinceId: destProvinceId,
            arrivalTime: Date.now() + totalTravelTime,
            path: path // Frontend can use this to draw lines
        })

        console.log(`⏱️ Army moving (${totalTravelTime}ms for ${distance} tiles)`)

        // Delay actual movement
        setTimeout(() => {
            // Update army position
            army.currentProvinceId = destProvinceId
            army.isMoving = false
            army.destinationId = null

            const destProvince = room.provinces.get(destProvinceId)

            // Check province ownership
            if (!destProvince || !destProvince.ownerId) {
                // Neutral province - SIEGE
                const armyStrength = army.units.reduce((s, u) => s + (u.strength * u.quantity), 0)
                const captureTime = calculateCaptureTime(armyStrength, 0, 'PLAINS', null)

                console.log(`🏴 Starting siege of ${destProvinceId} (Neutral) - Time: ${captureTime / 1000}s`)

                setTimeout(() => {
                    // Re-check army presence
                    const currentArmy = room.armies.get(army.id)
                    if (!currentArmy || currentArmy.currentProvinceId !== destProvinceId) return

                    const newProvince = {
                        id: destProvinceId,
                        ownerId: playerInfo.playerId,
                        ownerColor: playerInfo.color || '#ff0000',
                        ...destProvince,
                        ownerId: playerInfo.playerId,
                        ownerColor: playerInfo.color
                    }
                    room.provinces.set(destProvinceId, newProvince)

                    console.log(`🚩 Province ${destProvinceId} captured by ${playerInfo.username}`)

                    // Broadcast capture
                    io.to(playerInfo.gameId).emit('province:captured', {
                        provinceId: destProvinceId,
                        newOwnerId: playerInfo.playerId,
                        newOwnerColor: playerInfo.color
                    })

                    // Check victory condition
                    checkVictory(room, playerInfo, io)
                }, captureTime)
                // Enemy province - BATTLE or SIEGE
                console.log(`⚔️ Invasion of ${destProvinceId} owned by ${destProvince.ownerId}`)
                // Combat logic will be handled by the tick loop
            }

            // Legacy combat code removal part 1



            // Combat resolution
            const attackerWins = attackerEffectiveStrength > defenderEffectiveStrength

            if (attackerWins) {
                // Attacker captures province
                const newProvince = {
                    ...destProvince,
                    ownerId: playerInfo.playerId,
                    ownerColor: playerInfo.color
                }
                room.provinces.set(destProvinceId, newProvince)

                // Remove defender army if exists
                if (defenderArmy) {
                    room.armies.delete(defenderArmy.id)
                    io.to(playerInfo.gameId).emit('army:destroyed', { armyId: defenderArmy.id })
                }

                // Attacker loses some units (Base 20%, scales with resistance)
                const damageRatio = Math.min(0.8, defenderEffectiveStrength / Math.max(1, attackerEffectiveStrength)) * 0.5
                army.units.forEach(u => {
                    u.quantity = Math.max(1, Math.floor(u.quantity * (1 - damageRatio)))
                })

            }


            io.to(playerInfo.gameId).emit('army:moved', {
                armyId: data.armyId,
                playerId: playerInfo.playerId,
                fromProvinceId: startProvinceId,
                destinationProvinceId: destProvinceId
            })

        }, totalTravelTime)
    })

    // Capture province (Simple version for MVP)
    // Capture endpoint removed - Handled by army siege/invasion

    // Building construction
    socket.on('building:construct', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const province = room.provinces.get(data.provinceId)
        if (!province) return

        // Verify ownership
        if (province.ownerId !== playerInfo.playerId) {
            socket.emit('error', { message: 'No posees esta provincia' })
            return
        }

        const player = room.players.get(playerInfo.playerId)
        const buildingType = data.buildingType
        // Use BUILDING_TYPES to support any resource cost
        const buildingDef = BUILDING_TYPES[buildingType]

        if (!buildingDef) {
            socket.emit('error', { message: 'Tipo de edificio inválido' })
            return
        }

        const cost = buildingDef.cost
        const buildTime = buildingDef.buildTime

        // Check resources dynamically
        let canAfford = true
        let missingRes = ''

        for (const [res, amount] of Object.entries(cost)) {
            if ((player.resources[res] || 0) < amount) {
                canAfford = false
                missingRes = res
                break
            }
        }

        if (!canAfford) {
            socket.emit('error', { message: `Recursos insuficientes: falta ${missingRes}` })
            return
        }

        // Check availability
        if (!province.buildings) province.buildings = []

        // Deduct resources
        for (const [res, amount] of Object.entries(cost)) {
            player.resources[res] = (player.resources[res] || 0) - amount
        }

        socket.emit('player:resources', {
            resources: player.resources,
            income: {}
        })

        // Notify construction started
        io.to(playerInfo.gameId).emit('building:started', {
            provinceId: data.provinceId,
            buildingType,
            completionTime: Date.now() + buildTime
        })

        console.log(`🏗️ ${playerInfo.username} started building ${buildingType} in ${data.provinceId} (${buildTime}ms)`)

        // Delay building completion
        setTimeout(() => {
            // Add building after delay
            const building = {
                id: `building_${Date.now()}`,
                type: buildingType,
                provinceId: data.provinceId,
                builtAt: Date.now()
            }
            province.buildings.push(building)

            // Broadcast building constructed
            io.to(playerInfo.gameId).emit('building:constructed', {
                provinceId: data.provinceId,
                building
            })

            console.log(`✅ ${buildingType} completed in ${data.provinceId}`)
        }, buildTime)
    })

    // Diplomacy: Declare War
    socket.on('diplomacy:war', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const targetPlayer = data.targetPlayerId
        const relationKey = [playerInfo.playerId, targetPlayer].sort().join('_')

        room.diplomacy.set(relationKey, 'war')

        io.to(playerInfo.gameId).emit('diplomacy:updated', {
            player1: playerInfo.playerId,
            player2: targetPlayer,
            status: 'war'
        })

        console.log(`⚔️ ${playerInfo.username} declared war on ${targetPlayer}`)
    })

    // Diplomacy: Propose Alliance
    socket.on('diplomacy:ally', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const targetPlayer = data.targetPlayerId
        const relationKey = [playerInfo.playerId, targetPlayer].sort().join('_')

        room.diplomacy.set(relationKey, 'ally')

        io.to(playerInfo.gameId).emit('diplomacy:updated', {
            player1: playerInfo.playerId,
            player2: targetPlayer,
            status: 'ally'
        })

        console.log(`🤝 ${playerInfo.username} allied with ${targetPlayer}`)
    })

    // Diplomacy: Neutral/Peace
    socket.on('diplomacy:peace', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const targetPlayer = data.targetPlayerId
        const relationKey = [playerInfo.playerId, targetPlayer].sort().join('_')

        room.diplomacy.set(relationKey, 'neutral')

        io.to(playerInfo.gameId).emit('diplomacy:updated', {
            player1: playerInfo.playerId,
            player2: targetPlayer,
            status: 'neutral'
        })

        console.log(`🕊️ ${playerInfo.username} made peace with ${targetPlayer}`)
    })

    // Trade: Propose Offer
    socket.on('trade:offer', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const player = room.players.get(playerInfo.playerId)
        if (!player) return

        // Validate player has the resources
        const { give, receive, targetPlayerId } = data
        if (player.resources.gold < (give.gold || 0) ||
            player.resources.iron < (give.iron || 0) ||
            player.resources.oil < (give.oil || 0) ||
            player.resources.food < (give.food || 0)) {
            socket.emit('error', { message: 'No tienes suficientes recursos para esta oferta' })
            return
        }

        const tradeOffer = {
            id: `trade_${Date.now()}`,
            fromPlayer: playerInfo.playerId,
            fromPlayerName: playerInfo.username,
            toPlayer: targetPlayerId,
            give: give,
            receive: receive,
            timestamp: Date.now()
        }

        room.tradeOffers.push(tradeOffer)

        // Notify target player
        io.to(playerInfo.gameId).emit('trade:offered', tradeOffer)

        console.log(`💱 ${playerInfo.username} offered trade to ${targetPlayerId}`)
    })

    // Trade: Accept
    socket.on('trade:accept', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const tradeIndex = room.tradeOffers.findIndex(t => t.id === data.tradeId)
        if (tradeIndex === -1) {
            socket.emit('error', { message: 'Oferta no encontrada' })
            return
        }

        const trade = room.tradeOffers[tradeIndex]

        // Verify this player is the recipient
        if (trade.toPlayer !== playerInfo.playerId) {
            socket.emit('error', { message: 'Esta oferta no es para ti' })
            return
        }

        const fromPlayer = room.players.get(trade.fromPlayer)
        const toPlayer = room.players.get(playerInfo.playerId)

        if (!fromPlayer || !toPlayer) return

        // Validate both still have resources
        if (fromPlayer.resources.gold < (trade.give.gold || 0) ||
            toPlayer.resources.gold < (trade.receive.gold || 0)) {
            socket.emit('error', { message: 'Recursos insuficientes para completar el comercio' })
            return
        }

        // Execute trade
        fromPlayer.resources.gold -= (trade.give.gold || 0)
        fromPlayer.resources.iron -= (trade.give.iron || 0)
        fromPlayer.resources.oil -= (trade.give.oil || 0)
        fromPlayer.resources.food -= (trade.give.food || 0)

        toPlayer.resources.gold -= (trade.receive.gold || 0)
        toPlayer.resources.iron -= (trade.receive.iron || 0)
        toPlayer.resources.oil -= (trade.receive.oil || 0)
        toPlayer.resources.food -= (trade.receive.food || 0)

        toPlayer.resources.gold += (trade.give.gold || 0)
        toPlayer.resources.iron += (trade.give.iron || 0)
        toPlayer.resources.oil += (trade.give.oil || 0)
        toPlayer.resources.food += (trade.give.food || 0)

        fromPlayer.resources.gold += (trade.receive.gold || 0)
        fromPlayer.resources.iron += (trade.receive.iron || 0)
        fromPlayer.resources.oil += (trade.receive.oil || 0)
        fromPlayer.resources.food += (trade.receive.food || 0)

        // Remove trade from queue
        room.tradeOffers.splice(tradeIndex, 1)

        // Broadcast completion
        io.to(playerInfo.gameId).emit('trade:completed', {
            fromPlayer: trade.fromPlayer,
            toPlayer: trade.toPlayer,
            give: trade.give,
            receive: trade.receive
        })

        console.log(`✅ Trade completed between ${trade.fromPlayerName} and ${playerInfo.username}`)
    })

    // Trade: Reject
    socket.on('trade:reject', (data) => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        const tradeIndex = room.tradeOffers.findIndex(t => t.id === data.tradeId)
        if (tradeIndex !== -1) {
            const trade = room.tradeOffers[tradeIndex]
            room.tradeOffers.splice(tradeIndex, 1)

            io.to(playerInfo.gameId).emit('trade:rejected', { tradeId: data.tradeId })
            console.log(`❌ ${playerInfo.username} rejected trade from ${trade.fromPlayerName}`)
        }
    })

    // Leave game
    socket.on('game:leave', () => {
        handlePlayerLeave(socket)
    })

    // Restart Game
    socket.on('game:restart', () => {
        const playerInfo = connectedPlayers.get(socket.id)
        if (!playerInfo) return

        const room = gameRooms.get(playerInfo.gameId)
        if (!room) return

        console.log(`🔄 Restarting game ${playerInfo.gameId}...`)

        // Reset Room State
        room.status = 'PLAYING'
        room.tick = 0
        room.winner = null
        room.provinces.clear() // Resets all to neutral
        room.armies.clear()
        room.players.clear() // Force re-join logic
        room.mapSeed = Date.now() // New map

        // Broadcast reset to trigger reload
        io.to(playerInfo.gameId).emit('game:restarted')
    })

    // Disconnect
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Player disconnected: ${socket.id} (${reason})`)
        handlePlayerLeave(socket)
    })
})

// Handle player leaving
function handlePlayerLeave(socket) {
    const playerInfo = connectedPlayers.get(socket.id)
    if (!playerInfo) return

    const room = gameRooms.get(playerInfo.gameId)
    if (room) {
        const player = room.players.get(playerInfo.playerId)
        if (player) {
            player.isOnline = false

            // Notify others
            socket.to(playerInfo.gameId).emit('player:left', {
                playerId: playerInfo.playerId,
                username: playerInfo.username
            })
        }
    }

    connectedPlayers.delete(socket.id)
    console.log(`👋 ${playerInfo.username} left the game`)
}

// Game tick loop - update resources for all players based on owned provinces
setInterval(() => {
    gameRooms.forEach((room) => {
        if (room.status !== 'PLAYING') return

        room.tick++

        room.players.forEach((player) => {
            if (!player.isOnline) return

            // Calculate income from owned provinces
            let goldIncome = RESOURCE_RATE.gold // Base income
            let ironIncome = RESOURCE_RATE.iron
            let oilIncome = RESOURCE_RATE.oil
            let foodIncome = RESOURCE_RATE.food

            // Add bonuses from each owned province
            room.provinces.forEach((province) => {
                if (province.ownerId === player.id) {
                    // Each province adds its bonus (Increased for realistic scale)
                    goldIncome += 1000 // 1k extra revenue
                    ironIncome += 500  // 500 tons
                    oilIncome += 100   // 100 barrels
                    foodIncome += 800  // 800 tons
                }
            })

            // Apply income
            player.resources.gold += goldIncome
            player.resources.iron += ironIncome
            player.resources.oil += oilIncome
            player.resources.food += foodIncome

            // UPKEEP: Army consumption
            let oilConsumption = 0
            let foodConsumption = 0
            let armiesWithoutResources = []

            room.armies.forEach((army) => {
                if (army.playerId !== player.id) return

                // Calculate consumption per army
                army.units.forEach(unit => {
                    if (unit.type === 'tank') {
                        oilConsumption += unit.quantity * 2 // 2 oil per tank per tick
                    }
                    foodConsumption += unit.quantity * 1 // 1 food per unit per tick
                })
            })

            // Deduct consumption
            player.resources.oil -= oilConsumption
            player.resources.food -= foodConsumption

            // Penalize if resources go negative
            if (player.resources.oil < 0) {
                player.resources.oil = 0
                // Tanks lose efficiency
                room.armies.forEach(army => {
                    if (army.playerId !== player.id) return
                    army.units.forEach(unit => {
                        if (unit.type === 'tank') {
                            unit.strength = Math.max(1, unit.strength * 0.9) // -10% strength
                        }
                    })
                })
            }

            if (player.resources.food < 0) {
                player.resources.food = 0
                // All units lose morale
                room.armies.forEach(army => {
                    if (army.playerId !== player.id) return
                    army.units.forEach(unit => {
                        unit.quantity = Math.max(1, Math.floor(unit.quantity * 0.95)) // -5% units (desertion)
                    })
                })
            }
        })

        // Random Events (5% chance per tick)
        if (Math.random() < 0.05) {
            const events = [
                { type: 'discovery', name: '💎 Descubrimiento de Recursos', effect: 'production', value: 1.2, duration: 5 },
                { type: 'crisis', name: '📉 Crisis Económica', effect: 'gold', value: 0.7, duration: 3 },
                { type: 'harvest', name: '🌾 Cosecha Abundante', effect: 'food', value: 1.5, duration: 4 },
                { type: 'winter', name: '❄️ Invierno Severo', effect: 'movement', value: 0.5, duration: 5 },
            ]
            const randomEvent = events[Math.floor(Math.random() * events.length)]

            io.to(room.id).emit('game:event', randomEvent)
            console.log(`🎲 Event triggered: ${randomEvent.name}`)
        }

        // Broadcast tick to room
        io.to(room.id).emit('game:tick', {
            tick: room.tick,
            playersOnline: Array.from(room.players.values()).filter(p => p.isOnline).length
        })

        // Send resource updates every 5 ticks
        if (room.tick % 5 === 0) {
            room.players.forEach((player) => {
                if (!player.isOnline) return
                const playerSocket = io.sockets.sockets.get(player.socketId)
                if (playerSocket) {
                    // Calculate income for display (2026 Resources)
                    let income = { ...RESOURCE_RATE }
                    room.provinces.forEach((prov) => {
                        if (prov.ownerId === player.id) {
                            // Each province adds to income
                            income.money += 25
                            income.oil += 3
                            income.gas += 2
                            income.uranium += 0.3
                            income.lithium += 0.5
                            income.rareEarth += 0.2
                            income.copper += 5
                            income.gold += 0.1
                            income.steel += 8
                            income.silicon += 1
                            income.food += 10
                            income.manpower += 2
                        }
                    })
                    playerSocket.emit('player:resources', {
                        ...player.resources,
                        income // Send income rate too
                    })
                }
            })
        }

        // ========================================
        // BUILDING PRODUCTION TICK - Every 60 ticks (1 min)
        // Buildings generate units automatically!
        // ========================================
        if (room.tick % 60 === 0) {
            const now = Date.now()

            room.provinces.forEach((prov, provId) => {
                if (!prov.ownerId || !prov.buildings) return

                const player = room.players.get(prov.ownerId)
                if (!player) return

                prov.buildings.forEach(building => {
                    const buildingType = BUILDING_TYPES[building.type]
                    if (!buildingType || !buildingType.generates) return

                    // Check if enough time passed since last production
                    const lastProd = building.lastProduction || 0
                    if (now - lastProd < buildingType.generates.interval) return

                    // Check if player has required resources
                    const requires = buildingType.generates.requires || {}
                    let canProduce = true
                    for (const [res, amount] of Object.entries(requires)) {
                        if ((player.resources[res] || 0) < amount) {
                            canProduce = false
                            break
                        }
                    }

                    if (canProduce) {
                        // Deduct resources
                        for (const [res, amount] of Object.entries(requires)) {
                            player.resources[res] = (player.resources[res] || 0) - amount
                        }

                        // Create units in province
                        const unitType = buildingType.generates.unitType
                        const quantity = buildingType.generates.quantity

                        // Find or create army in this province
                        let existingArmy = null
                        room.armies.forEach(army => {
                            if (army.playerId === player.id && army.currentProvinceId === provId) {
                                existingArmy = army
                            }
                        })

                        if (existingArmy) {
                            // Add to existing army
                            const existingUnit = existingArmy.units.find(u => u.type === unitType)
                            if (existingUnit) {
                                existingUnit.quantity += quantity
                            } else {
                                existingArmy.units.push({
                                    type: unitType,
                                    quantity: quantity,
                                    strength: UNIT_SPRITES[unitType]?.attack || 10
                                })
                            }
                        } else {
                            // Create new army
                            const armyId = `army_${player.id}_${Date.now()}`
                            const newArmy = {
                                id: armyId,
                                playerId: player.id,
                                playerColor: player.color,
                                name: `${UNIT_SPRITES[unitType]?.name || unitType} Squad`,
                                currentProvinceId: provId,
                                isMoving: false,
                                destinationId: null,
                                units: [{
                                    type: unitType,
                                    quantity: quantity,
                                    strength: UNIT_SPRITES[unitType]?.attack || 10
                                }]
                            }
                            room.armies.set(armyId, newArmy)
                        }

                        // Mark production time
                        building.lastProduction = now

                        // Notify player
                        const playerSocket = io.sockets.sockets.get(player.socketId)
                        if (playerSocket) {
                            playerSocket.emit('unit:spawned', {
                                provinceId: provId,
                                provinceName: prov.name || provId,
                                buildingType: building.type,
                                buildingName: buildingType.name,
                                unitType: unitType,
                                unitIcon: UNIT_SPRITES[unitType]?.icon || '🚶',
                                quantity: quantity,
                                message: `${buildingType.icon} ${buildingType.name} produjo ${quantity}x ${UNIT_SPRITES[unitType]?.icon || ''} ${UNIT_SPRITES[unitType]?.name || unitType}`
                            })
                        }

                        console.log(`🏭 ${buildingType.name} in ${provId} produced ${quantity}x ${unitType} for ${player.username}`)
                    }
                })
            })

            // Broadcast army updates
            io.to(room.id).emit('armies:update', Array.from(room.armies.values()))
        }
    })
}, TICK_RATE)

// Start server
const HOST = '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
    console.log('')
    console.log('🎖️  WORLD CONFLICT 1945 - Game Server')
    console.log('=====================================')
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 Bound to ${HOST}`)
    console.log(`📡 Ready for connections`)
    console.log('')
})
