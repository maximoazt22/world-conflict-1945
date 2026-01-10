// Game Types - Shared between client and server

// ============================================
// RESOURCES
// ============================================

// ============================================
// RESOURCES
// ============================================

export interface Resources {
    money: number
    food: number
    materials: number
    energy: number
    manpower: number
}

export const RESOURCE_NAMES: Record<keyof Resources, string> = {
    money: 'Dinero',
    food: 'Alimentos',
    materials: 'Materiales',
    energy: 'Energía',
    manpower: 'Mano de Obra',
}

export const RESOURCE_ICONS: Record<keyof Resources, string> = {
    money: '💵',
    food: '🌾',
    materials: '🧱',
    energy: '⚡',
    manpower: '👷',
}

// ============================================
// UNITS
// ============================================

export enum UnitType {
    // Infantry
    INFANTRY_SOLDADO = 'INFANTRY_SOLDADO',
    INFANTRY_SUBOFICIAL = 'INFANTRY_SUBOFICIAL',
    INFANTRY_COMANDANTE = 'INFANTRY_COMANDANTE',
    // Vehicles
    TANK_LIGHT = 'TANK_LIGHT',
    TANK_MEDIUM = 'TANK_MEDIUM',
    TANK_HEAVY = 'TANK_HEAVY',
    ARTILLERY = 'ARTILLERY',
    // Aircraft
    AIRCRAFT_FIGHTER = 'AIRCRAFT_FIGHTER',
    AIRCRAFT_BOMBER = 'AIRCRAFT_BOMBER',
    AIRCRAFT_TRANSPORT = 'AIRCRAFT_TRANSPORT',
    // Naval
    NAVAL_DESTROYER = 'NAVAL_DESTROYER',
    NAVAL_CRUISER = 'NAVAL_CRUISER',
    NAVAL_BATTLESHIP = 'NAVAL_BATTLESHIP',
    NAVAL_CARRIER = 'NAVAL_CARRIER',
}

