import { create } from 'zustand'

// ============================================
// SESSION STORE
// ============================================

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

interface SessionState {
    // Authentication
    isAuthenticated: boolean
    token: string | null
    userId: string | null

    // Connection
    connectionStatus: ConnectionStatus
    socketId: string | null
    lastPing: number
    latency: number

    // Game Session
    currentGameId: string | null
    isInGame: boolean

    // Error Handling
    lastError: string | null
    errorCount: number

    // Actions
    setAuthenticated: (isAuth: boolean, token?: string, userId?: string) => void
    setConnectionStatus: (status: ConnectionStatus) => void
    setSocketId: (socketId: string | null) => void
    updatePing: (latency: number) => void
    setCurrentGame: (gameId: string | null) => void
    setError: (error: string | null) => void
    incrementErrorCount: () => void
    resetErrorCount: () => void
    logout: () => void
    reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
    // Initial State
    isAuthenticated: false,
    token: null,
    userId: null,
    connectionStatus: 'disconnected',
    socketId: null,
    lastPing: 0,
    latency: 0,
    currentGameId: null,
    isInGame: false,
    lastError: null,
    errorCount: 0,

    // Actions
    setAuthenticated: (isAuth, token, userId) => set({
        isAuthenticated: isAuth,
        token: token || null,
        userId: userId || null,
    }),

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    setSocketId: (socketId) => set({ socketId }),

    updatePing: (latency) => set({
        lastPing: Date.now(),
        latency,
    }),

    setCurrentGame: (gameId) => set({
        currentGameId: gameId,
        isInGame: gameId !== null,
    }),

    setError: (error) => set({ lastError: error }),

    incrementErrorCount: () => set((state) => ({
        errorCount: state.errorCount + 1,
    })),

    resetErrorCount: () => set({ errorCount: 0 }),

    logout: () => set({
        isAuthenticated: false,
        token: null,
        userId: null,
        currentGameId: null,
        isInGame: false,
    }),

    reset: () => set({
        isAuthenticated: false,
        token: null,
        userId: null,
        connectionStatus: 'disconnected',
        socketId: null,
        lastPing: 0,
        latency: 0,
        currentGameId: null,
        isInGame: false,
        lastError: null,
        errorCount: 0,
    }),
}))
