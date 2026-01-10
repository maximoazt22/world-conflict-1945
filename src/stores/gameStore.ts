import { create } from 'zustand'

// ============================================
// TYPES
// ============================================

export interface Resources {
  // Currency
  money: number           // Dinero (billones USD)
  // Energy
  oil: number             // Petróleo
  gas: number             // Gas Natural
  uranium: number         // Uranio (energía nuclear)
  // Strategic Minerals
  lithium: number         // Litio (baterías)
  rareEarth: number       // Tierras Raras (tech)
  copper: number          // Cobre (electrónica)
  gold: number            // Oro (reservas)
  // Industrial
  steel: number           // Acero
  silicon: number         // Silicio (chips)
  // Basic
  food: number            // Comida
  manpower: number        // Mano de obra (millones)
}

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
  buildings: Building[]
  units: Unit[]
}

export interface Building {
  id: string
  type: string
  level: number
  isComplete: boolean
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
  fromProvinceId?: string // For interpolation
  arrivalTime?: number    // For interpolation
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

// ============================================
// GAME STORE
// ============================================

interface GameState {
  // Game Info
  gameId: string | null
  gameName: string | null
  gameStatus: 'WAITING' | 'STARTING' | 'PLAYING' | 'PAUSED' | 'ENDED' | null
  currentTick: number

  // Real-time Players
  players: Player[]

  // Map Data
  provinces: Province[]
  mapSeed: number | null
  pendingMapUpdates: Partial<Province>[]

  // Player Data
  playerId: string | null
  playerNation: string | null
  playerColor: string | null
  resources: Resources
  armies: Army[]

  // Combat
  battles: Battle[]
  activeBattleId: string | null

  // Current Phase
  currentPhase: 'planning' | 'battle'

  // Winner State
  winner: { id: string; name: string } | null
  setWinner: (winner: { id: string; name: string } | null) => void

