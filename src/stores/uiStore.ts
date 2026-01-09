import { create } from 'zustand'

// ============================================
// UI STORE
// ============================================

export type PanelType = 'dashboard' | 'diplomacy' | 'chat' | 'battle' | 'construction' | 'army' | null
export type ChatTab = 'global' | 'alliance' | 'private'

interface UIState {
    // Active Panels
    activePanel: PanelType
    previousPanel: PanelType

    // Selection
    selectedProvinceId: string | null
    selectedArmyId: string | null
    hoveredProvinceId: string | null

    // Map Controls
    showMinimap: boolean
    mapZoom: number
    mapPosition: { x: number; y: number }

    // UI Elements
    showNotifications: boolean
    showResourceDetails: boolean
    showTutorial: boolean
    tutorialStep: number

    // Chat
    chatTab: ChatTab
    unreadMessages: { global: number; alliance: number; private: number }

    // Modals
    isModalOpen: boolean
    modalType: string | null
    modalData: unknown

    // Actions
    setActivePanel: (panel: PanelType) => void
    togglePanel: (panel: PanelType) => void
    selectProvince: (provinceId: string | null) => void
    selectArmy: (armyId: string | null) => void
    setHoveredProvince: (provinceId: string | null) => void
    setMapZoom: (zoom: number) => void
    setMapPosition: (x: number, y: number) => void
    toggleMinimap: () => void
    toggleNotifications: () => void
    setChatTab: (tab: ChatTab) => void
    addUnreadMessage: (type: ChatTab) => void
    clearUnreadMessages: (type: ChatTab) => void
    openModal: (type: string, data?: unknown) => void
    closeModal: () => void
    setTutorialStep: (step: number) => void
    completeTutorial: () => void
    reset: () => void
}

export const useUIStore = create<UIState>((set) => ({
    // Initial State
    activePanel: 'dashboard',
    previousPanel: null,
    selectedProvinceId: null,
    selectedArmyId: null,
    hoveredProvinceId: null,
    showMinimap: true,
    mapZoom: 1,
    mapPosition: { x: 0, y: 0 },
    showNotifications: true,
    showResourceDetails: false,
    showTutorial: true,
    tutorialStep: 0,
    chatTab: 'global',
    unreadMessages: { global: 0, alliance: 0, private: 0 },
    isModalOpen: false,
    modalType: null,
    modalData: null,

    // Actions
    setActivePanel: (panel) => set((state) => ({
        previousPanel: state.activePanel,
        activePanel: panel,
    })),

    togglePanel: (panel) => set((state) => ({
        previousPanel: state.activePanel,
        activePanel: state.activePanel === panel ? state.previousPanel : panel,
    })),

    selectProvince: (provinceId) => set({ selectedProvinceId: provinceId }),

    selectArmy: (armyId) => set({ selectedArmyId: armyId }),

    setHoveredProvince: (provinceId) => set({ hoveredProvinceId: provinceId }),

    setMapZoom: (zoom) => set({ mapZoom: Math.max(0.5, Math.min(3, zoom)) }),

    setMapPosition: (x, y) => set({ mapPosition: { x, y } }),

    toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),

    toggleNotifications: () => set((state) => ({
        showNotifications: !state.showNotifications
    })),

    setChatTab: (tab) => set({ chatTab: tab }),

    addUnreadMessage: (type) => set((state) => ({
        unreadMessages: {
            ...state.unreadMessages,
            [type]: state.unreadMessages[type] + 1,
        }
    })),

    clearUnreadMessages: (type) => set((state) => ({
        unreadMessages: {
            ...state.unreadMessages,
            [type]: 0,
        }
    })),

    openModal: (type, data) => set({
        isModalOpen: true,
        modalType: type,
        modalData: data,
    }),

    closeModal: () => set({
        isModalOpen: false,
        modalType: null,
        modalData: null,
    }),

    setTutorialStep: (step) => set({ tutorialStep: step }),

    completeTutorial: () => set({ showTutorial: false, tutorialStep: -1 }),

    reset: () => set({
        activePanel: 'dashboard',
        previousPanel: null,
        selectedProvinceId: null,
        selectedArmyId: null,
        hoveredProvinceId: null,
        showMinimap: true,
        mapZoom: 1,
        mapPosition: { x: 0, y: 0 },
        showNotifications: true,
        showResourceDetails: false,
        showTutorial: true,
        tutorialStep: 0,
        chatTab: 'global',
        unreadMessages: { global: 0, alliance: 0, private: 0 },
        isModalOpen: false,
        modalType: null,
        modalData: null,
    }),
}))
