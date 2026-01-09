import { create } from 'zustand'

// ============================================
// PLAYER STORE
// ============================================

interface PlayerState {
    // Player Identity
    playerId: string | null
    username: string | null
    nation: string | null
    color: string | null

    // Alliance Info
    allianceId: string | null
    allianceName: string | null
    allianceMembers: string[]

    // Status
    reputation: number
    isOnline: boolean
    inSleepMode: boolean
    sleepModeEnd: Date | null
    lastLogin: Date | null

    // Actions
    setPlayer: (data: Partial<PlayerState>) => void
    setAlliance: (id: string | null, name: string | null, members?: string[]) => void
    setSleepMode: (active: boolean, endTime?: Date) => void
    updateReputation: (change: number) => void
    setOnlineStatus: (isOnline: boolean) => void
    reset: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
    // Initial State
    playerId: null,
    username: null,
    nation: null,
    color: null,
    allianceId: null,
    allianceName: null,
    allianceMembers: [],
    reputation: 100,
    isOnline: false,
    inSleepMode: false,
    sleepModeEnd: null,
    lastLogin: null,

    // Actions
    setPlayer: (data) => set((state) => ({ ...state, ...data })),

    setAlliance: (id, name, members = []) => set({
        allianceId: id,
        allianceName: name,
        allianceMembers: members,
    }),

    setSleepMode: (active, endTime) => set({
        inSleepMode: active,
        sleepModeEnd: endTime || null,
    }),

    updateReputation: (change) => set((state) => ({
        reputation: Math.max(0, Math.min(200, state.reputation + change))
    })),

    setOnlineStatus: (isOnline) => set({ isOnline }),

    reset: () => set({
        playerId: null,
        username: null,
        nation: null,
        color: null,
        allianceId: null,
        allianceName: null,
        allianceMembers: [],
        reputation: 100,
        isOnline: false,
        inSleepMode: false,
        sleepModeEnd: null,
        lastLogin: null,
    }),
}))