export interface UnitStats {
    name: string
    nameEs: string
    icon: string
    attack: number
    defense: number
    health: number
    speed: number
    cost: Partial<Resources>
    trainTime: number // seconds
    foodConsumption: number // per hour
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
    [UnitType.INFANTRY_SOLDADO]: {
        name: 'Soldier',
        nameEs: 'Soldado Raso',
        icon: '🪖',
        attack: 5,
        defense: 3,
        health: 100,
        speed: 10,
        cost: { money: 50, materials: 10, energy: 0, food: 20 },
        trainTime: 60,
        foodConsumption: 1,
    },
    [UnitType.INFANTRY_SUBOFICIAL]: {
        name: 'NCO',
        nameEs: 'Suboficial',
        icon: '🎖️',
        attack: 8,
        defense: 5,
        health: 120,
        speed: 10,
        cost: { money: 100, materials: 20, energy: 0, food: 30 },
        trainTime: 120,
        foodConsumption: 1.5,
    },
    [UnitType.INFANTRY_COMANDANTE]: {
        name: 'Commander',
        nameEs: 'Comandante',
        icon: '⭐',
        attack: 12,
        defense: 8,
        health: 150,
        speed: 10,
        cost: { money: 200, materials: 40, energy: 0, food: 50 },
        trainTime: 300,
        foodConsumption: 2,
    },
    [UnitType.TANK_LIGHT]: {
        name: 'Light Tank',
        nameEs: 'Tanque Ligero',
        icon: '🚙',
        attack: 15,
        defense: 10,
        health: 200,
        speed: 15,
        cost: { money: 300, materials: 100, energy: 30, food: 0 },
        trainTime: 600,
        foodConsumption: 0,
    },
    [UnitType.TANK_MEDIUM]: {
        name: 'Medium Tank',
        nameEs: 'Tanque Medio',
        icon: '🛡️',
        attack: 25,
        defense: 20,
        health: 350,
        speed: 12,
        cost: { money: 500, materials: 200, energy: 60, food: 0 },
        trainTime: 900,
        foodConsumption: 0,
    },
    [UnitType.TANK_HEAVY]: {
        name: 'Heavy Tank',
        nameEs: 'Tanque Pesado',
        icon: '🦾',
        attack: 40,
        defense: 35,
        health: 500,
        speed: 8,
        cost: { money: 800, materials: 350, energy: 100, food: 0 },
        trainTime: 1500,
        foodConsumption: 0,
    },
    [UnitType.ARTILLERY]: {
        name: 'Artillery',
        nameEs: 'Artillería',
        icon: '💣',
        attack: 50,
        defense: 5,
        health: 150,
        speed: 5,
        cost: { money: 400, materials: 150, energy: 40, food: 0 },
        trainTime: 720,
        foodConsumption: 0,
    },
    [UnitType.AIRCRAFT_FIGHTER]: {
        name: 'Fighter',
        nameEs: 'Caza',
        icon: '✈️',
        attack: 30,
        defense: 15,
        health: 100,
        speed: 50,
        cost: { money: 600, materials: 100, energy: 80, food: 0 },
        trainTime: 1200,
        foodConsumption: 0,
    },
    [UnitType.AIRCRAFT_BOMBER]: {
        name: 'Bomber',
        nameEs: 'Bombardero',
        icon: '🛩️',
        attack: 60,
        defense: 10,
        health: 150,
        speed: 30,
        cost: { money: 1000, materials: 150, energy: 120, food: 0 },
        trainTime: 1800,
        foodConsumption: 0,
    },
    [UnitType.AIRCRAFT_TRANSPORT]: {
        name: 'Transport',
        nameEs: 'Transporte',
        icon: '🚁',
        attack: 5,
        defense: 20,
        health: 200,
        speed: 40,
        cost: { money: 500, materials: 80, energy: 60, food: 0 },
        trainTime: 900,
        foodConsumption: 0,
    },
    [UnitType.NAVAL_DESTROYER]: {
        name: 'Destroyer',
        nameEs: 'Destructor',
        icon: '🚢',
        attack: 35,
        defense: 25,
        health: 300,
        speed: 20,
        cost: { money: 700, materials: 200, energy: 100, food: 0 },
        trainTime: 2400,
        foodConsumption: 0,
    },
    [UnitType.NAVAL_CRUISER]: {
        name: 'Cruiser',
        nameEs: 'Crucero',
        icon: '⛵',
        attack: 50,
        defense: 40,
        health: 500,
        speed: 15,
        cost: { money: 1200, materials: 400, energy: 200, food: 0 },
        trainTime: 3600,
        foodConsumption: 0,
    },
    [UnitType.NAVAL_BATTLESHIP]: {
        name: 'Battleship',
        nameEs: 'Acorazado',
        icon: '🛳️',
        attack: 80,
        defense: 60,
        health: 800,
        speed: 10,
        cost: { money: 2000, materials: 700, energy: 350, food: 0 },
        trainTime: 7200,
        foodConsumption: 0,
    },
    [UnitType.NAVAL_CARRIER]: {
        name: 'Carrier',
        nameEs: 'Portaaviones',
        icon: '🚀',
        attack: 30,
        defense: 50,
        health: 1000,
        speed: 8,
        cost: { money: 3000, materials: 1000, energy: 500, food: 0 },
        trainTime: 10800,
        foodConsumption: 0,
    },
}

// ============================================
// BUILDINGS
// ============================================

export enum BuildingType {
    MINE_GOLD = 'MINE_GOLD',
    MINE_IRON = 'MINE_IRON',
    REFINERY_OIL = 'REFINERY_OIL',
    FARM = 'FARM',
    BARRACKS = 'BARRACKS',
    FACTORY = 'FACTORY',
    AIRBASE = 'AIRBASE',
    PORT = 'PORT',
    LABORATORY = 'LABORATORY',
    FORTRESS = 'FORTRESS',
}

export interface BuildingStats {
    name: string
    nameEs: string
    icon: string
    description: string
    maxLevel: number
    baseCost: Partial<Resources>
    costMultiplier: number
    baseTime: number // seconds
    effect: {
        resourceGeneration?: Partial<Resources>
        defenseBonus?: number
        unitCapacity?: number
        researchSpeed?: number
    }
}