  // Actions
  setGameId: (gameId: string) => void
  setGameInfo: (info: { id?: string; name?: string; status?: GameState['gameStatus']; maxPlayers?: number; currentPlayers?: number }) => void
  setPlayerInfo: (id: string, nation: string, color: string) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayerStatus: (playerId: string, isOnline: boolean) => void
  setResources: (resources: Resources) => void
  updateResources: (resources: Partial<Resources>) => void
  updateResource: (type: keyof Resources, amount: number) => void
  setCurrentTick: (tick: number) => void
  setProvinces: (provinces: Province[]) => void
  syncServerProvinces: (provinces: Province[]) => void
  updateProvince: (provinceId: string, data: Partial<Province>) => void
  setMapSeed: (seed: number) => void
  setPendingMapUpdates: (updates: Partial<Province>[]) => void
  setArmies: (armies: Army[]) => void
  addArmy: (army: Army) => void
  updateArmy: (armyId: string, data: Partial<Army>) => void
  removeArmy: (armyId: string) => void
  setBattles: (battles: Battle[]) => void
  addBattle: (battle: Battle | Partial<Battle>) => void
  updateBattle: (battleId: string, data: Partial<Battle>) => void
  removeBattle: (battleId: string) => void
  setActiveBattle: (battleId: string | null) => void
  setCurrentPhase: (phase: 'planning' | 'battle') => void
  incrementTick: () => void
  reset: () => void
}

// 2026 Starting Resources - Representa reservas iniciales de una nación mediana
// money: Billones USD, oil: Millones barriles, gas: Bcf, uranium: miles de libras
// lithium: kt, rareEarth: kt, copper: kt, gold: toneladas, steel: Mt, silicon: kt
// food: Mt de productos agrícolas, manpower: Millones de trabajadores
const initialResources: Resources = {
  money: 500,        // $500B reservas
  oil: 50,           // 50M barriles (~2 meses de producción de Argentina)
  gas: 30,           // 30 Bcf de reservas
  uranium: 5,        // 5 mil libras 
  lithium: 10,       // 10kt (Chile es líder mundial ~200kt/año)
  rareEarth: 3,      // 3kt (China produce ~60% mundial)
  copper: 200,       // 200kt de reservas
  gold: 2,           // 2 toneladas reservas (~$300M)
  steel: 100,        // 100 Mt capacidad
  silicon: 15,       // 15kt 
  food: 500,         // 500 Mt producción anual
  manpower: 50,      // 50 Millones de trabajadores
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  gameId: null,
  gameName: null,
  gameStatus: null,
  currentTick: 0,
  players: [], // Initial empty players
  provinces: [],
  mapSeed: null,
  pendingMapUpdates: [],
  playerId: null,
  playerNation: null,
  playerColor: null,
  resources: { money: 0, oil: 0, gas: 0, uranium: 0, lithium: 0, rareEarth: 0, copper: 0, gold: 0, steel: 0, silicon: 0, food: 0, manpower: 0 },
  armies: [],
  battles: [],
  activeBattleId: null,
  currentPhase: 'planning',
  winner: null,

  // Actions
  setWinner: (winner) => set({ winner }),
  setGameId: (gameId) => set({ gameId }),

  setGameInfo: (info) => set((state) => ({
    gameId: info.id || state.gameId,
    gameName: info.name || state.gameName,
    gameStatus: info.status || state.gameStatus,
  })),

  setPlayerInfo: (id, nation, color) => set({
    playerId: id,
    playerNation: nation,
    playerColor: color
  }),

  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => {
    // Avoid duplicates
    if (state.players.find(p => p.id === player.id)) return state
    return { players: [...state.players, player] }
  }),
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter((p) => p.id !== playerId)
  })),
  updatePlayerStatus: (playerId, isOnline) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, isOnline } : p)
  })),

  setResources: (resources) => set({ resources }),

  updateResources: (resources) => set((state) => ({
    resources: { ...state.resources, ...resources }
  })),

  updateResource: (type, amount) => set((state) => ({
    resources: { ...state.resources, [type]: state.resources[type] + amount }
  })),

  setCurrentTick: (tick) => set({ currentTick: tick }),

  setProvinces: (provinces) => set({ provinces }),

  // MERGE server data into existing map (or create placeholders)
  syncServerProvinces: (serverProvinces) => set((state) => {
    const newProvinces = [...state.provinces]
    let hasChanges = false

    // If local map is empty, simply set it (MapComponent will generate later? No, this might race)
    // If MapComponent hasn't run yet, state.provinces is empty. Server sends data. We set it.
    // THEN MapComponent runs. It sees provinces not empty. It SKIPS generation.
    // RESULT: Partial Map.
    // FIX: Client must generate map blindly if seed is present?

    // Better strategy: Store server updates in a separate dictionary or strictly MERGE by ID.
    // If ID exists, update. If not, add.
    // But we want the procedural terrain to persist.

    // Re-map existing to Map for speed
    const localMap = new Map(newProvinces.map(p => [p.id, p]))

    serverProvinces.forEach(sp => {
      const local = localMap.get(sp.id)
      if (local) {
        // Update existing (Owner, Buildings, Units)
        // Preserve Terrain details from local generation if server doesn't send them (Server sends minimal?)
        // Server 'province' object in server.js has 'terrain' prop now?
        // In server.js generate 'demo' code pushes full province. 
        // BUT server only creates starting province.

        // Just overwrite visuals with server truth for ownership
        localMap.set(sp.id, { ...local, ...sp })
        hasChanges = true
      } else {
        // Server knows about a province we don't? (Shouldn't happen if seed matches, unless valid new province)
        localMap.set(sp.id, sp)
        hasChanges = true
      }
    })

    return { provinces: Array.from(localMap.values()) }
  }),

  updateProvince: (provinceId, data) => set((state) => ({
    provinces: state.provinces.map((p) =>
      p.id === provinceId ? { ...p, ...data } : p
    )
  })),

  setMapSeed: (seed) => set({ mapSeed: seed }),

  setPendingMapUpdates: (updates) => set({ pendingMapUpdates: updates }),

  setArmies: (armies) => set({ armies }),

  addArmy: (army) => set((state) => ({
    armies: [...state.armies, army]
  })),

  updateArmy: (armyId, data) => set((state) => ({
    armies: state.armies.map((a) =>
      a.id === armyId ? { ...a, ...data } : a
    )
  })),

  removeArmy: (armyId) => set((state) => ({
    armies: state.armies.filter((a) => a.id !== armyId)
  })),

  setBattles: (battles) => set({ battles }),

  addBattle: (battle) => set((state) => ({
    battles: [...state.battles, battle as Battle]
  })),

  updateBattle: (battleId, data) => set((state) => ({
    battles: state.battles.map((b) =>
      b.id === battleId ? { ...b, ...data } : b
    )
  })),

  removeBattle: (battleId) => set((state) => ({
    battles: state.battles.filter((b) => b.id !== battleId)
  })),

  setActiveBattle: (battleId) => set({ activeBattleId: battleId }),

  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  incrementTick: () => set((state) => ({ currentTick: state.currentTick + 1 })),

  reset: () => set({
    gameId: null,
    gameName: null,
    gameStatus: null,
    currentTick: 0,
    provinces: [],
    mapSeed: null,
    pendingMapUpdates: [],
    playerId: null,
    playerNation: null,
    playerColor: null,
    resources: initialResources,
    armies: [],
    battles: [],
    activeBattleId: null,
    currentPhase: 'planning',
  }),
}))
