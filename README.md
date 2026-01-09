# 🎖️ WORLD CONFLICT 1945

Juego de estrategia multijugador en tiempo real estilo Supremacy 1914.

---

## 🌐 URLs
- **Frontend (Vercel):** https://world-conflict-1945.vercel.app
- **Backend (Railway):** https://world-conflict-1945-production.up.railway.app

---

## ✅ FEATURES IMPLEMENTADAS

### 🗺️ Mapa 2D Hexagonal
- [x] Generación procedural con seed sincronizado
- [x] 100 provincias (grid 10x10)
- [x] Terrenos: Llanura, Bosque (+25% def), Montaña (+50% def)
- [x] Click para seleccionar provincias
- [x] Hover para ver nombres
- [x] Panel de info al seleccionar

### ⚔️ Ejércitos y Movimiento
- [x] Ejército inicial al unirse (100 soldados + 10 tanques)
- [x] Click ejército → seleccionar
- [x] Click provincia → mover ejército
- [x] Iconos de ejército con contador de unidades

### 🏰 Conquista de Territorios
- [x] Auto-captura de provincias neutrales
- [x] Combate al entrar a provincia enemiga (atacante gana por ahora)
- [x] Colores de provincias según dueño
- [x] Sincronización entre todos los jugadores

### 💰 Sistema de Recursos
- [x] 4 recursos: Oro, Hierro, Petróleo, Comida
- [x] Base income + bonus por provincia conquistada
- [x] Actualización cada tick (1 segundo)
- [x] Display en HUD superior

### 👥 Multijugador
- [x] WebSocket en tiempo real (Socket.IO)
- [x] Múltiples jugadores en la misma partida
- [x] Chat global
- [x] Lista de jugadores online
- [x] Selección de nación al registrarse (8 naciones)
- [x] Colores únicos por jugador

### 🔐 Autenticación
- [x] Registro de usuarios
- [x] Login con JWT
- [x] Sesiones persistentes (localStorage)
- [x] Modo invitado automático

---

## ❌ FEATURES NO IMPLEMENTADAS (Roadmap)

### 🏆 Objetivos y Victoria (FALTA)
- [ ] Condiciones de victoria (ej: conquistar 30 provincias)
- [ ] Sistema de puntuación
- [ ] Partidas con tiempo límite (7 días, 30 días)
- [ ] Ranking de jugadores
- [ ] Ganador de partida

### 📋 Misiones y Logros (FALTA)
- [ ] Misiones diarias/semanales
- [ ] Sistema de logros
- [ ] Recompensas por completar objetivos
- [ ] Tutorial interactivo

### ⚔️ Combate Avanzado (FALTA)
- [ ] Comparación de fuerzas (atacante vs defensor)
- [ ] Bonus de terreno en combate
- [ ] Moral de tropas
- [ ] Batallas que duran varios turnos
- [ ] Refuerzos durante batalla

### 🏭 Reclutamiento (FALTA)
- [ ] Gastar recursos para crear unidades
- [ ] Tipos de unidades (infantería, tanques, artillería, aviones, barcos)
- [ ] Límite de unidades por provincia
- [ ] Tiempo de entrenamiento

### 🔬 Árbol Tecnológico (FALTA)
- [ ] 4 ramas: Infantería, Blindados, Aviación, Naval
- [ ] 5 niveles por rama
- [ ] Desbloquear unidades mejores
- [ ] Investigación con recursos

### 🏗️ Edificios (FALTA)
- [ ] Fábricas (producción de tropas)
- [ ] Minas (bonus recursos)
- [ ] Búnkers (bonus defensa)
- [ ] Puertos, Aeropuertos

### 🤝 Diplomacia (FALTA)
- [ ] Alianzas entre jugadores (hasta 4)
- [ ] Pactos de no agresión
- [ ] Declaraciones de guerra formales
- [ ] Comercio de recursos

### 😴 Modo Sleep (FALTA)
- [ ] Protección offline (8 horas máx)
- [ ] IA defensiva mientras duermes
- [ ] Programación de horarios

### 💎 Monetización (FALTA)
- [ ] Integración con Stripe
- [ ] Moneda premium (Oro Negro)
- [ ] Cosmetics (skins de ejércitos)
- [ ] Battle Pass

---

## 🛠️ TECH STACK

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 15 + React 18 + TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Mapa | SVG Hexagons (custom) |
| Backend | Node.js + Socket.IO |
| Database | PostgreSQL + Prisma |
| Auth | JWT + bcrypt |
| Deploy FE | Vercel |
| Deploy BE | Railway |

---

## 🚀 CÓMO EJECUTAR LOCALMENTE

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/world-conflict-1945.git
cd world-conflict-1945

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL, JWT_SECRET, etc.

# Ejecutar base de datos (Docker o PostgreSQL local)
npx prisma db push

# Ejecutar servidor de juego (terminal 1)
node server.js

# Ejecutar frontend (terminal 2)
npm run dev

# Abrir en navegador
http://localhost:3000
```

---

## 📊 PROGRESO DEL MVP

```
[██████████████████░░] 85% Completo

✅ Mapa 2D             ████████████ 100%
✅ Ejércitos           ████████████ 100%
✅ Movimiento          ████████████ 100%
✅ Conquista           ████████████ 100%
✅ Recursos            ████████████ 100%
✅ Multijugador        ████████████ 100%
✅ Chat                ████████████ 100%
✅ Auth                ████████████ 100%
⏳ Combate real        ████░░░░░░░░ 30%
❌ Reclutamiento       ░░░░░░░░░░░░ 0%
❌ Objetivos/Victoria  ░░░░░░░░░░░░ 0%
❌ Misiones            ░░░░░░░░░░░░ 0%
```

---

## 📄 LICENCIA

MIT License - Proyecto educativo

---

## 🤝 CONTRIBUIR

Pull requests bienvenidos. Para cambios grandes, abrir issue primero.