export const BUILDING_STATS: Record<BuildingType, BuildingStats> = {
    [BuildingType.MINE_GOLD]: {
        name: 'Gold Mine',
        nameEs: 'Mina de Oro',
        icon: '💰',
        description: 'Produces gold over time',
        maxLevel: 5,
        baseCost: { money: 100, materials: 50, energy: 0, food: 0 },
        costMultiplier: 1.5,
        baseTime: 600,
        effect: { resourceGeneration: { money: 10 } },
    },
    [BuildingType.MINE_IRON]: {
        name: 'Iron Mine',
        nameEs: 'Mina de Hierro',
        icon: '⚙️',
        description: 'Produces iron over time',
        maxLevel: 5,
        baseCost: { money: 80, materials: 30, energy: 0, food: 0 },
        costMultiplier: 1.5,
        baseTime: 600,
        effect: { resourceGeneration: { materials: 5 } },
    },
    [BuildingType.REFINERY_OIL]: {
        name: 'Oil Refinery',
        nameEs: 'Refinería de Petróleo',
        icon: '🛢️',
        description: 'Produces oil over time',
        maxLevel: 5,
        baseCost: { money: 150, materials: 80, energy: 20, food: 0 },
        costMultiplier: 1.6,
        baseTime: 900,
        effect: { resourceGeneration: { energy: 3 } },
    },
    [BuildingType.FARM]: {
        name: 'Farm',
        nameEs: 'Granja',
        icon: '🌾',
        description: 'Produces food over time',
        maxLevel: 5,
        baseCost: { money: 70, materials: 20, energy: 0, food: 10 },
        costMultiplier: 1.4,
        baseTime: 300,
        effect: { resourceGeneration: { food: 8 } },
    },
    [BuildingType.BARRACKS]: {
        name: 'Barracks',
        nameEs: 'Cuarteles',
        icon: '🏛️',
        description: 'Trains infantry units',
        maxLevel: 5,
        baseCost: { money: 200, materials: 100, energy: 0, food: 50 },
        costMultiplier: 1.6,
        baseTime: 1200,
        effect: { unitCapacity: 20 },
    },
    [BuildingType.FACTORY]: {
        name: 'Factory',
        nameEs: 'Fábrica',
        icon: '🏭',
        description: 'Produces vehicles and artillery',
        maxLevel: 5,
        baseCost: { money: 400, materials: 250, energy: 50, food: 0 },
        costMultiplier: 1.7,
        baseTime: 2400,
        effect: { unitCapacity: 10 },
    },
    [BuildingType.AIRBASE]: {
        name: 'Airbase',
        nameEs: 'Base Aérea',
        icon: '✈️',
        description: 'Produces aircraft',
        maxLevel: 5,
        baseCost: { money: 600, materials: 200, energy: 100, food: 0 },
        costMultiplier: 1.8,
        baseTime: 3600,
        effect: { unitCapacity: 8 },
    },
    [BuildingType.PORT]: {
        name: 'Port',
        nameEs: 'Puerto',
        icon: '⚓',
        description: 'Produces naval units',
        maxLevel: 5,
        baseCost: { money: 800, materials: 300, energy: 150, food: 0 },
        costMultiplier: 1.8,
        baseTime: 4800,
        effect: { unitCapacity: 5 },
    },
    [BuildingType.LABORATORY]: {
        name: 'Laboratory',
        nameEs: 'Laboratorio',
        icon: '🔬',
        description: 'Researches new technologies',
        maxLevel: 3,
        baseCost: { money: 500, materials: 150, energy: 50, food: 0 },
        costMultiplier: 2.0,
        baseTime: 3600,
        effect: { researchSpeed: 10 },
    },
    [BuildingType.FORTRESS]: {
        name: 'Fortress',
        nameEs: 'Fortaleza',
        icon: '🏰',
        description: 'Increases province defense',
        maxLevel: 5,
        baseCost: { money: 300, materials: 200, energy: 0, food: 100 },
        costMultiplier: 1.6,
        baseTime: 1800,
        effect: { defenseBonus: 10 },
    },
}

// ============================================
// NATIONS
// ============================================

export interface Nation {
    id: string
    name: string
    nameEs: string
    flag: string
    color: string
    bonus: {
        type: 'attack' | 'defense' | 'economy' | 'production'
        value: number
        description: string
    }
}

