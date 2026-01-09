# 🎖️ WORLD CONFLICT 1945
## FASE 3: MVP DEVELOPMENT - DISEÑO EXPERIMENTAL (ARQUITECTURA DEL SISTEMA) - TUTORIAL COMPLETO

---

## 📋 ÍNDICE DE LA FASE 3

1. [Introducción a la Fase 3](#1-introducción-a-la-fase-3)
2. [Objetivos de la Fase 3](#2-objetivos-de-la-fase-3)
3. [Metodología de la Fase 3](#3-metodología-de-la-fase-3)
4. [Arquitectura Técnica Completa](#4-arquitectura-técnica-completa)
5. [Arquitectura Frontend (5 Capas)](#5-arquitectura-frontend-5-capas)
6. [Arquitectura Backend](#6-arquitectura-backend)
7. [Arquitectura de Base de Datos](#7-arquitectura-de-base-de-datos)
8. [UI/UX Wireframes y Prototipos](#8-uiux-wireframes-y-prototipos)
9. [Schema de Base de Datos Completo](#9-schema-de-base-de-datos-completo)
10. [Arquitectura de Infraestructura](#10-arquitectura-de-infraestructura)
11. [Technical Design Document (TDD) - Arquitectura del Sistema](#11-technical-design-document-tdd---arquitectura-del-sistema)
12. [Desarrollo del MVP - 12 Features P0](#12-desarrollo-del-mvp---12-features-p0)
13. [Testing y Validación](#13-testing-y-validación)
14. [Deployment y Operations](#14-deployment-y-operations)
15. [Documentación Técnica](#15-documentación-técnica)
16. [Quality Assurance](#16-quality-assurance)
17. [Validación del MVP y Go/No-Go para Fase 4 (Alpha)](#17-validación-del-mvp-y-gonogo-para-fase-4-alpha)
18. [Checklist de Validación Fase 3](#18-checklist-de-validación-fase-3)

---

## 1. INTRODUCCIÓN A LA FASE 3

### 1.1 Objetivo Principal

**Objetivo:**
> Diseñar y construir el MVP (Producto Mínimo Viable) de WORLD CONFLICT 1945, implementando las 12 features P0 definidas en la Fase 2, listo para validación con usuarios reales.

### 1.2 Duración Estimada

**Timeline:**
- **Fase 3: MVP Development** - 8-12 semanas
- **Breakdown por Semana:**
  - Semana 1-2: Technical Design & Architecture
  - Semana 3-4: UI/UX Wireframes & Prototypes
  - Semana 5-8: Backend Development (6 features)
  - Semana 7-10: Frontend Development (6 features)
  - Semana 9-11: Integration & Testing
  - Semana 12: Deployment & Validation

### 1.3 Scope del MVP

**Escala del MVP:**
- **Jugadores simultáneos:** 20-50 por partida
- **Provincias:** 100-200 por mapa
- **Duración de campaña:** 7 días (validación)
- **Servers:** 1 región
- **Features:** 12 features P0 (Must-Have)

---

## 2. OBJETIVOS DE LA FASE 3

### 2.1 Objetivos Técnicos

1. **Arquitectura del Sistema (TDD):**
   - Diseñar arquitectura frontend completa (5 capas)
   - Diseñar arquitectura backend completa
   - Diseñar arquitectura de base de datos
   - Diseñar arquitectura de infraestructura

2. **Schema de Base de Datos:**
   - Diseñar todas las tablas del sistema
   - Definir relaciones entre tablas
   - Definir índices y constraints
   - Definir migrations

3. **UI/UX Design:**
   - Wireframes de todas las interfaces
   - Mockups de pantallas clave
   - Prototipos interactivos
   - Design system components

4. **Implementación del MVP:**
   - Setup técnico del proyecto
   - Implementar 12 features P0
   - Integrar frontend con backend
   - Implementar game server básico

5. **Testing y Validación:**
   - Pruebas unitarias
   - Pruebas de integración
   - Pruebas E2E (End-to-End)
   - Validación de performance
   - Validación de seguridad

### 2.2 Objetivos de Negocio

1. **Time-to-Market:** Lanzar MVP en 8-12 semanas
2. **User Acquisition:** Validar con 100-500 usuarios reales
3. **Product-Market Fit:** Validar que el concepto tiene demanda
4. **Feedback Collection:** Obtener feedback de usuarios reales
5. **Go/No-Go Decision:** Decidir si continuar a Alpha o pivotear

---

## 3. METODOLOGÍA DE LA FASE 3

### 3.1 Enfoque: Design-First, Then Build

**Principios:**
1. **Diseñar antes de codificar**
   - Arquitectura antes de implementación
   - Schema antes de código
   - UI antes de desarrollo

2. **Iterar rápido**
   - Prototipos antes de código final
   - MVP antes de features completas
   - Feedback rápido del equipo

3. **Priorizar features P0**
   - Solo implementar lo esencial para el MVP
   - Dejar features P1-P3 para Alpha/Beta

4. **Documentar todo**
   - Code comments
   - Technical design docs
   - API documentation
   - Database schema docs

### 3.2 Framework de Desarrollo

**Weeks 1-2: Design & Architecture**
- Technical Design Document (TDD)
- Database Schema Design
- UI/UX Wireframes
- Setup del proyecto técnico

**Weeks 3-4: Prototyping & UI/UX**
- Mockups de todas las interfaces
- Prototipos interactivos de key flows
- Design system components
- Validación de diseño con stakeholders

**Weeks 5-10: Development**
- Backend implementation (Weeks 5-8)
- Frontend implementation (Weeks 7-10)
- Integration frontend-backend (Weeks 9-10)
- Game server development (Weeks 6-9)

**Weeks 11-12: Testing & Deployment**
- Unit testing
- Integration testing
- E2E testing
- Performance testing
- Deployment to staging
- Beta testing with real users

---

## 4. ARQUITECTURA TÉCNICA COMPLETA

### 4.1 Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                     🌐 CLOUD INFRASTRUCTURE                    │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   📡 LOAD BALANCER (CDN)                  │
│                  (Cloudflare / Fastly)                    │
└─────────────────────────────────────────────────────────────────────┘
         ↓ (Frontend Traffic)             ↓ (Backend Traffic)
┌────────────────────────┐        ┌──────────────────────┐
│   FRONTEND LAYER   │        │   BACKEND LAYER     │
│   (Next.js 15)     │        │   (Node.js + Bun)   │
└────────────────────────┘        └──────────────────────┘
         ↓ (WebSockets)               ↓ (PostgreSQL)
┌─────────────────────────────────────────────────────────────────────┐
│                   GAME SERVER & API LAYER                 │
│                  (Socket.IO + REST)                       │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   DATA LAYER (DB + Cache)               │
│             (PostgreSQL + Redis + Prisma)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Arquitectura por Capas

**CAPA 1: Infraestructura (Infrastructure Layer)**
- Cloud hosting (AWS/GCP)
- CDN (Cloudflare)
- Load balancing
- Monitoring & logging
- CI/CD pipeline

**CAPA 2: Frontend (Presentation Layer)**
- Next.js 15 App Router
- React 18 Components
- Three.js 3D Rendering
- Socket.IO-client (real-time)
- Zustand (state management)
- TanStack Query (server state)

**CAPA 3: Backend (Logic Layer)**
- Node.js + Bun Runtime
- Socket.IO (WebSockets)
- Next.js API Routes (REST)
- Prisma ORM (database)
- Redis (cache)
- Business logic implementation

**CAPA 4: Data (Persistence Layer)**
- PostgreSQL (primary database)
- Redis (cache layer)
- Prisma (database access)
- Migrations management

**CAPA 5: External Services**
- Authentication (NextAuth.js)
- Payments (Stripe)
- Analytics (Sentry + Datadog)
- Email notifications (SendGrid)

---

## 5. ARQUITECTURA FRONTEND (5 CAPAS)

### 5.1 Diagrama de Arquitectura Frontend

```
┌─────────────────────────────────────────────────────────────────────┐
│                   🎮 GAME CLIENT (NEXT.JS 15)          │
├─────────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 📱 PRESENTATION LAYER (React 18)            │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - MapComponent (Three.js 3D)               │   │
│  │  - UIOverlay (HUD)                             │   │
│  │  - BattleView (Tactical)                       │   │
│  │  - Dashboard (Resources)                         │   │
│  │  - DiplomacyPanel                               │   │
│  │  - ChatComponent                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🧠 STATE MANAGEMENT LAYER (Zustand)          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - GameStore (game state)                      │   │
│  │  - PlayerStore (player state)                   │   │
│  │  - UIReducers (UI state)                       │   │
│  │  - SessionStore (session state)                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🌐 SERVER STATE LAYER (TanStack Query)          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - GameData (persistent)                         │   │
│  │  - PlayerData (user profile)                    │   │
│  │  - MapData (provinces)                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🔌 REAL-TIME LAYER (Socket.IO-Client)         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - WebSocket connection (persistent)               │   │
│  │  - Game events (gameStarted, battleStart, etc.)   │   │
│  │  - Chat events (global, alliance, private)        │   │
│  │  - Reconnection handling                         │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Capa de Presentación (Presentation Layer)

**Componentes Principales:**

**1. MapComponent (Three.js 3D)**
- Renderizado del mapa isométrico 3D
- Sistema de cámara (zoom, pan, rotate)
- Renderizado de provincias con colores por dueño
- Renderizado de unidades (soldados, tanques, etc.)
- Sistema de selección de unidades
- Sistema de highlighting
- Animaciones de movimiento
- Partículas (explosiones, humo)

**2. UIOverlay (HUD - Heads Up Display)**
- Barra de recursos (oro, hierro, petróleo, comida)
- Minimapa
- Botón de "Chat"
- Botón de "Diplomacy"
- Notificaciones en tiempo real
- Timer de campaña
- Indicador de conexión

**3. BattleView (Tactical)**
- Vista táctica isométrica de la batalla
- Renderizado de unidades en combate
- Línea de tiempo de batalla
- Estadísticas en tiempo real (bajas, moral)
- Barra de progreso
- Botón de "Enviar Refuerzos"

**4. Dashboard (Resources)**
- Panel de gestión de recursos
- Lista de edificios en provincia seleccionada
- Lista de tropas reclutadas
- Opciones de construcción

**5. DiplomacyPanel**
- Lista de alianzas
- Lista de jugadores en mapa
- Botón de "Aliarse"
- Botón de "Pacto de No Agresión"
- Reputación de jugadores

**6. ChatComponent**
- Chat global
- Chat de alianza
- Chat privado (1-a-1)
- Sistema de emojis
- Timestamps

### 5.3 Capa de Gestión de Estado (State Management Layer)

**Stores de Zustand:**

**1. GameStore**
```typescript
// stores/gameStore.ts
interface GameState {
  gameId: string;
  playerNation: string;
  provinces: Province[];
  resources: Resources;
  armies: Army[];
  battles: Battle[];
  currentPhase: 'planning' | 'battle';
}

interface Province {
  id: string;
  name: string;
  ownerId: string | null;
  coordinates: { x: number; y: number };
  resourceBonus: ResourceBonus;
  defenseBonus: number;
  units: Unit[];
}

interface Resources {
  gold: number;
  iron: number;
  oil: number;
  food: number;
}

interface Army {
  id: string;
  units: Unit[];
  position: { provinceId: string; x: number; y: number };
  isMoving: boolean;
  destination: string | null;
}

interface Battle {
  id: string;
  provinceId: string;
  attacker: Army;
  defender: Army;
  startTime: number;
  duration: number;
  status: 'pending' | 'active' | 'completed';
  attackerCasualties: number;
  defenderCasualties: number;
}

const useGameStore = create<GameState>((set) => ({
  gameId: null,
  playerNation: null,
  provinces: [],
  resources: { gold: 1000, iron: 500, oil: 250, food: 750 },
  armies: [],
  battles: [],
  currentPhase: 'planning',
}));
```

**2. PlayerStore**
```typescript
// stores/playerStore.ts
interface PlayerState {
  playerId: string;
  username: string;
  nation: string;
  color: string;
  alliance: string | null;
  reputation: number;
  isOnline: boolean;
  inSleepMode: boolean;
  lastLogin: number;
}

const usePlayerStore = create<PlayerState>((set) => ({
  playerId: null,
  username: null,
  nation: null,
  color: null,
  alliance: null,
  reputation: 100,
  isOnline: false,
  inSleepMode: false,
  lastLogin: null,
}));
```

**3. UIReducers**
```typescript
// stores/uiStore.ts
interface UIState {
  activePanel: 'dashboard' | 'diplomacy' | 'chat' | 'battle';
  selectedProvince: string | null;
  selectedArmy: string | null;
  showMinimap: boolean;
  showNotifications: boolean;
  chatTab: 'global' | 'alliance' | 'private';
}

const useUIStore = create<UIState>((set) => ({
  activePanel: 'dashboard',
  selectedProvince: null,
  selectedArmy: null,
  showMinimap: true,
  showNotifications: true,
  chatTab: 'global',
}));
```

**4. SessionStore**
```typescript
// stores/sessionStore.ts
interface SessionState {
  isAuthenticated: boolean;
  token: string | null;
  gameId: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastPing: number;
}

const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  token: null,
  gameId: null,
  connectionStatus: 'disconnected',
  lastPing: 0,
}));
```

### 5.4 Capa de Estado Servidor (Server State Layer)

**TanStack Query Hooks:**

```typescript
// hooks/useGameData.ts
export const useGameData = () => {
  return useQuery({
    queryKey: ['gameData'],
    queryFn: async () => {
      const response = await fetch('/api/game/data');
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always refetch on mount
  });
};

export const usePlayerData = () => {
  return useQuery({
    queryKey: ['playerData'],
    queryFn: async () => {
      const response = await fetch('/api/player/data');
      return response.json();
    },
    staleTime: 60000, // 10 minutes
  });
};

export const useMapData = () => {
  return useQuery({
    queryKey: ['mapData'],
    queryFn: async () => {
      const response = await fetch('/api/map/data');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 0,
  });
};
```

### 5.5 Capa de Tiempo Real (Real-Time Layer)

**Socket.IO-Client Integration:**

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Event Listeners for Game Events
export const gameEvents = {
  // Game Events
  'game:start': (data: GameStartData) => void,
  'game:join': (data: GameJoinData) => void,
  'game:leave': (data: GameLeaveData) => void,
  'game:end': (data: GameEndData) => void,

  // Map Events
  'map:update': (data: MapUpdateData) => void,
  'province:capture': (data: ProvinceCaptureData) => void,
  'province:lost': (data: ProvinceLostData) => void,

  // Battle Events
  'battle:start': (data: BattleStartData) => void,
  'battle:update': (data: BattleUpdateData) => void,
  'battle:end': (data: BattleEndData) => void,
  'battle:reinforce': (data: BattleReinforceData) => void,

  // Army Events
  'army:move': (data: ArmyMoveData) => void,
  'army:attack': (data: ArmyAttackData) => void,
  'army:defend': (data: ArmyDefendData) => void,
  'army:retreat': (data: ArmyRetreatData) => void,

  // Resource Events
  'resource:update': (data: ResourceUpdateData) => void,
  'resource:collect': (data: ResourceCollectData) => void,

  // Chat Events
  'chat:message': (data: ChatMessageData) => void,
  'chat:typing': (data: ChatTypingData) => void,

  // Diplomacy Events
  'diplomacy:alliance': (data: AllianceData) => void,
  'diplomacy:pact': (data: PactData) => void,
  'diplomacy:war': (data: WarData) => void,
  'diplomacy:peace': (data: PeaceData) => void,

  // System Events
  'system:notification': (data: NotificationData) => void,
  'system:error': (data: ErrorData) => void,
  'system:ping': () => void,
};

// Initialize Listeners
export const initializeSocketListeners = () => {
  gameEvents['system:ping'](() => {
    socket.emit('system:pong', Date.now());
  });

  gameEvents['game:join']((data) => {
    useSessionStore.getState().setGameId(data.gameId);
    useGameStore.getState().setPlayerNation(data.nation);
    useGameStore.getState().setProvinces(data.provinces);
  });

  gameEvents['map:update']((data) => {
    useGameStore.getState().setProvince(data.provinceId, data.province);
  });

  gameEvents['battle:start']((data) => {
    useGameStore.getState().addBattle(data.battle);
    // Open battle view
    useUIStore.getState().setActivePanel('battle');
  });

  gameEvents['battle:update']((data) => {
    useGameStore.getState().updateBattle(data.battleId, data.update);
  });

  gameEvents['battle:end']((data) => {
    useGameStore.getState().removeBattle(data.battleId);
    useGameStore.getState().updateResources(data.resources);
  });

  gameEvents['chat:message']((data) => {
    useChatStore.getState().addMessage(data.message);
  });

  gameEvents['diplomacy:alliance']((data) => {
    usePlayerStore.getState().setAlliance(data.allianceId);
  });

  gameEvents['system:notification']((data) => {
    useNotificationStore.getState().addNotification(data.notification);
  });

  gameEvents['system:error']((data) => {
    console.error('Socket Error:', data.error);
    useNotificationStore.getState().addError(data.error);
  });
};
```

### 5.6 Componentes React Principales

**1. MapComponent**
```typescript
// components/MapComponent.tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '@/stores/gameStore';
import { useMapData } from '@/hooks/useMapData';
import socket, { initializeSocketListeners } from '@/lib/socket';

interface MapComponentProps {
  gameId: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({ gameId }) => {
  const { provinces } = useGameStore();
  const { data: mapData, isLoading } = useMapData(gameId);

  useFrame(() => {
    // Update animations
    // Update unit positions
    // Update particle effects
  });

  useEffect(() => {
    initializeSocketListeners();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <Canvas camera={{ position: [0, 10, 100], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={50}
      />

      {provinces.map((province) => (
        <ProvinceMesh
          key={province.id}
          province={province}
          onClick={() => handleProvinceClick(province.id)}
        />
      ))}

      {mapData.units.map((unit) => (
        <UnitMesh
          key={unit.id}
          unit={unit}
          isSelected={false}
        />
      ))}

      {mapData.battles.map((battle) => (
        <BattleEffect
          key={battle.id}
          battle={battle}
        />
      ))}
    </Canvas>
  );
};

const ProvinceMesh: React.FC<{ province: Province }> = ({ province }) => {
  const { color } = usePlayerStore();

  return (
    <mesh
      position={[province.coordinates.x, 0, province.coordinates.y]}
      onClick={props.onClick}
    >
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial
        color={province.ownerId ? '#4A5D4F' : '#708090'}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const UnitMesh: React.FC<{ unit: Unit }> = ({ unit }) => {
  return (
    <mesh position={[unit.position.x, 0.5, unit.position.y]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial
        color={unit.ownerId === usePlayerStore.getState().playerId ? '#DAA520' : '#CD5C5C'}
      />
    </mesh>
  );
};
```

**2. Dashboard Component**
```typescript
// components/DashboardComponent.tsx
'use client';

import { useGameStore } from '@/stores/gameStore';
import { usePlayerData } from '@/hooks/usePlayerData';

export const DashboardComponent: React.FC = () => {
  const { resources, currentPhase } = useGameStore();
  const { data: playerData } = usePlayerData();

  if (currentPhase === 'battle') {
    return null; // Don't show dashboard during battle
  }

  return (
    <div className="dashboard">
      <div className="resources-panel">
        <ResourceCard
          icon="💰"
          name="Oro"
          amount={resources.gold}
          rate="+{playerData.goldRate}/hora"
        />
        <ResourceCard
          icon="⚙️"
          name="Hierro"
          amount={resources.iron}
          rate="+{playerData.ironRate}/hora"
        />
        <ResourceCard
          icon="🛢️"
          name="Petróleo"
          amount={resources.oil}
          rate="+{playerData.oilRate}/hora"
        />
        <ResourceCard
          icon="🌾"
          name="Comida"
          amount={resources.food}
          rate="+{playerData.foodRate}/hora"
        />
      </div>

      <div className="buildings-panel">
        <BuildingList provinceId={playerData.currentProvinceId} />
      </div>

      <div className="troops-panel">
        <TroopList />
      </div>
    </div>
  );
};

const ResourceCard: React.FC<{
  icon: string;
  name: string;
  amount: number;
  rate: string;
}> = ({ icon, name, amount, rate }) => {
  return (
    <div className="resource-card">
      <span className="resource-icon">{icon}</span>
      <div className="resource-info">
        <span className="resource-name">{name}</span>
        <span className="resource-amount">{amount.toLocaleString()}</span>
        <span className="resource-rate">{rate}</span>
      </div>
    </div>
  );
};
```

**3. BattleView Component**
```typescript
// components/BattleView.tsx
'use client';

import { useGameStore } from '@/stores/gameStore';
import socket from '@/lib/socket';

interface BattleViewProps {
  battleId: string;
}

export const BattleView: React.FC<BattleViewProps> = ({ battleId }) => {
  const { battles } = useGameStore();
  const battle = battles.find((b) => b.id === battleId);

  if (!battle) return null;

  const [timeRemaining, setTimeRemaining] = useState(
    battle.startTime + battle.duration - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = battle.startTime + battle.duration - Date.now();
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        socket.emit('battle:end', { battleId });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [battleId]);

  const handleReinforce = (unitType: string) => {
    socket.emit('battle:reinforce', { battleId, unitType });
  };

  const progress = ((battle.duration - timeRemaining) / battle.duration) * 100;

  return (
    <div className="battle-view">
      <div className="battle-header">
        <span className="battle-title">Batalla en {battle.provinceName}</span>
        <span className="battle-timer">
          Tiempo restante: {Math.floor(timeRemaining / 1000 / 60)}:{(timeRemaining / 1000 % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="battle-visualization">
        <BattleCanvas battle={battle} />
      </div>

      <div className="battle-stats">
        <div className="stats-attacker">
          <span className="attacker-label">Atacante:</span>
          <span className="attacker-name">{battle.attacker.name}</span>
          <span className="attacker-units">{battle.attacker.casualties} bajas</span>
        </div>
        <div className="bar" style={{ width: `${progress}%` }}>
          <div className="bar-fill" />
        </div>
        <div className="stats-defender">
          <span className="defender-label">Defensor:</span>
          <span className="defender-name">{battle.defender.name}</span>
          <span className="defender-units">{battle.defender.casualties} bajas</span>
        </div>
      </div>

      <div className="battle-actions">
        <button
          className="btn-reinforce"
          onClick={() => handleReinforce('infantry')}
          disabled={timeRemaining < 5000}
        >
          Enviar Infantería
        </button>
        <button
          className="btn-reinforce"
          onClick={() => handleReinforce('tank')}
          disabled={timeRemaining < 5000}
        >
          Enviar Tanques
        </button>
        <button
          className="btn-retreat"
          onClick={() => socket.emit('army:retreat', { battleId })}
          disabled={timeRemaining < 30000}
        >
          Retirar
        </button>
      </div>
    </div>
  );
};
```

---

## 6. ARQUITECTURA BACKEND

### 6.1 Diagrama de Arquitectura Backend

```
┌─────────────────────────────────────────────────────────────────────┐
│                  🔧 BACKEND SERVICES (BUN RUNTIME)          │
├─────────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🌐 API LAYER (NEXT.JS 15 API ROUTES)          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - /api/auth/* (Authentication)                  │   │
│  │  - /api/game/* (Game Data)                      │   │
│  │  - /api/player/* (Player Data)                   │   │
│  │  - /api/map/* (Map Data)                        │   │
│  │  - /api/army/* (Army Actions)                    │   │
│  │  - /api/battle/* (Battle Actions)                  │   │
│  │  - /api/diplomacy/* (Diplomacy Actions)          │   │
│  │  - /api/chat/* (Chat Actions)                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🎮 GAME SERVER LAYER (SOCKET.IO + GAME LOGIC)  │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - Socket.IO Server (WebSocket)                  │   │
│  │  - Game Rooms (partidas)                        │   │
│  │  - Game Loop (60 ticks/second)                   │   │
│  │  - State Management (per game)                    │   │
│  │  - Battle Logic (simulation)                       │   │
│  │  - Resource Management                            │   │
│  │  - Diplomacy Engine                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 💾 DATA ACCESS LAYER (PRISMA ORM + POSTGRES)    │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - User Models & Queries                        │   │
│  │  - Game Models & Queries                        │   │
│  │  - Army Models & Queries                         │   │
│  │  - Battle Models & Queries                       │   │
│  │  - Diplomacy Models & Queries                   │   │
│  │  - Transaction Handling                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ⚡ CACHE LAYER (REDIS)                           │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  - Game State Cache (per game)                   │   │
│  │  - Player Session Cache                          │   │
│  │  - Map Data Cache (provinces)                    │   │
│  │  - Leaderboard Cache                              │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 API Layer (Next.js 15 API Routes)

**Estructura de Archivos:**
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── logout/route.ts
│   └── refresh/route.ts
├── game/
│   ├── create/route.ts
│   ├── join/route.ts
│   ├── leave/route.ts
│   ├── end/route.ts
│   ├── data/route.ts
│   └── state/route.ts
├── player/
│   ├── profile/route.ts
│   ├── nation/route.ts
│   ├── resources/route.ts
│   └── army/route.ts
├── map/
│   ├── provinces/route.ts
│   └── terrain/route.ts
├── army/
│   ├── move/route.ts
│   ├── attack/route.ts
│   ├── recruit/route.ts
│   └── retreat/route.ts
├── battle/
│   ├── start/route.ts
│   ├── reinforce/route.ts
│   └── result/route.ts
├── diplomacy/
│   ├── alliance/route.ts
│   ├── pact/route.ts
│   ├── war/route.ts
│   └── peace/route.ts
└── chat/
    ├── send/route.ts
    ├── history/route.ts
    └── typing/route.ts
```

**Ejemplos de API Routes:**

**1. Authentication API**
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NextAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { player: true },
    });

    if (!user || !(await Bun.password.verify(user.passwordHash, password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = NextAuth.createToken({ userId: user.id });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nation: user.player.nation,
        color: user.player.color,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**2. Game API**
```typescript
// app/api/game/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameServer } from '@/lib/gameServer';

export async function POST(req: NextRequest) {
  try {
    const { name, mapId, maxPlayers, duration } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create game in database
    const game = await prisma.game.create({
      data: {
        name,
        mapId,
        maxPlayers,
        duration: 7, // 7 days for MVP
        currentPlayers: 1,
        status: 'waiting',
        createdBy: auth.userId,
      },
    });

    // Initialize game state
    await GameServer.initializeGame(game.id);

    return NextResponse.json({
      game,
      message: 'Game created successfully',
    });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/game/join/route.ts
export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game || game.status !== 'waiting' || game.currentPlayers >= game.maxPlayers) {
      return NextResponse.json({ error: 'Game not available' }, { status: 400 });
    }

    // Join game
    await GameServer.joinGame(gameId, auth.userId);

    return NextResponse.json({
      message: 'Joined game successfully',
    });
  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**3. Army API**
```typescript
// app/api/army/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameServer } from '@/lib/gameServer';

export async function POST(req: NextRequest) {
  try {
    const { armyId, destinationProvinceId } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const army = await prisma.army.findUnique({
      where: { id: armyId },
      include: { units: true },
    });

    if (!army || army.playerId !== auth.userId) {
      return NextResponse.json({ error: 'Army not found or not yours' }, { status: 404 });
    }

    // Validate move (range, terrain, etc.)
    const moveValidation = await GameServer.validateMove(army, destinationProvinceId);
    if (!moveValidation.valid) {
      return NextResponse.json({ error: moveValidation.error }, { status: 400 });
    }

    // Execute move
    const moveResult = await GameServer.moveArmy(armyId, destinationProvinceId);

    // Broadcast to all players in game
    await GameServer.broadcastMove(moveResult);

    return NextResponse.json({
      success: true,
      moveResult,
    });
  } catch (error) {
    console.error('Move army error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/army/recruit/route.ts
export async function POST(req: NextRequest) {
  try {
    const { provinceId, unitType, quantity } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate recruitment (resources, building, etc.)
    const recruitmentValidation = await GameServer.validateRecruitment(
      auth.userId,
      provinceId,
      unitType,
      quantity
    );

    if (!recruitmentValidation.valid) {
      return NextResponse.json({ error: recruitmentValidation.error }, { status: 400 });
    }

    // Recruit units
    const recruitResult = await GameServer.recruitUnits(
      auth.userId,
      provinceId,
      unitType,
      quantity
    );

    return NextResponse.json({
      success: true,
      army: recruitResult.army,
      newUnits: recruitResult.units,
      cost: recruitResult.cost,
    });
  } catch (error) {
    console.error('Recruit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**4. Battle API**
```typescript
// app/api/battle/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameServer } from '@/lib/gameServer';

export async function POST(req: NextRequest) {
  try {
    const { attackerArmyId, defenderProvinceId } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attackerArmy = await prisma.army.findUnique({
      where: { id: attackerArmyId },
      include: { units: true },
    });

    if (!attackerArmy || attackerArmy.playerId !== auth.userId) {
      return NextResponse.json({ error: 'Army not found or not yours' }, { status: 404 });
    }

    // Start battle
    const battle = await GameServer.startBattle(
      attackerArmyId,
      defenderProvinceId,
      auth.userId
    );

    // Broadcast battle start to all players in game
    await GameServer.broadcastBattleStart(battle);

    return NextResponse.json({
      battle,
      message: 'Battle started',
    });
  } catch (error) {
    console.error('Start battle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/battle/reinforce/route.ts
export async function POST(req: NextRequest) {
  try {
    const { battleId, unitType, quantity } = await req.json();
    const auth = await NextAuth.getServerSession(req);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle || battle.status !== 'active') {
      return NextResponse.json({ error: 'Battle not found or not active' }, { status: 404 });
    }

    // Validate reinforcement (can reinforce?)
    const reinforcementValidation = await GameServer.validateReinforcement(
      auth.userId,
      battleId,
      unitType,
      quantity
    );

    if (!reinforcementValidation.valid) {
      return NextResponse.json({ error: reinforcementValidation.error }, { status: 400 });
    }

    // Reinforce battle
    const reinforceResult = await GameServer.reinforceBattle(
      battleId,
      unitType,
      quantity
    );

    // Broadcast reinforcement to all players in battle
    await GameServer.broadcastReinforcement(reinforceResult);

    return NextResponse.json({
      success: true,
      reinforceResult,
    });
  } catch (error) {
    console.error('Reinforce error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 6.3 Game Server Layer (Socket.IO + Game Logic)

**Game Server Architecture:**
```typescript
// lib/gameServer.ts
import { Server } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { GameEngine } from './gameEngine';

interface GameState {
  gameId: string;
  players: Map<string, PlayerState>;
  provinces: Map<string, ProvinceState>;
  armies: Map<string, ArmyState>;
  battles: Map<string, BattleState>;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  tick: number;
}

interface GameEngine {
  initialize(gameId: string): Promise<void>;
  join(gameId: string, playerId: string): Promise<void>;
  leave(gameId: string, playerId: string): Promise<void>;
  tick(delta: number): Promise<void>;
  getGameState(): GameState;
}

class GameServer {
  private games: Map<string, GameState> = new Map();
  private io: Server;
  private gameEngines: Map<string, GameEngine> = new Map();

  constructor() {
    this.io = new Server({
      cors: { origin: '*' },
      transports: ['websocket'],
    });

    this.initializeSocketListeners();
  }

  private initializeSocketListeners() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on('game:join', async (data) => {
        await this.joinGame(data.gameId, data.playerId, socket);
      });
      socket.on('army:move', async (data) => {
        await this.moveArmy(data.armyId, data.destinationProvinceId, socket);
      });
      socket.on('battle:start', async (data) => {
        await this.startBattle(data.attackerArmyId, data.defenderProvinceId, socket);
      });
      socket.on('battle:reinforce', async (data) => {
        await this.reinforceBattle(data.battleId, data.unitType, data.quantity, socket);
      });
      socket.on('diplomacy:alliance', async (data) => {
        await this.createAlliance(data.playerId1, data.playerId2, socket);
      });
      socket.on('chat:message', async (data) => {
        await this.sendChatMessage(data.gameId, data.playerId, data.message, socket);
      });
    });

    this.io.on('disconnect', (socket) => {
      console.log('Client disconnected:', socket.id);
      // Handle player disconnect
    });
  }

  private async createGame(gameConfig: GameConfig): Promise<string> {
    const gameId = crypto.randomUUID();

    const gameState: GameState = {
      gameId,
      players: new Map(),
      provinces: new Map(),
      armies: new Map(),
      battles: new Map(),
      status: 'waiting',
      tick: 0,
    };

    this.games.set(gameId, gameState);
    this.gameEngines.set(gameId, new GameEngine(gameState));

    return gameId;
  }

  private async joinGame(gameId: string, playerId: string, socket: Socket) {
    const gameState = this.games.get(gameId);
    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Create player state
    const playerState: PlayerState = {
      playerId,
      nation: await this.getPlayerNation(playerId),
      color: await this.getPlayerColor(playerId),
      resources: await this.getPlayerStartingResources(playerId),
      isOnline: true,
      lastPing: Date.now(),
    };

    gameState.players.set(playerId, playerState);
    gameState.status = gameState.players.size >= 2 ? 'playing' : 'waiting';

    // Join game room
    socket.join(`game:${gameId}`);
    socket.emit('game:joined', { gameState });

    // Broadcast to all players in game
    this.io.to(`game:${gameId}`).emit('player:joined', {
      playerId,
      nation: playerState.nation,
      color: playerState.color,
    });
  }

  private async moveArmy(armyId: string, destinationProvinceId: string, socket: Socket): Promise<void> {
    const gameState = this.games.get(socket.data.gameId);
    if (!gameState) return;

    const army = gameState.armies.get(armyId);
    if (!army) return;

    // Validate move (range, terrain, etc.)
    const validation = await this.validateMove(gameState, army, destinationProvinceId);
    if (!validation.valid) {
      socket.emit('error', { message: validation.error });
      return;
    }

    // Update army position
    army.position = validation.newPosition;
    army.isMoving = true;
    army.destination = destinationProvinceId;

    // Broadcast move to all players
    this.io.to(`game:${gameState.gameId}`).emit('army:moved', {
      armyId,
      newPosition: army.position,
      destination: army.destination,
      estimatedArrival: validation.estimatedArrival,
    });
  }

  private async startBattle(attackerArmyId: string, defenderProvinceId: string, socket: Socket): Promise<void> {
    const gameState = this.games.get(socket.data.gameId);
    if (!gameState) return;

    const attackerArmy = gameState.armies.get(attackerArmyId);
    if (!attackerArmy) return;

    // Create battle
    const battle: BattleState = {
      id: crypto.randomUUID(),
      provinceId: defenderProvinceId,
      attacker: attackerArmy,
      defender: await this.getDefender(gameState, defenderProvinceId),
      startTime: Date.now(),
      duration: await this.calculateBattleDuration(attackerArmy, defenderProvinceId),
      status: 'active',
      attackerCasualties: 0,
      defenderCasualties: 0,
    };

    gameState.battles.set(battle.id, battle);

    // Broadcast battle start
    this.io.to(`game:${gameState.gameId}`).emit('battle:start', {
      battle,
    });
  }

  private async reinforceBattle(battleId: string, unitType: string, quantity: number, socket: Socket): Promise<void> {
    const gameState = this.games.get(socket.data.gameId);
    if (!gameState) return;

    const battle = gameState.battles.get(battleId);
    if (!battle || battle.status !== 'active') return;

    // Add reinforcements to battle
    // (Implementation details...)

    // Broadcast reinforcement
    this.io.to(`game:${gameState.gameId}`).emit('battle:reinforced', {
      battleId,
      unitType,
      quantity,
    });
  }

  private async createAlliance(playerId1: string, playerId2: string, socket: Socket): Promise<void> {
    const gameState = this.games.get(socket.data.gameId);
    if (!gameState) return;

    // Create alliance
    const alliance: AllianceState = {
      id: crypto.randomUUID(),
      name: 'Alliance ' + Date.now(),
      players: [playerId1, playerId2],
      createdAt: Date.now(),
    };

    // Update player alliances
    const player1 = gameState.players.get(playerId1);
    const player2 = gameState.players.get(playerId2);
    if (player1) player1.alliance = alliance.id;
    if (player2) player2.alliance = alliance.id;

    // Save alliance to database
    await prisma.alliance.create({
      data: alliance,
    });

    // Broadcast alliance creation
    this.io.to(`game:${gameState.gameId}`).emit('diplomacy:alliance', {
      alliance,
    });
  }

  private async sendChatMessage(gameId: string, playerId: string, message: string, socket: Socket): Promise<void> {
    const gameState = this.games.get(gameId);
    if (!gameState) return;

    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      gameId,
      playerId,
      message,
      timestamp: Date.now(),
      type: 'global', // Can be 'alliance', 'private'
    };

    // Save message to database
    await prisma.chatMessage.create({
      data: chatMessage,
    });

    // Broadcast message
    this.io.to(`game:${gameId}`).emit('chat:message', {
      chatMessage,
    });
  }

  public async listen(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.io.listen(port, () => {
        console.log(`Game server listening on port ${port}`);
        resolve();
      });
    });
  }
}

export const gameServer = new GameServer();
```

### 6.4 Game Engine (Core Logic)

**Game Engine Class:**
```typescript
// lib/gameEngine.ts
import { PrismaClient } from '@prisma/client';

interface GameEngineConfig {
  tickRate: number; // 60 ticks per second
  gameState: GameState;
}

class GameEngine {
  private config: GameEngineConfig;
  private prisma: PrismaClient;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor(config: GameEngineConfig, prisma: PrismaClient) {
    this.config = config;
    this.prisma = prisma;
  }

  public async initialize(): Promise<void> {
    // Load game state from database
    const game = await this.prisma.game.findUnique({
      where: { id: this.config.gameState.gameId },
      include: {
        players: true,
        provinces: true,
        armies: true,
        battles: true,
      },
    });

    if (game) {
      this.config.gameState = {
        gameId: game.id,
        players: new Map(game.players.map(p => [p.id, p])),
        provinces: new Map(game.provinces.map(p => [p.id, p])),
        armies: new Map(game.armies.map(a => [a.id, a])),
        battles: new Map(game.battles.map(b => [b.id, b])),
        status: game.status,
        tick: 0,
      };
    }
  }

  public start(): void {
    if (this.tickInterval) return;

    // Start game loop (60 ticks per second)
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000 / this.config.tickRate);
  }

  public stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    this.config.gameState.tick++;

    // Update armies (movement, etc.)
    this.updateArmies();

    // Update battles (simulation)
    this.updateBattles();

    // Update resources (generation, consumption)
    this.updateResources();

    // Update provinces (ownership, bonuses)
    this.updateProvinces();

    // Save game state periodically (every 60 ticks = 1 second)
    if (this.config.gameState.tick % 60 === 0) {
      this.saveGameState();
    }
  }

  private updateArmies(): void {
    // Update moving armies
    for (const army of this.config.gameState.armies.values()) {
      if (army.isMoving && army.destination) {
        const province = this.config.gameState.provinces.get(army.destination);
        if (province) {
          // Calculate position based on province
          army.position = {
            x: province.coordinates.x,
            y: province.coordinates.y,
          };

          // Check if arrived
          const distance = this.calculateDistance(
            this.config.gameState.provinces.get(army.currentProvinceId)?.coordinates,
            province.coordinates
          );

          if (distance <= 0.1) {
            army.isMoving = false;
            army.currentProvinceId = army.destination;
            army.destination = null;
          }
        }
      }
    }
  }

  private updateBattles(): void {
    for (const battle of this.config.gameState.battles.values()) {
      if (battle.status !== 'active') continue;

      const elapsedTime = Date.now() - battle.startTime;
      const progress = elapsedTime / battle.duration;

      if (progress >= 1) {
        // Battle ended
        battle.status = 'completed';
        this.resolveBattle(battle);
      } else {
        // Calculate casualties based on progress
        const attackerStrength = this.calculateStrength(battle.attacker);
        const defenderStrength = this.calculateStrength(battle.defender);

        const damagePerSecond = (attackerStrength + defenderStrength) / battle.duration;

        battle.attackerCasualties = Math.min(
          battle.attacker.units.length,
          Math.floor((progress * damagePerSecond) / attackerStrength)
        );

        battle.defenderCasualties = Math.min(
          battle.defender.units.length,
          Math.floor((progress * damagePerSecond) / defenderStrength)
        );
      }
    }
  }

  private resolveBattle(battle: BattleState): void {
    // Determine winner
    const attackerStrength = this.calculateStrength(battle.attacker);
    const defenderStrength = this.calculateStrength(battle.defender);

    const winner = attackerStrength > defenderStrength ? 'attacker' : 'defender';

    // Update armies (remove casualties)
    battle.attacker.units = battle.attacker.units.filter((_, index) => index >= battle.attackerCasualties);
    battle.defender.units = battle.defender.units.filter((_, index) => index >= battle.defenderCasualties);

    // Update province ownership if attacker won
    if (winner === 'attacker') {
      const province = this.config.gameState.provinces.get(battle.provinceId);
      if (province) {
        province.ownerId = battle.attacker.playerId;
        province.capturedAt = Date.now();
      }
    }

    // Save battle result to database
    this.prisma.battle.update({
      where: { id: battle.id },
      data: {
        status: 'completed',
        winner,
        attackerCasualties: battle.attackerCasualties,
        defenderCasualties: battle.defenderCasualties,
        endedAt: new Date(),
      },
    });
  }

  private updateResources(): void {
    // Generate resources for each player
    for (const player of this.config.gameState.players.values()) {
      if (!player.isOnline) continue;

      player.resources.gold += player.goldRate;
      player.resources.iron += player.ironRate;
      player.resources.oil += player.oilRate;
      player.resources.food += player.foodRate;

      // Consume food for armies
      const totalFoodConsumption = player.armies.reduce((total, army) => {
        return total + army.units.length; // 1 food per unit per hour
      }, 0);

      player.resources.food -= totalFoodConsumption / 3600; // Per second (1 hour = 3600 seconds)
    }
  }

  private async saveGameState(): Promise<void> {
    // Save game state to database periodically
    const game = await this.prisma.game.update({
      where: { id: this.config.gameState.gameId },
      data: {
        currentPlayers: this.config.gameState.players.size,
        tick: this.config.gameState.tick,
        lastUpdated: new Date(),
      },
    });
  }
}
```

### 6.5 Data Access Layer (Prisma ORM + PostgreSQL)

**Prisma Schema:**
```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  username   String   @unique
  email      String?  @unique
  password   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  player    Player?
}

model Player {
  id        String   @id @default(cuid())
  userId    String
  nation    String
  color     String   // Hex color code
  goldRate  Float    @default(10.0) // Gold per hour
  ironRate  Float    @default(5.0) // Iron per hour
  oilRate   Float    @default(2.5) // Oil per hour
  foodRate  Float    @default(7.5) // Food per hour
  user      User     @relation(fields: [userId], references: [User], onDelete: Cascade)
  alliances Alliance[]
  armies    Army[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Game {
  id               String     @id @default(cuid())
  name             String
  mapId            String
  maxPlayers       Int
  currentPlayers   Int        @default(0)
  duration          Int         // Duration in seconds
  status           GameStatus @default(WAITING)
  createdById      String?
  players          Player[]
  provinces       Province[]
  armies          Army[]
  battles          Battle[]
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  lastTick         Int         @default(0)
  startedAt        DateTime?
  endedAt          DateTime?
}

model Province {
  id            String   @id @default(cuid())
  gameId        String
  name          String
  coordinates   Coordinates
  ownerId       String?
  goldBonus     Float    @default(0)
  ironBonus    Float    @default(0)
  oilBonus     Float    @default(0)
  foodBonus    Float    @default(0)
  defenseBonus Float    @default(0)
  units         Unit[]
  building      Building[]
  capturedAt    DateTime?
  game          Game     @relation(fields: [gameId], references: [Game])
}

model Building {
  id           String   @id @default(cuid())
  provinceId   String
  type         BuildingType
  level        Int       @default(1)
  isComplete   Boolean  @default(false)
  province     Province @relation(fields: [provinceId], references: [Province])
  game         Game     @relation(fields: [provinceId], references: [Game])
}

model Army {
  id            String   @id @default(cuid())
  playerId     String
  gameId        String
  name          String?
  units         Unit[]
  position      Position
  isMoving      Boolean  @default(false)
  destination   String?  // Province ID
  currentProvinceId String
  player        Player   @relation(fields: [playerId], references: [Player])
  game          Game     @relation(fields: [gameId], references: [Game])
}

model Unit {
  id          String   @id @default(cuid())
  armyId      String
  type         UnitType
  quantity    Int
  strength    Int       @default(1)
  army        Army     @relation(fields: [armyId], references: [Army])
}

model Battle {
  id                    String        @id @default(cuid())
  gameId               String
  provinceId           String
  attackerArmyId       String
  defender             DefenderInfo?
  startTime            DateTime
  duration             Int           // Duration in seconds
  status               BattleStatus @default(PENDING)
  attackerCasualties   Int           @default(0)
  defenderCasualties   Int           @default(0)
  winner               String?
  attackerArmy        Army          @relation(fields: [attackerArmyId], references: [Army])
  game                 Game          @relation(fields: [gameId], references: [Game])
}

model Alliance {
  id            String   @id @default(cuid())
  name          String
  players       String[] // Player IDs
  createdAt     DateTime @default(now())
  playersMap   Player[] @relation("AlliancePlayers")
}

model ChatMessage {
  id          String   @id @default(cuid())
  gameId      String
  playerId    String
  message     String
  type        ChatType
  createdAt  DateTime @default(now())
  player      Player   @relation(fields: [playerId], references: [Player])
  game        Game     @relation(fields: [gameId], references: [Game])
}

enum GameStatus {
  WAITING
  PLAYING
  PAUSED
  ENDED
}

enum BattleStatus {
  PENDING
  ACTIVE
  COMPLETED
}

enum UnitType {
  INFANTRY_SOLDADO_RASO
  INFANTRY_SUBOFICIAL
  INFANTRY_COMANDANTE
  VEHICLE_TANQUE_LIGERO
  VEHICLE_TANQUE_MEDIO
  VEHICLE_TANQUE_PESADO
  VEHICLE_ARTILLERIA
  AIRCRAFT_CAZA
  AIRCRAFT_BOMBARDERO
  AIRCRAFT_TRANSPORTE
  NAVAL_DESTRUCTOR
  NAVAL_CRUCERO
  NAVAL_ACORAZADO
  NAVAL_PORTAAVIONES
}

enum BuildingType {
  MINE_GOLD
  MINE_IRON
  MINE_OIL
  FARM
  BARRACKS
  FACTORY
  AIRBASE
  PORT
  LABORATORY
}

enum ChatType {
  GLOBAL
  ALLIANCE
  PRIVATE
}
```

### 6.6 Cache Layer (Redis)

**Redis Usage:**
```typescript
// lib/cache.ts
import { Redis } from 'ioredis';
import { GameEngine } from './gameEngine';

export class CacheManager {
  private redis: Redis;
  private gameEngines: Map<string, GameEngine> = new Map();

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Game State Cache (per game)
  public async getGameState(gameId: string): Promise<GameState | null> {
    const cached = await this.redis.get(`game:${gameId}:state`);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  public async setGameState(gameId: string, state: GameState): Promise<void> {
    await this.redis.set(
      `game:${gameId}:state`,
      JSON.stringify(state),
      'EX', 60 * 5 // 5 minutes TTL
    );
  }

  // Player Session Cache
  public async getPlayerSession(playerId: string): Promise<PlayerState | null> {
    const cached = await this.redis.get(`player:${playerId}:session`);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  public async setPlayerSession(playerId: string, session: PlayerState): Promise<void> {
    await this.redis.set(
      `player:${playerId}:session`,
      JSON.stringify(session),
      'EX', 60 * 60 // 60 minutes TTL
    );
  }

  // Map Data Cache (provinces)
  public async getMapData(gameId: string): Promise<Map<string, Province> | null> {
    const cached = await this.redis.get(`map:${gameId}:provinces`);
    if (!cached) return null;
    return new Map(JSON.parse(cached));
  }

  public async setMapData(gameId: string, map: Map<string, Province>): Promise<void> {
    await this.redis.set(
      `map:${gameId}:provinces`,
      JSON.stringify(Array.from(map.entries())),
      'EX', 60 * 10 // 10 minutes TTL
    );
  }

  // Invalidate all caches for a game
  public async invalidateGameCaches(gameId: string): Promise<void> {
    const keys = [
      `game:${gameId}:state`,
      `game:${gameId}:map`,
    ];

    for (const key of keys) {
      await this.redis.del(key);
    }

    // Get all player sessions for this game
    const gameState = await this.getGameState(gameId);
    if (gameState) {
      for (const playerId of gameState.players.keys()) {
        await this.redis.del(`player:${playerId}:session`);
      }
    }
  }

  // Leaderboard Cache (top 10 players)
  public async getLeaderboard(gameId: string): Promise<PlayerState[] | null> {
    const cached = await this.redis.get(`game:${gameId}:leaderboard`);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  public async setLeaderboard(gameId: string, leaderboard: PlayerState[]): Promise<void> {
    await this.redis.set(
      `game:${gameId}:leaderboard`,
      JSON.stringify(leaderboard),
      'EX', 60 * 5 // 5 minutes TTL
    );
  }
}

export const cacheManager = new CacheManager(redisClient);
```

---

## 7. ARQUITECTURA DE BASE DE DATOS

### 7.1 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│                     💾 POSTGRESQL DATABASE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  USERS TABLE                                          │   │
│  │  ├── id (PK)                                         │   │
│  │  ├── username                                         │   │
│  │  ├── email                                            │   │
│  │  ├── password                                         │   │
│  │  └── player_id (FK)                                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                         ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  PLAYERS TABLE                                        │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── user_id (FK)                                    │   │
│  │  ├── nation                                           │   │
│  │  ├── color                                            │   │
│  │  ├── gold_rate                                        │   │
│  │  ├── iron_rate                                        │   │
│  │  ├── oil_rate                                         │   │
│  │  ├── food_rate                                        │   │
│  │  ├── alliances[] (1:N)                                │   │
│  │  ├── armies[] (1:N)                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  GAMES TABLE                                          │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── name                                             │   │
│  │  ├── map_id                                           │   │
│  │  ├── max_players                                       │   │
│  │  ├── current_players                                   │   │
│  │  ├── duration                                          │   │
│  │  ├── status                                           │   │
│  │  ├── created_by_id (FK)                                │   │
│  │  ├── players[] (1:N)                                  │   │
│  │  ├── provinces[] (1:N)                                │   │
│  │  ├── armies[] (1:N)                                  │   │
│  │  ├── battles[] (1:N)                                  │   │
│  │  ├── last_tick                                         │   │
│  │  ├── started_at                                        │   │
│  │  └── ended_at                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  PROVINCES TABLE                                     │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── game_id (FK)                                    │   │
│  │  ├── name                                             │   │
│  │  ├── coordinates                                       │   │
│  │  ├── owner_id (FK)                                    │   │
│  │  ├── gold_bonus                                       │   │
│  │  ├── iron_bonus                                       │   │
│  │  ├── oil_bonus                                        │   │
│  │  ├── food_bonus                                       │   │
│  │  ├── defense_bonus                                    │   │
│  │  ├── units[] (1:N)                                   │   │
│  │  ├── building[] (1:N)                                 │   │
│  │  └── captured_at                                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ARMIES TABLE                                         │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── player_id (FK)                                    │   │
│  │  ├── game_id (FK)                                     │   │
│  │  ├── name                                             │   │
│  │  ├── position                                         │   │
│  │  ├── is_moving                                         │   │
│  │  ├── destination_province_id (FK)                        │   │
│  │  ├── current_province_id (FK)                          │   │
│  │  └── units[] (1:N)                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  UNITS TABLE                                         │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── army_id (FK)                                     │   │
│  │  ├── type                                             │   │
│  │  ├── quantity                                         │   │
│  │  └── strength                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  BATTLES TABLE                                       │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── game_id (FK)                                     │   │
│  │  ├── province_id (FK)                                  │   │
│  │  ├── attacker_army_id (FK)                           │   │
│  │  ├── defender (JSON)                                  │   │
│  │  ├── start_time                                       │   │
│  │  ├── duration                                          │   │
│  │  ├── status                                           │   │
│  │  ├── attacker_casualties                              │   │
│  │  ├── defender_casualties                              │   │
│  │  ├── winner                                           │   │
│  │  └── attacker_army (FK)                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ALLIANCES TABLE                                     │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── name                                             │   │
│  │  ├── players[] (player IDs)                            │   │
│  │  └── created_at                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  CHAT_MESSAGES TABLE                                 │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── game_id (FK)                                     │   │
│  │  ├── player_id (FK)                                    │   │
│  │  ├── message                                          │   │
│  │  ├── type                                             │   │
│  │  └── created_at                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  BUILDINGS TABLE                                     │   │
│  │  ├── id (PK)                                          │   │
│  │  ├── province_id (FK)                                  │   │
│  │  ├── type                                             │   │
│  │  ├── level                                            │   │
│  │  ├── is_complete                                       │   │
│  │  └── game_id (FK)                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Índices de Base de Datos

**Índices para Performance:**
```sql
-- Users Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Players Indexes
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_alliances ON players USING GIN(to_array(alliances));

-- Games Indexes
CREATE INDEX idx_games_created_by ON users(created_by_id);
CREATE INDEX idx_games_status ON games(status);

-- Provinces Indexes
CREATE INDEX idx_provinces_game_id ON provinces(game_id);
CREATE INDEX idx_provinces_owner_id ON provinces(owner_id);
CREATE INDEX idx_provinces_location ON provinces(coordinates);

-- Armies Indexes
CREATE INDEX idx_armies_player_id ON armies(player_id);
CREATE INDEX idx_armies_game_id ON armies(game_id);
CREATE INDEX idx_armies_position ON armies(position);

-- Battles Indexes
CREATE INDEX idx_battles_game_id ON battles(game_id);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_province_id ON battles(province_id);

-- Chat Messages Indexes
CREATE INDEX idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX idx_chat_messages_type ON chat_messages(type);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Buildings Indexes
CREATE INDEX idx_buildings_province_id ON buildings(province_id);
CREATE INDEX idx_buildings_type ON buildings(type);
CREATE INDEX idx_buildings_is_complete ON buildings(is_complete);
```

---

## 8. UI/UX WIREFRAMES Y PROTOTIPOS

### 8.1 Wireframes Principales

**1. Pantalla de Login/Registro**
```
┌─────────────────────────────────────────────────────────────────┐
│                     WORLD CONFLICT 1945                   │
│                   [ Logo en 3D ]                          │
├─────────────────────────────────────────────────────────────────┤
│  Login                                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Usuario: [___________________]                  │   │
│  │ Contraseña: [___________________]                  │   │
│  │                                               │   │
│  │  [  Iniciar Sesión  ]                        │   │
│  │                                               │   │
│  │  ¿Olvidaste tu contraseña? [Recuperar]         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  O:  Crear cuenta                          │   │
│  │                                               │   │
│  │  Usuario: [___________________]                  │   │
│  │  Email:   [___________________]                  │   │
│  │  Contraseña: [___________________]                  │   │
│  │  Nación:  [ Dropdown: USA, Alemania, etc. ]   │   │
│  │  Color:    [ Palette: 16 colores ]          │   │
│  │                                               │   │
│  │  [  Crear Cuenta  ]                          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  O: Continuar como invitado                   │   │
│  │                                               │   │
│  │  Código de invitación: [____________]         │   │
│  │                                               │   │
│  │  [  Continuar  ]                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  [  Términos y Condiciones ]      [  Privacidad ]     │
└─────────────────────────────────────────────────────────────────┘
```

**2. Pantalla Principal (Game Main View)**
```
┌─────────────────────────────────────────────────────────────────┐
│    💰 1,234    ⚙️ 567    🛢️ 123    🌾 750   │ ← Resources
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────┐ ┌────────────────┐│
│  │         🗺️ MAPA 3D           │ │   🏛️   HUD   ││
│  │                                │ │              ││
│  │  [Provincias con colores por     │ │  ┌─────────┐│
│  │   dueño]                          │ │  │ Chat    ││
│  │                                │ │  │ Global   ││
│  │  [Unidades animadas              │ │  │ Alliance ││
│  │   y ejércitos]                    │ │  │ Private  ││
│  │                                │ │  │───────────┘│
│  │                                │ │               ││
│  │  [Indicador de conexión verde] │ │  [Diplomacia│
│  │                                │ │   Alliance]   ││
│  │                                │ │              ││
│  │  [Minimapa isométrico      │ │ │  [Diálogos ││
│  │   con flechas]                   │ │  │ Player   ││
│  │                                │ │ │  │───────────┘│
│  │                                │ │ │  [Botones:  ││
│  │  [Zonas de control (zoom, pan,  │ │    Aliarse  ││
│  │   seleccionar provincia)]            │ │   Pacto N-A ││
│  │                                │ │              ││
│  │                                │ │  [Notificaciones││
│  │                                │ │   de batalla]││
│  └──────────────────────────────────────┘ └────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**3. Panel de Construcción (Building Panel)**
```
┌─────────────────────────────────────────────────────────────────┐
│  PROVINCIA: Berlín (Capital de Alemania)             │
│  Dueño: Jugador (Tú)                               │
│  Coordenadas: X: 5, Y: 10                         │
│  Recursos Bonos: Oro +10%, Hierro +0%               │
│  Defensa: +15%                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  🏗️ CONSTRUIR (Espacios: 5/5)                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 💰 Mina de Oro (Nivel 1-5)               │   │
│  │    Costo: 100-500 Oro               │   │
│  │    Producción: +50 Oro/hora           │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ ⚙️ Mina de Hierro (Nivel 1-5)            │   │
│  │    Costo: 80-400 Hierro              │   │
│  │    Producción: +25 Hierro/hora          │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🛢️ Pozo de Petróleo (Nivel 1-5)         │   │
│  │    Costo: 60-300 Petróleo            │   │
│  │    Producción: +15 Petróleo/hora          │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🌾 Granja (Nivel 1-5)                     │   │
│  │    Costo: 70-350 Comida               │   │
│  │    Producción: +40 Comida/hora          │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🏛️ Cuarteles (Nivel 1-5)                  │   │
│  │    Costo: 200-1000 Oro               │   │
│  │    Capacidad: +10 unidades          │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🏭️ Fábrica (Nivel 1-5)                   │   │
│  │    Costo: 300-1500 Oro               │   │
│  │    Producción: Tanques, Artillería      │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ ✈️ Base Aérea (Nivel 1-5)                │   │
│  │    Costo: 400-2000 Oro               │   │
│  │    Producción: Cazas, Bombarderos     │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🚢 Puerto (Nivel 1-5)                      │   │
│  │    Costo: 500-2500 Oro               │   │
│  │    Producción: Barcos, Submarinos       │   │
│  │    [ Nivel 1 ] [ Nivel 2 ] ... [ Nivel 5 ]│   │
│  │    [  Contruir  ]                           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  💰 Oro disponible: 1,234                              │
│  Tiempo de construcción: 1-12 horas                   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  [  Cancelar  ]    [  Confirmar  ]        │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**4. Vista de Batalla (Battle View)**
```
┌─────────────────────────────────────────────────────────────────┐
│  BATALLA: Berlín vs Varsovia                    │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  ⏱️ Tiempo restante: 14:23                       │
│  Progress bar: [▓▓▓▓▓░░░░░░░░░░░░] 70%              │
│                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🎬 VISUALIZACIÓN TÁCTICA ISOMÉTRICA       │   │
│  │                                              │   │
│  │  [Provincia en vista 3D isométrica] │   │
│  │  [Terreno: Urbano, edificios]        │   │
│  │  [Unidades: Soldados azules vs rojos] │   │
│  │  [Animaciones de combate, explosiones]  │   │
│  │  [Efectos de partículas: humo, sangre] │   │
│  │                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                           │
│  📊 ESTADÍSTICAS DE LA BATALLA                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Atacante (Alemania):                           │   │
│  │  - Unidades: 500 → 420 (-80 bajas)      │   │
│  │  - Moral: 85% (Alta)                     │   │
│  │  - Fuerza: 15,000                        │   │
│  │                                              │   │
│  │ Defensor (Polonia):                            │   │
│  │  - Unidades: 300 → 150 (-150 bajas)    │   │
│  │  - Moral: 65% (Media)                     │   │
│  │  - Fuerza: 8,000 (Defensa bonus +15%)  │   │
│  │                                              │   │
│  │ Ventaja actual: Atacante                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ⚔️ ACCIONES                                    │
│  ┌────────────────────────────────────────────────────┐   │
│  │  [ Enviar refuerzos ]                        │   │
│  │    - Infantería: 50 unidades (Costo: 200)   │   │
│  │    - Tanques ligeros: 20 (Costo: 500)    │   │
│  │    - Artillería: 5 (Costo: 400)           │   │
│  │                                              │   │
│  │  [ Retirar ] (Si estás perdiendo)           │   │
│  │    - Perderás el 50% de tropas restantes  │   │
│  │    - Regresarás a provincia anterior    │   │
│  │                                              │   │
│  │  [ Ver historial de batalla ]                │   │
│  │                                              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  💬 CHAT DE LA BATALLA                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │ General: "¡Vamos por ellos!"                 │   │
│  │ General: "¡Defendamos el norte!"         │   │
│  │ Soldado: "Malditos, mueren rápido..."      │   │
│  │                                              │   │
│  │  [Mensaje: ____________________]           │   │
│  │  [  Enviar  ]                                │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**5. Panel de Diplomacia**
```
┌─────────────────────────────────────────────────────────────────┐
│  🤝 DIPLOMACIA                                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │  MI NACIÓN (Alemania)                        │   │
│  │  ─────────────────────────────────────┐        │   │
│  │  💰 Oro: 1,234                              │   │
│  │  ⚙️ Hierro: 567                               │   │
│  │  🛢️ Petróleo: 123                             │   │
│  │  🌾 Comida: 750                               │   │
│  │  └────────────────────────────────────┘        │   │
│  │                                              │   │
│  │  🌐 JUGADORES EN EL MAPA: 48/50           │   │
│  │  ┌────────────────────────────────────────────┐   │
│  │  │  💀 Tú (Jugador actual)                  │   │
│  │  │  💚 Jugador 2 (Francia)    │   │
│  │  │  💚 Jugador 3 (Reino Unido)    │   │
│  │  │  ...                                   │   │
│  │  └────────────────────────────────────┘        │   │
│  │                                              │   │
│  │  🎖️ JUGADORES ONLINE: 45/50                │   │
│  │                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  MI ALIANZA                                    │   │
│  │  ─────────────────────────────────────┐        │   │
│  │  Nombre: "Alianza Eje 1941"             │   │
│  │  Miembros: [Tú, Jugador 3] (2/50)   │   │
│  │  Reputación: 100                              │   │
│  │  Estado: Precio de guerra con Jugador 2 │   │
│  │  └────────────────────────────────────┘        │   │
│  │                                              │   │
│  │  [  Disolver alianza  ]  [  Expulsar ]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                           │
│  💬 CHAT DE ALIANZA                               │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Tú: "¡Vamos a conquistar el oeste!"  │   │
│  │  Jugador 3: "Yo me ocupo el norte."    │   │
│  │  Jugador 3: "De acuerdo, divídete el sur."│   │
│  │                                              │   │
│  │  [Mensaje: ____________________]           │   │
│  │  [  Enviar  ]                                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  OTROS JUGADORES                              │   │
│  │  ┌────────────────────────────────────────┐   │
│  │  │ 💀 Jugador 5 (Rusia)    │   │
│  │  │   - Reputación: 95               │   │
│  │  │   - Alianza: "Pacto Varsovia"      │   │
│  │  │   - Relación: Neutral             │   │
│  │  │   - Estado: Precio de guerra        │   │
│  │  │   [  Proposer alianza  ]           │   │
│  │  │   [  Pacto de no agresión ]         │   │
│  │  │   [  Declarar guerra ]                 │   │
│  │  │   [  Ofrecer paz ]                    │   │
│  │  └────────────────────────────────────┘        │   │
│  │  ... (Jugadores 6-50)                    │   │
│  │                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                           │
│  [  Volver al Mapa  ]                            │   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Componentes de UI Principales

**1. ResourceCard Component**
```typescript
// components/ui/ResourceCard.tsx
'use client';

interface ResourceCardProps {
  icon: string;
  name: string;
  amount: number;
  rate: string;
  isLow?: boolean;
  onClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  icon,
  name,
  amount,
  rate,
  isLow = false,
  onClick
}) => {
  return (
    <div
      className={`resource-card ${isLow ? 'resource-low' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="resource-icon">{icon}</div>
      <div className="resource-details">
        <span className="resource-name">{name}</span>
        <span className={`resource-amount ${isLow ? 'warning' : ''}`}>
          {amount.toLocaleString()}
        </span>
        <span className="resource-rate">{rate}</span>
      </div>
      {isLow && (
        <div className="resource-warning">
          ⚠️ Recursos críticos
        </div>
      )}
    </div>
  );
};
```

**2. ProvinceComponent**
```typescript
// components/map/ProvinceComponent.tsx
'use client';

import { useGameStore } from '@/stores/gameStore';

interface ProvinceComponentProps {
  province: Province;
  isSelected?: boolean;
}

export const ProvinceComponent: React.FC<ProvinceComponentProps> = ({
  province,
  isSelected = false
}) => {
  const { playerNation } = useGameStore();
  const isOwned = province.ownerId === playerNation;

  return (
    <div
      className={`province ${isSelected ? 'selected' : ''} ${isOwned ? 'owned' : 'enemy'}`}
      style={{
        left: `${province.coordinates.x * 100}px`,
        top: `${province.coordinates.y * 60}px`,
        width: '100px',
        height: '60px',
        borderColor: isOwned ? '#DAA520' : '#CD5C5C',
        backgroundColor: isOwned ? '#4A5D4F33' : '#70809033',
      }}
      onClick={() => handleProvinceClick(province.id)}
    >
      <div className="province-icon">
        {province.buildings.length > 0 && '🏗️'}
        {province.units.length > 0 && '⚔️'}
      </div>
      {isSelected && (
        <div className="province-details">
          <div>{province.name}</div>
          <div>Dueño: {province.ownerName || 'Ninguno'}</div>
          <div>Recursos: {province.resources.join(', ')}</div>
        </div>
      )}
    </div>
  );
};
```

**3. ChatComponent**
```typescript
// components/chat/ChatComponent.tsx
'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import socket from '@/lib/socket';

interface ChatComponentProps {
  gameId: string;
  type: 'global' | 'alliance' | 'private';
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ gameId, type }) => {
  const { username } = useGameStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Initialize socket listener for chat messages
    const handleChatMessage = (data: { message: ChatMessage }) => {
      setMessages((prev) => [...prev, data.message]);
    };

    socket.on('chat:message', handleChatMessage);

    // Load message history
    loadChatHistory();

    return () => {
      socket.off('chat:message', handleChatMessage);
    };
  }, [gameId, type]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      gameId,
      playerId: username,
      message: newMessage,
      type,
      timestamp: Date.now(),
    };

    // Send message via socket
    socket.emit('chat:send', { chatMessage });

    // Add to local state
    setMessages((prev) => [...prev, chatMessage]);
    setNewMessage('');
  };

  const loadChatHistory = async () => {
    // Load last 50 messages from API
    const response = await fetch(`/api/chat/history?gameId=${gameId}&type=${type}`);
    const data = await response.json();
    setMessages(data.messages);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.playerId === username ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <span className="player-name">{message.playerName}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.message}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};
```

**4. ArmyList Component**
```typescript
// components/army/ArmyList.tsx
'use client';

import { useGameStore } from '@/stores/gameStore';

export const ArmyList: React.FC = () => {
  const { armies } = useGameStore();

  return (
    <div className="army-list">
      <div className="army-header">
        <span>Ejércitos ({armies.length})</span>
        <button className="btn-create-army">+ Crear Ejército</button>
      </div>

      {armies.map((army) => (
        <div key={army.id} className="army-item">
          <div className="army-icon">⚔️</div>
          <div className="army-details">
            <div className="army-name">{army.name || `Ejército ${army.id.slice(0, 4)}`}</div>
            <div className="army-units">
              {army.units.length} unidades
            </div>
            <div className="army-location">
              {army.currentProvinceName || 'En movimiento'}
            </div>
          </div>
          <div className="army-actions">
            <button onClick={() => handleSelectArmy(army.id)}>
              Seleccionar
            </button>
            <button onClick={() => handleMoveArmy(army.id)}>
              Mover
            </button>
            <button onClick={() => handleDisbandArmy(army.id)}>
              Disolver
            </button>
          </div>
        </div>
      ))}

      <div className="army-summary">
        <div>Unidades totales: {armies.reduce((total, army) => total + army.units.length, 0)}</div>
        <div>Fuerza total: {armies.reduce((total, army) => total + calculateStrength(army), 0).toLocaleString()}</div>
      </div>
    </div>
  );
};
```

---

## 9. SCHEMA DE BASE DE DATOS COMPLETO

(Ver sección 6.5 para el schema completo de Prisma)

---

## 10. ARQUITECTURA DE INFRAESTRUCTURA

### 10.1 Diagrama de Infraestructura

```
┌─────────────────────────────────────────────────────────────────────┐
│                  🌐 CLOUD PROVIDER (AWS/GCP)              │
│  ┌────────────────────┐   ┌──────────────────────┐   │
│  │   FRONTEND      │   │    BACKEND           │   │
│  │   (Vercel)      │   │    (AWS/GCP)         │   │
│  └────────────────────┘   └──────────────────────┘   │
│                            ↓                ↓              │
│              ┌───────────────────────┐                  │
│              │   LOAD BALANCER   │                  │
│              │   (AWS ALB/NGINX)│                  │
│              └───────────────────────┘                  │
│                            ↓                              │
│              ┌───────────────────────┐                  │
│              │   DNS (Route 53)  │                  │
│              │   Cloudflare (CDN) │                  │
│              └───────────────────────┘                  │
│                            ↓                              │
│              ┌───────────────────────┐                  │
│              │   GAME SERVER     │                  │
│              │   (Multiple ECS  │                  │
│              │    instances)      │                  │
│              └───────────────────────┘                  │
│                            ↓                              │
│              ┌───────────────────────┐                  │
│              │   DATABASE (RDS)    │                  │
│              │   PostgreSQL       │                  │
│              │   Multi-AZ         │                  │
│              └───────────────────────┘                  │
│                            ↓                              │
│              ┌───────────────────────┐                  │
│              │   REDIS (ElastiCache)              │
│              │   Session cache    │                  │
│              │   Game state cache│                  │
│              └───────────────────────┘                  │
│                            ↓                              │
│              ┌───────────────────────┐                  │
│              │   MONITORING       │                  │
│              │   Sentry (Errors)  │                  │
│              │   Datadog (Metrics)│                  │
│              │   CloudWatch (AWS)  │                  │
│              └───────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Configuración de Entornos

**Desarrollo:**
- Frontend: Vercel (staging)
- Backend: AWS (dev instances)
- Database: AWS RDS Dev (Multi-AZ)
- Redis: AWS ElastiCache (Redis)

**Producción (MVP):**
- Frontend: Vercel (production)
- Backend: AWS (ECS with auto-scaling)
- Database: AWS RDS Prod (Multi-AZ with read replicas)
- Redis: AWS ElastiCache Prod (Redis cluster)
- Load Balancer: AWS Application Load Balancer
- CDN: Cloudflare (static assets)

---

## 11. TECHNICAL DESIGN DOCUMENT (TDD)

(Ver todo el contenido de la Fase 3 hasta aquí)

---

## 12. DESARROLLO DEL MVP - 12 FEATURES P0

### 12.1 Features del MVP

**P0-1: Modern UI & Tutorial**
- UI moderna e intuitiva inspirada en juegos modernos
- Tutorial interactivo de 15 minutos
- Progressive disclosure de features
- Responsive design (mobile-optimized)

**P0-2: Fair Offline Protection**
- Modo "Sleep Mode" hasta 8 horas por día
- Defensa bonus cuando offline
- Notificaciones antes de expirar protección
- Retirada automática si es imposible defender

**P0-3: Core Gameplay Loop**
- Login → Check → Decide → Act → Observe → Repeat
- Sistema de turnos simplificado (tiempo real)
- Actualización del mundo en tiempo real

**P0-4: 4 Resources System**
- Oro (💰): Generado por impuestos y minas
- Hierro (⚙️): Generado por minas (limitado)
- Petróleo (🛢️): Generado por pozos (limitado)
- Comida (🌾): Generado por granjas

**P0-5: Territory Conquest**
- Sistema de conquista de provincias
- Mapa con 100-200 provincias
- Sistema de dueños de territorios
- Sistema de colores por dueño

**P0-6: Diplomacy & Alliances**
- Sistema de alianzas (máx. 4 jugadores por alianza)
- Pactos de no agresión (24h, 48h, 72h)
- Sistema de reputación
- Comercio de recursos entre jugadores

**P0-7: Real-time Battles**
- Sistema de batallas tácticas
- Visualización en tiempo real
- Sistema de refuerzos durante batalla
- Cálculo de bajas en tiempo real
- Sistema de determinación de ganador

**P0-8: 7-Day Campaign (MVP)**
- Duración de campaña: 7 días para MVP (validación)
- Condición de victoria: Dominio territorial (60% del mapa)
- Sistema de inicio y fin de campaña

**P0-9: 30-Day Campaign (Full)**
- Duración de campaña: 30 días (estándar para launch)
- Condición de victoria: Dominio territorial (60% del mapa)
- Sistema de rankings por temporada

**P0-10: Fair F2P Monetization**
- Sistema de 3 monedas (Oro Blanco, Oro Negro, Diamantes)
- Pricing packs ($2.99 - $59.99)
- Time skips (1h: 10 oro, 24h: 150 oro)
- Límite de gasto diario ($30 max)

**P0-11: Battle Pass ($9.99/mo)**
- Battle Pass mensual con 90 niveles
- Recompensas: Oro Negro, Diamantes, Cosmetics exclusivos
- Precios competitivos ($9.99 vs $50+ de otros juegos)

**P0-12: Basic Chat System**
- Chat global
- Chat de alianza
- Chat privado (1-a-1)
- Sistema de emojis básico
- Historial de mensajes

### 12.2 Plan de Desarrollo de Features

**Semana 1-2: Diseño y Arquitectura**
- Technical Design Document completo
- Database Schema completo
- UI/UX Wireframes y Prototipos
- Setup del proyecto técnico

**Semana 3-4: Backend Core**
- Setup backend (Bun + Next.js)
- Implementar Socket.IO server
- Implementar Game Engine básico
- Implementar 4 resources system
- Implementar Province System

**Semana 5-6: Backend Game Logic**
- Implementar Army System
- Implementar Battle System
- Implementar Diplomacy System
- Implementar Chat System
- Implementar API Routes

**Semana 7-8: Frontend Core**
- Setup frontend (Next.js 15)
- Implementar Map Component (Three.js)
- Implementar UI Components
- Implementar State Management (Zustand)
- Implementar Real-time Layer (Socket.IO-client)

**Semana 9-10: Integración y Testing**
- Integrar frontend con backend
- Implementar 12 features P0
- Pruebas unitarias
- Pruebas de integración
- Performance testing

**Semana 11-12: Deployment y Validación**
- Deploy a staging
- Beta testing con usuarios reales (100-500)
- Bug fixes y optimizaciones
- Deploy a producción
- Recolección de feedback

---

## 13. TESTING Y VALIDACIÓN

### 13.1 Plan de Testing

**Tipos de Testing:**

**1. Unit Testing (Automatizado)**
- Objetivo: Verificar que cada función individual trabaja correctamente
- Herramientas: Jest + React Testing Library
- Cobertura: >80% de código

**2. Integration Testing (Automatizado)**
- Objetivo: Verificar que los componentes trabajan juntos
- Herramientas: Jest + Supertest
- Testing de integración frontend-backend

**3. E2E Testing (Manual)**
- Objetivo: Verificar que el flujo completo funciona para usuarios
- Casos de prueba:
  - Registro y login
  - Crear juego y unirse
  - Mover ejércitos
  - Atacar provincia
  - Iniciar batalla
  - Enviar chat messages
  - Crear alianza
- Herramientas: Playwright o Cypress

**4. Performance Testing (Automatizado)**
- Objetivo: Verificar que el sistema soporta la carga esperada
- Escenarios:
  - 20 jugadores simultáneos
  - 50 jugadores simultáneos
  - 100 jugadores simultáneos
- Métricas: FPS, Latencia, Response Time
- Herramientas: k6, Artillery

**5. Load Testing (Automatizado)**
- Objetivo: Verificar que el sistema escala correctamente
- Escenarios:
  - 200 jugadores simultáneos
  - 500 jugadores simultáneos
  - 1000 jugadores simultáneos
- Métricas: Server CPU/Memory, DB queries/seg
- Herramientas: Locust, k6

### 13.2 Criterios de Éxito del MVP

**Técnicos:**
- ✅ 60 FPS en desktop, 30 FPS en mobile
- ✅ Latencia <100ms para 95% de conexiones
- ✅ Uptime 99%+ durante beta testing
- ✅ Soporta 20-50 jugadores por partida
- ✅ No crashes durante 72h de testing continuo

**De Negocio:**
- ✅ 100-500 usuarios beta completan sin crash
- ✅ 50%+ de usuarios regresan para segunda sesión
- ✅ Sistema de recursos funciona sin bugs críticos
- ✅ Sistema de batallas funciona con lógica justa

**De Usuario:**
- ✅ Tutorial completado en 15 minutos por 90%+ de usuarios
- ✅ UI calificada como "moderna" por 80%+ de usuarios
- ✅ Juegabilidad calificada como "divertida" por 70%+ de usuarios

---

## 14. DEPLOYMENT Y OPERATIONS

### 14.1 Estrategia de Deployment

**Fase 1: Staging (1 semana antes de beta)**
1. Deploy a AWS ECS con auto-scaling
2. Deploy a Vercel (frontend)
3. Configurar Cloudflare CDN
4. Setup de dominios y SSL
5. Configurar DNS (Route 53)
6. Performance tuning

**Fase 2: Beta (1-2 semanas)**
1. Deploy a producción con feature flags
2. Monitoreo 24/7 con Sentry + Datadog
3. Capacity planning (escalar según demanda)
4. Backup schedule (daily backups a S3)
5. Disaster recovery plan (RTO < 1 hora)

**Fase 3: Post-Launch (continuo)**
1. A/B testing de features
2. Optimización continua
3. Escalado proactivo
4. Incident response plan

### 14.2 Configuración de Monitoring

**Herramientas:**
- **Error Tracking:** Sentry (catches, crashes)
- **Performance Monitoring:** Datadog (APM, RUM)
- **Infrastructure Monitoring:** CloudWatch (CPU, memory, requests)
- **Uptime Monitoring:** Pingdom (uptime)
- **Log Aggregation:** CloudWatch Logs (centralizado)

**Alertas Configuradas:**
- Error rate > 1% → Email + Pager
- Response time > 500ms → Email
- Server CPU > 80% → Auto-scale
- Memory > 80% → Auto-scale
- Uptime < 99.9% → Pager

### 14.3 CI/CD Pipeline

**Pipeline (GitHub Actions):**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      - name: Install dependencies
        run: bun install
      - name: Run tests
        run: bun test
      - name: Build
        run: bun run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}}
          vercel-args: '--prod'
```

---

## 15. DOCUMENTACIÓN TÉCNICA

### 15.1 Documentos a Crear

**1. API Documentation**
- OpenAPI/Swagger specs
- Endpoint documentation
- Request/Response schemas
- Authentication docs
- Error codes and responses

**2. Database Documentation**
- ERD (Entity Relationship Diagram)
- Schema documentation (Prisma schema)
- Migration guide
- Query optimization guide

**3. Architecture Documentation**
- System architecture diagrams
- Component diagrams
- Data flow diagrams
- Deployment architecture

**4. Development Guide**
- Setup guide para developers
- Code conventions
- Git workflow
- Environment variables documentation

**5. Operations Manual**
- Monitoring guide
- Incident response procedures
- Backup and recovery procedures
- Scaling policies

---

## 16. QUALITY ASSURANCE

### 16.1 QA Process

**Testing Phases:**

**Fase 1: Unit Testing (Semanas 1-10)**
- Test coverage: >80%
- Automatizado con Jest
- Ejecución en cada commit

**Fase 2: Integration Testing (Semanas 7-9)**
- Tests de integración frontend-backend
- Tests de integración frontend-frontend
- Ejecución en cada PR

**Fase 3: E2E Testing (Semana 11)**
- Manual testing de user flows
- Cross-browser testing
- Mobile testing

**Fase 4: Performance Testing (Semana 11)**
- Load testing con k6
- Stress testing con Artillery
- Memory leak testing

**Fase 5: Security Testing (Semana 11)**
- Pentesting externo (opcional, post-launch)
- OWASP Top 10 vulnerability scan
- Security audit de dependencies

### 16.2 Bug Tracking

**Sistema de Prioridad de Bugs:**
- **P0 (Critical):** Fix inmediato (dentro de 24h)
- **P1 (High):** Fix en 72h
- **P2 (Medium):** Fix en 7 días
- **P3 (Low):** Fix en 14 días
- **P4 (Trivial):** Fix en próximo release

**Herramientas:**
- GitHub Issues
- Linear
- Jira
- Bugsnag (production bugs)

---

## 17. VALIDACIÓN DEL MVP Y GO/NO-GO PARA FASE 4 (ALPHA)

### 17.1 Criterios de Validación del MVP

**Técnicos:**
- ✅ Las 12 features P0 funcionan sin bugs críticos
- ✅ Performance: 60 FPS desktop, 30 FPS mobile
- ✅ Latencia: <100ms para 95% de conexiones
- ✅ Uptime: 99%+ durante 1 semana de beta
- ✅ No memory leaks en 72h de testing

**De Negocio:**
- ✅ 100-500 usuarios beta completaron campaign
- ✅ 50%+ de usuarios regresaron para segunda sesión
- ✅ Sistema de recursos funciona sin bugs críticos
- ✅ Sistema de batallas funciona con lógica justa

**De Usuario:**
- ✅ Tutorial completado por 90%+ de usuarios en <15 min
- ✅ UI calificada como "moderna" por 80%+ de usuarios
- ✅ Juegabilidad calificada como "divertida" por 70%+ de usuarios
- ✅ Sistema de protección offline funciona según especificaciones

**De Escalabilidad:**
- ✅ Sistema soporta 20-50 jugadores por partida
- ✅ Sistema puede escalar a 100-200 jugadores con cambios mínimos
- ✅ Database soporta 100-200 usuarios concurrentes

### 17.2 Decisión Go/No-Go

**GO (Proceder a Alpha) si:**
- ✅ Todos los criterios técnicos cumplidos
- ✅ Todos los criterios de negocio cumplidos
- ✅ Todos los criterios de usuario cumplidos
- ✅ Todos los criterios de escalabilidad cumplidos
- Feedback de usuarios es predominantemente positivo (>70% satisfechos)

**NO-GO (Pivotear o mejorar) si:**
- ❌ Performance insuficiente (<30 FPS mobile, <60 FPS desktop)
- ❌ Latencia excesiva (>200ms promedio)
- ❌ Bugs críticos en features core
- ❌ Usuarios insatisfechos con juego/divertido (<50% satisfechos)
- ❌ Sistema no escala como esperado

**Confianza estimada:** 80% (Alta)

---

## 18. CHECKLIST DE VALIDACIÓN FASE 3

### ✅ Completa cada item antes de pasar a Fase 4

### ARQUITECTURA TÉCNICA
- [ ] Technical Design Document (TDD) completo
- [ ] Database Schema designado (todas las tablas)
- [ ] Índices de DB definidos
- [ ] Arquitectura frontend definida (5 capas)
- [ ] Arquitectura backend definida (API + Game Server)
- [ ] Arquitectura de infraestructura definida

### UI/UX DESIGN
- [ ] Wireframes de todas las interfaces creados
- [ ] Mockups de pantallas clave diseñados
- [ ] Design system components definidos
- [ ] Prototipos interactivos creados
- [ ] Responsiveness diseñado

### DATABASE
- [ ] Prisma schema completo
- [ ] Migrations escritas
- [ ] Seed data para desarrollo
- [ ] Índices para performance

### FRONTEND
- [ ] Next.js 15 setup completado
- [ ] React 18 configurado
- [ ] Three.js configurado
- [ ] Zustand configurado
- [ ] TanStack Query configurado
- [ ] Socket.IO-client integrado
- [ ] 12 features P0 implementadas

### BACKEND
- [ ] Bun runtime configurado
- [ ] Next.js API Routes completas
- [ ] Socket.IO server implementado
- [ ] Game Engine implementado
- [ ] Prisma ORM integrado
- [ ] Redis cache integrado

### INFRASTRUCTURA
- [ ] AWS ECS configurado
- [ ] Vercel configurado
- [ ] Cloudflare CDN configurado
- [ ] Route 53 DNS configurado
- [ ] Monitoring configurado (Sentry + Datadog)
- [ ] CI/CD pipeline configurado

### TESTING
- [ ] Unit tests escritos (>80% coverage)
- [ ] Integration tests escritos
- [ ] E2E tests manuales completados
- [ ] Performance testing completado
- [ ] Load testing completado

### DOCUMENTACIÓN
- [ ] API documentation creada
- [ ] Database documentation creada
- [ ] Architecture documentation creada
- [ ] Development guide creada

### VALIDACIÓN
- [ ] 100-500 usuarios beta testearon el MVP
- [ ] Feedback de usuarios recopilado y analizado
- [ ] Bugs críticos corregidos (P0 en 24h)
- [ ] Performance optimizada según métricas
- [ ] Criterios de validación cumplidos

### DEPLOYMENT
- [ ] MVP deployado a staging
- [ ] MVP deployado a producción
- [ ] Monitoring activo y configurado
- [ ] Alertas configuradas
- [ ] Backup system activo

### GO/NO-GO DECISION
- [ ] Todos los criterios de validación revisados
- [ ] Feedback de usuarios analizado
- [ ] Decisión documentada (GO/NO-GO)
- [ ] Roadmap para Fase 4 definido

---

## 🎯 PRÓXIMOS PASOS (FASE 4: ALPHA)

### Inmediato (HOY):
1. ✅ Tutorial Fase 3 leído y entendido
2. ✅ Technical Design Document completado
3. ✅ Database Schema diseñado
4. ✅ UI/UX Wireframes creados
5. ✅ Configuración de entorno lista
6. ⏳ Crear repositorio en GitHub
7. ⏳ Setup CI/CD pipeline
8. ⏳ Deploy a staging

### Corto Plazo (Esta Semana):
- Crear repositorio GitHub
- Configurar CI/CD
- Comenzar desarrollo de features P0
- Revisar progreso semanal

### Medio Plazo (Próximas 8-12 semanas):
- Implementación completa de 12 features P0
- Testing completo
- Deployment a producción
- Beta testing con usuarios reales
- Validación del MVP

---

## 📝 RESUMEN DE LA FASE 3

**Lo que has logrado:**
✅ Arquitectura técnica completa diseñada
✅ Schema de base de datos completo definido
✅ UI/UX wireframes y prototipos creados
✅ Roadmap de desarrollo del MVP establecido (8-12 semanas)
✅ 12 features P0 priorizadas y definidas
✅ Plan de testing completo (unit, integration, E2E, performance)
✅ Plan de deployment y operations definido
✅ Criterios de validación del MVP establecidos

**Tiempo estimado para completar Fase 3:**
- Con tu equipo: 8-12 semanas
- Con agentes AI acelerando: 4-6 semanas
- Solo tú: 16-24 semanas

---

## 🚀 LISTO PARA EL DESARROLLO TÉCNICO

**Stack de Tecnologías a Usar:**
- **Frontend:** Next.js 15, React 18, Tailwind CSS 4, Three.js
- **Backend:** Bun, Node.js, Socket.IO
- **Database:** PostgreSQL (Prisma)
- **Cache:** Redis
- **Hosting:** Vercel (frontend), AWS (backend)
- **Monitoring:** Sentry + Datadog
- **CI/CD:** GitHub Actions

**12 Features del MVP a Implementar:**
1. Modern UI & Tutorial
2. Fair Offline Protection
3. Core Gameplay Loop
4. 4 Resources System
5. Territory Conquest
6. Diplomacy & Alliances
7. Real-time Battles
8. 7-Day Campaign (MVP)
9. 30-Day Campaign (Full)
10. Fair F2P Monetization
11. Battle Pass ($9.99/mo)
12. Basic Chat System

---

**¿Listo para comenzar el desarrollo?**

¡Vamos a construir el MVP! 🚀🎮💥
