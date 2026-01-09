import { create } from 'zustand'

// ============================================
// TYPES
// ============================================

export interface Resources {
  gold: number
  iron: number
  oil: number
  food: number
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
  goldBonus: number
  ironBonus: number
  oilBonus: number
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
  name: string | null
  playerId: string
  currentProvinceId: string
  currentProvinceName?: string
  isMoving: boolean
  destinationId: string | null
  estimatedArrival?: Date
  units: Unit[]
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
  updateProvince: (provinceId: string, data: Partial<Province>) => void
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

const initialResources: Resources = {
  gold: 1000,
  iron: 500,
  oil: 250,
  food: 750,
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  gameId: null,
  gameName: null,
  gameStatus: null,
  currentTick: 0,
  players: [], // Initial empty players
  provinces: [],
  playerId: null,
  playerNation: null,
  playerColor: null,
  resources: { gold: 0, iron: 0, oil: 0, food: 0 },
  armies: [],
  battles: [],
  activeBattleId: null,
  currentPhase: 'planning',

  // Actions
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

  updateProvince: (provinceId, data) => set((state) => ({
    provinces: state.provinces.map((p) =>
      p.id === provinceId ? { ...p, ...data } : p
    )
  })),

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