export const NATIONS: Nation[] = [
    {
        id: 'usa',
        name: 'United States',
        nameEs: 'Estados Unidos',
        flag: '🇺🇸',
        color: '#0A3161',
        bonus: { type: 'economy', value: 15, description: '+15% gold generation' },
    },
    {
        id: 'germany',
        name: 'Germany',
        nameEs: 'Alemania',
        flag: '🇩🇪',
        color: '#DD0000',
        bonus: { type: 'production', value: 20, description: '+20% tank production speed' },
    },
    {
        id: 'ussr',
        name: 'Soviet Union',
        nameEs: 'Unión Soviética',
        flag: '🇷🇺',
        color: '#CC0000',
        bonus: { type: 'defense', value: 15, description: '+15% infantry defense' },
    },
    {
        id: 'uk',
        name: 'United Kingdom',
        nameEs: 'Reino Unido',
        flag: '🇬🇧',
        color: '#012169',
        bonus: { type: 'attack', value: 10, description: '+10% naval attack' },
    },
    {
        id: 'japan',
        name: 'Japan',
        nameEs: 'Japón',
        flag: '🇯🇵',
        color: '#BC002D',
        bonus: { type: 'attack', value: 15, description: '+15% aircraft attack' },
    },
    {
        id: 'italy',
        name: 'Italy',
        nameEs: 'Italia',
        flag: '🇮🇹',
        color: '#008C45',
        bonus: { type: 'economy', value: 10, description: '+10% resource generation' },
    },
    {
        id: 'france',
        name: 'France',
        nameEs: 'Francia',
        flag: '🇫🇷',
        color: '#0055A4',
        bonus: { type: 'defense', value: 20, description: '+20% fortress defense' },
    },
    {
        id: 'china',
        name: 'China',
        nameEs: 'China',
        flag: '🇨🇳',
        color: '#DE2910',
        bonus: { type: 'production', value: 15, description: '+15% infantry training speed' },
    },
]

// ============================================
// GAME CONSTANTS
// ============================================

export const GAME_CONSTANTS = {
    // Time
    TICK_RATE: 60, // ticks per second
    MVP_CAMPAIGN_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
    FULL_CAMPAIGN_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds

    // Victory
    TERRITORIAL_VICTORY_PERCENTAGE: 60,

    // Sleep Mode
    MAX_SLEEP_MODE_HOURS: 8,
    SLEEP_MODE_DEFENSE_BONUS: 50, // 50% extra defense

    // Alliance
    MAX_ALLIANCE_MEMBERS: 4,

    // Resources
    STARTING_RESOURCES: {
        money: 20000,
        food: 20000,
        materials: 20000,
        energy: 20000,
        manpower: 1000,
    },

    // Map
    MIN_PROVINCES: 100,
    MAX_PROVINCES: 200,

    // Players
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 50,

    // Battle
    MIN_BATTLE_DURATION: 60, // 1 minute
    MAX_BATTLE_DURATION: 600, // 10 minutes
    RETREAT_CASUALTY_PERCENTAGE: 50,
}

// ============================================
// MAP & PROVINCES
// ============================================

export interface Province {
    id: string
    name: string
    coordX: number
    coordY: number
    coordZ: number
    ownerId: string | null
    ownerName?: string
    ownerColor?: string
    // Modern Resource Bonuses
    oilBonus: number
    gasBonus: number
    uraniumBonus: number
    lithiumBonus: number
    rareEarthBonus: number
    copperBonus: number
    goldBonus: number
    steelBonus: number
    siliconBonus: number
    foodBonus: number
    defenseBonus: number
    terrain: string
    buildings: Partial<Record<string, number | boolean>>
    units: any[] // TODO: Define Unit type properly

    // Real-time Status
    construction: {
        building: string | null
        timeLeft: number
    }
}

export interface Unit {
    id: string
    type: string
    quantity: number
    strength: number
    morale: number
}

export interface Army {
    id: string
    playerId: string
    playerColor: string
    currentProvinceId: string
    units: Unit[]
    isMoving: boolean
    destinationId?: string | null
    fromProvinceId?: string
    arrivalTime?: number
    name?: string
}

export interface Battle {
    id: string
    provinceId: string
    provinceName?: string
    attackerArmyId: string
    attackerName?: string
    defenderArmyId: string | null
    defenderName?: string
    startTime: Date
    duration: number
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    attackerCasualties: number
    defenderCasualties: number
    winner: string | null
}

export interface Player {
    id: string
    username: string
    nation: string
    color: string
    isOnline: boolean
}
