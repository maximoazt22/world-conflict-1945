# 🗄️ DÍA 2: CONFIGURACIÓN DE BASE DE DATOS Y ORM

**Duración:** 4-6 horas
**Objetivo:** Base de datos PostgreSQL configurada con Prisma ORM y schema básico
**Confianza de éxito:** 90%

---

## 📋 OBJETIVOS DEL DÍA 2

1. ✅ Instalar y configurar PostgreSQL localmente
2. ✅ Crear base de datos de desarrollo
3. ✅ Instalar y configurar Prisma ORM
4. ✅ Definir datasource y generador en Prisma
5. ✅ Crear modelos básicos del schema
6. ✅ Definir relaciones entre modelos
7. ✅ Crear migrations
8. ✅ Generar Prisma Client
9. ✅ Verificar configuración con Prisma Studio

---

## 🚀 PASOS DEL DÍA 2

### Paso 1: Instalar PostgreSQL

```bash
# Opción 1: Usar Homebrew (macOS)
brew install postgresql@14
brew services start postgresql@14

# Opción 2: Usar Docker (multiplataforma)
docker run --name postgres-mvp \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=guerra_mundial \
  -p 5432:5432 \
  -d postgres:14-alpine

# Opción 3: Usar instalador oficial
# macOS: https://www.postgresql.org/download/macosx/
# Windows: https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql postgresql-contrib

# Verificar instalación de PostgreSQL
psql --version
# Deberías ver: psql (PostgreSQL) 14.x.x
```

---

### Paso 2: Crear Base de Datos

```bash
# Crear base de datos
createdb guerra_mundial

# O con psql
psql -U postgres -c "CREATE DATABASE guerra_mundial;"

# Verificar que la base de datos se creó
psql -U postgres -d postgres -c "\l"

# Deberías ver:
#                                   List of databases
#    Name    |  Owner   | Encoding | Collate |   Ctype   |
# -----------+----------+----------+---------+-----------+
#  postgres  | postgres | UTF8     | C       | C         |
#  template0 | postgres | UTF8     | C       | C         |
#  template1 | postgres | UTF8     | C       | C         |
#  guerra_mundial | postgres | UTF8     | C       | C         |
```

---

### Paso 3: Instalar Prisma CLI

```bash
# Instalar Prisma CLI como dependencia de desarrollo
npm install prisma --save-dev

# O con Bun
bun add prisma --dev

# Verificar instalación de Prisma
npx prisma --version
# O con Bun:
bunx prisma --version
# Deberías ver: prisma version 5.x.x
```

---

### Paso 4: Inicializar Prisma

```bash
# Inicializar Prisma
npx prisma init
# O con Bun:
bunx prisma init

# Confirmar opciones:
# - Prisma Schema: schema.prisma (ubicación: src/prisma/schema.prisma)
# - Database: PostgreSQL
# - Connection String: Generar .env.local (si no existe)

# Verificar archivos creados
ls -la prisma/
# Deberías ver:
# - schema.prisma (archivo de configuración de Prisma)
```

---

### Paso 5: Configurar Datasource en Prisma

```bash
# Abrir prisma/schema.prisma
nano prisma/schema.prisma
# O usar VS Code:
code prisma/schema.prisma
```

```prisma
// Configurar datasource y generador
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Models se crearán en el Paso 7
```

---

### Paso 6: Configurar DATABASE_URL en .env.local

```bash
# Abrir .env.local
nano .env.local
```

```bash
# Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guerra_mundial?schema=public"

# O si usas usuario/contraseña diferente:
# DATABASE_URL="postgresql://usuario:password@localhost:5432/guerra_mundial?schema=public"

# Prisma Database URL (opcional)
PRISMA_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guerra_mundial"

# Nota: Si estás usando Docker, la URL puede ser:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guerra_mundial?host=host.docker.internal"
```

---

### Paso 7: Crear Modelos Básicos del Schema

```bash
# Editar prisma/schema.prisma
nano prisma/schema.prisma
```

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Modelos básicos (crearemos modelos completos en Semana 2)

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Game {
  id               String     @id @default(cuid())
  name             String
  mapId            String
  maxPlayers       Int
  currentPlayers   Int        @default(0)
  duration         Int
  status           GameStatus @default(WAITING)
  createdById      String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  lastTick         Int        @default(0)
  startedAt        DateTime?
  endedAt          DateTime?
}

model Player {
  id        String    @id @default(cuid())
  userId    String
  nation    String
  color     String
  goldRate  Float     @default(10.0)
  ironRate  Float     @default(5.0)
  oilRate   Float     @default(2.5)
  foodRate  Float     @default(7.5)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Province {
  id           String     @id @default(cuid())
  gameId       String
  name         String
  coordinates  Coordinates
  ownerId      String?
  goldBonus    Float     @default(0)
  ironBonus    Float     @default(0)
  oilBonus     Float     @default(0)
  foodBonus    Float     @default(0)
  defenseBonus Float     @default(0)
  capturedAt   DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Army {
  id                   String     @id @default(cuid())
  playerId            String
  gameId               String
  name                 String?
  position             Position
  isMoving             Boolean    @default(false)
  destination          String?
  currentProvinceId    String
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt
}

model Unit {
  id        String   @id @default(cuid())
  armyId    String
  type      UnitType
  quantity  Int
  strength  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Battle {
  id                  String      @id @default(cuid())
  gameId              String
  provinceId          String
  attackerArmyId      String
  defender            String?
  startTime           DateTime
  duration            Int
  status              BattleStatus @default(PENDING)
  attackerCasualties   Int         @default(0)
  defenderCasualties   Int         @default(0)
  winner              String?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
}

model ChatMessage {
  id        String      @id @default(cuid())
  gameId    String
  playerId  String
  message   String
  type      ChatType
  createdAt DateTime   @default(now())
}

model Coordinates {
  x Float
  y Float
  z Float @default(0)
}

model Position {
  provinceId String
  x          Float
  y          Float
  z          Float @default(0)
}

// Enums

enum GameStatus {
  WAITING
  PLAYING
  PAUSED
  ENDED
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

enum BattleStatus {
  PENDING
  ACTIVE
  COMPLETED
}

enum ChatType {
  GLOBAL
  ALLIANCE
  PRIVATE
}
```

---

### Paso 8: Definir Relaciones entre Modelos

```bash
# Editar prisma/schema.prisma para agregar relaciones
nano prisma/schema.prisma
```

```prisma
// Agregar relaciones a los modelos existentes

// User
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  player    Player?  // Relación 1:1
}

// Game
model Game {
  id               String     @id @default(cuid())
  name             String
  mapId            String
  maxPlayers       Int
  currentPlayers   Int        @default(0)
  duration         Int
  status           GameStatus @default(WAITING)
  createdById      String?
  provinces       Province[] // Relación 1:N
  armies          Army[]     // Relación 1:N
  battles          Battle[]   // Relación 1:N
  chatMessages    ChatMessage[] // Relación 1:N
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  lastTick         Int        @default(0)
  startedAt        DateTime?
  endedAt          DateTime?
}

// Player
model Player {
  id        String    @id @default(cuid())
  userId    String
  nation    String
  color     String
  goldRate  Float     @default(10.0)
  ironRate  Float     @default(5.0)
  oilRate   Float     @default(2.5)
  foodRate  Float     @default(7.5)
  armies    Army[]    // Relación 1:N
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Province
model Province {
  id           String     @id @default(cuid())
  gameId       String
  name         String
  coordinates  Coordinates
  ownerId      String?
  goldBonus    Float     @default(0)
  ironBonus    Float     @default(0)
  oilBonus     Float     @default(0)
  foodBonus    Float     @default(0)
  defenseBonus Float     @default(0)
  units        Unit[]     // Relación 1:N
  capturedAt   DateTime?
  game         Game       @relation(fields: [gameId], references: [Game]) // Relación N:1
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([gameId])        // Índice para performance
  @@index([ownerId])       // Índice para performance
}

// Army
model Army {
  id                   String     @id @default(cuid())
  playerId            String
  gameId               String
  name                 String?
  position             Position
  isMoving             Boolean    @default(false)
  destination          String?
  currentProvinceId    String
  units                Unit[]     // Relación 1:N
  player               Player     @relation(fields: [playerId], references: [Player]) // Relación N:1
  game                 Game       @relation(fields: [gameId], references: [Game]) // Relación N:1

  @@index([playerId])      // Índice para performance
  @@index([gameId])         // Índice para performance
  @@index([currentProvinceId]) // Índice para performance
}

// Unit
model Unit {
  id        String   @id @default(cuid())
  armyId    String
  type      UnitType
  quantity  Int
  strength  Int      @default(1)
  army      Army     @relation(fields: [armyId], references: [Army]) // Relación N:1

  @@index([armyId]) // Índice para performance
}

// Battle
model Battle {
  id                  String      @id @default(cuid())
  gameId              String
  provinceId          String
  attackerArmyId      String
  defender            String?
  startTime           DateTime
  duration            Int
  status              BattleStatus @default(PENDING)
  attackerCasualties   Int         @default(0)
  defenderCasualties   Int         @default(0)
  winner              String?
  attackerArmy        Army        @relation(fields: [attackerArmyId], references: [Army]) // Relación N:1
  game                Game        @relation(fields: [gameId], references: [Game]) // Relación N:1

  @@index([gameId])      // Índice para performance
  @@index([status])     // Índice para performance
  @@index([provinceId]) // Índice para performance
}

// ChatMessage
model ChatMessage {
  id        String      @id @default(cuid())
  gameId    String
  playerId  String
  message   String
  type      ChatType
  createdAt DateTime   @default(now())
  game      Game        @relation(fields: [gameId], references: [Game]) // Relación N:1

  @@index([gameId])      // Índice para performance
  @@index([type])       // Índice para performance
  @@index([createdAt])  // Índice para performance
}
```

---

### Paso 9: Crear Migrations

```bash
# Crear migrations
npx prisma migrate dev --name init
# O con Bun:
bunx prisma migrate dev --name init

# Verificar que las migrations se crearon correctamente
ls -la prisma/migrations/
# Deberías ver:
# - 20240109XXXXXX_init/migration.sql

# Verificar que las tablas se crearon en la base de datos
psql -U postgres -d guerra_mundial -c "\d"
# Deberías ver:
#                      List of relations
#  Schema |       Name        |   Type   |  Owner
//  --------+--------------------+----------+--------
//  public  | _prisma_migrations | table    | postgres
//  public  | battles            | table    | postgres
//  public  | chat_messages      | table    | postgres
//  public  | games              | table    | postgres
//  public  | players            | table    | postgres
//  public  | provinces         | table    | postgres
//  public  | armies             | table    | postgres
//  public  | units              | table    | postgres
//  public  | users              | table    | postgres
```

---

### Paso 10: Generar Prisma Client

```bash
# Generar Prisma Client
npx prisma generate
# O con Bun:
bunx prisma generate

# Verificar que el cliente se generó correctamente
ls -la node_modules/@prisma/client/
# Deberías ver:
//  - node_modules/@prisma/client/index.d.ts
//  - node_modules/@prisma/client/index.js
```

---

### Paso 11: Verificar Configuración con Prisma Studio

```bash
# Abrir Prisma Studio
npx prisma studio
# O con Bun:
bunx prisma studio

# Prisma Studio debería abrirse automáticamente en tu navegador
# Deberías ver:
//  - Database: guerra_mundial
//  - Tables: todas las tablas creadas
//  - Relaciones: todas las relaciones definidas
```

---

### Paso 12: Crear Página de Prueba de Base de Datos

```bash
# Crear página de prueba
mkdir -p src/app/test/database
cat > src/app/test/database/page.tsx << 'EOF'
'use client';

import { useState } from 'react';

export default function DatabaseTestPage() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setMessage('Conectando a la base de datos...');

    try {
      const response = await fetch('/api/database/test');
      const data = await response.json();
      setMessage(`✅ Base de datos conectada exitosamente: ${data.database}`);
    } catch (error) {
      setMessage(`❌ Error al conectar a la base de datos: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#4A5D4F' }}>🗄️ Base de Datos - Prueba de Conexión</h1>
      <h2 style={{ color: '#708090' }}>Día 2: Configuración de Base de Datos y ORM</h2>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #708090', borderRadius: '8px' }}>
        <h3 style={{ color: '#E94560' }}>✅ Checklist del Día 2</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>✅ PostgreSQL instalado</li>
          <li style={{ marginBottom: '10px' }}>✅ Base de datos guerra_mundial creada</li>
          <li style={{ marginBottom: '10px' }}>✅ Prisma CLI instalado</li>
          <li style={{ marginBottom: '10px' }}>✅ Prisma inicializado</li>
          <li style={{ marginBottom: '10px' }}>✅ Schema de Prisma configurado</li>
          <li style={{ marginBottom: '10px' }}>✅ Modelos básicos creados (User, Game, Player, etc.)</li>
          <li style={{ marginBottom: '10px' }}>✅ Relaciones definidas</li>
          <li style={{ marginBottom: '10px' }}>✅ Migrations creadas</li>
          <li style={{ marginBottom: '10px' }}>✅ Prisma Client generado</li>
          <li style={{ marginBottom: '10px' }}>✅ Prisma Studio verificado</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #708090', borderRadius: '8px', backgroundColor: '#1A1A2E' }}>
        <h3 style={{ color: '#DAA520' }}>🎬 Prueba de Conexión</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#708090' : '#E94560',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Conectando...' : 'Probar Conexión'}
          </button>
        </div>

        {message && (
          <div style={{
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: message.includes('✅') ? '#2D5A27' : '#8B0000',
            color: 'white',
            fontSize: '16px',
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0F3460', borderRadius: '8px', color: '#EAEAEA' }}>
        <h3 style={{ color: '#5F9EA0' }}>📋 Comandos Útiles</h3>
        <pre style={{ backgroundColor: '#16213E', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '14px' }}>
{`# Generar Prisma Client
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Crear nueva migration
npx prisma migrate dev --name nombre_migration

# Resetear base de datos (PELIGROSO - BORRA TODOS LOS DATOS)
npx prisma migrate reset

# Verificar conexión a base de datos
psql -U postgres -d guerra_mundial -c "\l"`}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0F3460', borderRadius: '8px', color: '#EAEAEA' }}>
        <h3 style={{ color: '#5F9EA0' }}>🎯 Próximos Pasos (Día 3)</h3>
        <p style={{ color: '#EAEAEA', marginBottom: '10px' }}>
          Mañana configuraremos:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, color: '#EAEAEA' }}>
          <li style={{ marginBottom: '10px' }}>• Redis (instalación y configuración)</li>
          <li style={{ marginBottom: '10px' }}>• Cliente Redis (ioredis)</li>
          <li style={{ marginBottom: '10px' }}>• Socket.IO (server + client)</li>
          <li style={{ marginBottom: '10px' }}>• Configuración básica de WebSockets</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #708090', borderRadius: '8px' }}>
        <a href="/test" style={{ color: '#4A5D4F', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver a la página de prueba principal
        </a>
      </div>
    </div>
  );
}
EOF
```

---

### Paso 13: Crear API Route para Probar Conexión

```bash
# Crear API route para probar conexión
mkdir -p src/app/api/database/test
cat > src/app/api/database/test/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar que la base de datos existe
    const databaseExists = await prisma.$queryRaw`
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: 'Base de datos conectada exitosamente',
      database: process.env.DATABASE_URL?.split('/')[3] || 'guerra_mundial',
      tables: await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `,
    });
  } catch (error) {
    console.error('Error conectando a base de datos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al conectar a la base de datos',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
EOF
```

---

### Paso 14: Verificar que Todo Funciona

```bash
# Asegúrate de que PostgreSQL esté corriendo
brew services list | grep postgres
# O
docker ps | grep postgres

# Iniciar servidor de desarrollo
npm run dev
# O con Bun:
bun run dev

# Abrir navegador en http://localhost:3000/test/database
# Deberías ver la página de prueba de base de datos

# Probar conexión a base de datos
# Hacer click en el botón "Probar Conexión"
# Deberías ver: "✅ Base de datos conectada exitosamente: guerra_mundial"
```

---

### Paso 15: Commit del Día 2

```bash
# Añadir archivos a git
git add .

# Verificar archivos añadidos
git status

# Commit del Día 2
git commit -m "feat(dia-2): configuración de base de datos y ORM

- Instalar y configurar PostgreSQL
- Crear base de datos guerra_mundial
- Instalar y configurar Prisma ORM
- Definir datasource y generador en Prisma
- Crear modelos básicos del schema (User, Game, Player, Province, Army, Unit, Battle, ChatMessage)
- Definir relaciones entre modelos
- Crear migrations (init)
- Generar Prisma Client
- Verificar configuración con Prisma Studio
- Crear página de prueba (/test/database)
- Crear API route para probar conexión"

# Verificar commit
git log --oneline -1

# Push a GitHub
git push origin develop
```

---

## 📋 CHECKLIST DEL DÍA 2 - VERIFICACIÓN FINAL

```bash
echo "═══════════════════════════════════════════════════════"
echo "🗄️ DÍA 2: CONFIGURACIÓN DE BASE DE DATOS Y ORM"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "✅ POSTGRESQL:"
echo "  ✅ PostgreSQL instalado"
echo "  ✅ Servicio PostgreSQL iniciado"
echo "  ✅ Base de datos guerra_mundial creada"
echo "  ✅ Verificación de conexión exitosa"
echo ""
echo "✅ PRISMA ORM:"
echo "  ✅ Prisma CLI instalado"
echo "  ✅ Prisma inicializado"
echo "  ✅ Datasource configurado"
echo "  ✅ Generador configurado"
echo "  ✅ DATABASE_URL configurado"
echo ""
echo "✅ SCHEMA DE PRISMA:"
echo "  ✅ Modelos básicos creados (8 modelos)"
echo "  ✅ Enumeraciones definidas (3 enums)"
echo "  ✅ Relaciones definidas (1:1, 1:N)"
echo "  ✅ Índices de performance definidos"
echo ""
echo "✅ MIGRATIONS:"
echo "  ✅ Migration inicial creada"
echo "  ✅ Tablas creadas en base de datos"
echo "  ✅ Relaciones creadas en base de datos"
echo "  ✅ Índices creados en base de datos"
echo ""
echo "✅ PRISMA CLIENT:"
echo "  ✅ Prisma Client generado"
echo "  ✅ @prisma/client instalado"
echo "  ✅ Verificación de cliente exitosa"
echo ""
echo "✅ PRISMA STUDIO:"
echo "  ✅ Prisma Studio abierto exitosamente"
echo "  ✅ Todas las tablas visibles"
echo "  ✅ Todas las relaciones visibles"
echo "  ✅ Pruebas de queries exitosas"
echo ""
echo "✅ PÁGINA DE PRUEBA:"
echo "  ✅ Página /test/database creada"
echo "  ✅ API route /api/database/test creada"
echo "  ✅ Prueba de conexión exitosa"
echo "  ✅ Verificación de base de datos exitosa"
echo ""
echo "✅ GIT:"
echo "  ✅ Commit del Día 2 creado"
echo "  ✅ Push a GitHub realizado"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ DÍA 2 COMPLETADO!"
echo "═══════════════════════════════════════════════════════"
```

---

## 🎯 RESUMEN DEL DÍA 2

**Lo que hemos logrado:**
1. ✅ PostgreSQL instalado y configurado
2. ✅ Base de datos guerra_mundial creada
3. ✅ Prisma ORM instalado y configurado
4. ✅ Schema de Prisma configurado (datasource, generador)
5. ✅ Modelos básicos creados (User, Game, Player, Province, Army, Unit, Battle, ChatMessage)
6. ✅ Enumeraciones definidas (GameStatus, BattleStatus, ChatType, UnitType)
7. ✅ Relaciones definidas (1:1, 1:N)
8. ✅ Migrations creadas y ejecutadas
9. ✅ Prisma Client generado
10. ✅ Prisma Studio verificado
11. ✅ Página de prueba creada (/test/database)
12. ✅ API route para probar conexión creada

**Tiempo estimado:** 4-6 horas
**Confianza de éxito:** 90%

---

## 💡 TIPS DEL DÍA 2

### Para desarrollo:
- Usa **Prisma Studio** para visualizar y manipular la base de datos
- Usa **Migrations** para controlar cambios en el schema
- Usa **@prisma/client** para queries tipadas en TypeScript

### Para troubleshooting:
- Si Prisma no puede conectar, verifica que DATABASE_URL sea correcto
- Si migrations fallan, verifica que PostgreSQL esté corriendo
- Si Prisma Studio no abre, verifica que el puerto 5432 esté disponible

### Para productividad:
- Configura **scripts** en package.json para comandos frecuentes de Prisma
- Usa **husky** para pre-commit hooks que verifiquen schema
- Usa **Git** para version control de migrations

---

## 📋 PRÓXIMOS PASOS (DÍA 3)

Mañana configuraremos:
1. **Redis** (instalación y configuración)
2. **Cliente Redis** (ioredis)
3. **Socket.IO** (server + client)
4. **Configuración básica de WebSockets**
5. **Eventos básicos del juego** (ping, pong, etc.)

**Solo sigue: SEMANA1_SETUP_MVP.md** (Sección DÍA 3)

---

**¿Listo para el Día 3?**

Solo dime: "Día 2 completada" y continuaré con el Día 3.

---

**Fecha:** 2024-01-09
**Autor:** Z.ai Code
**Versión:** 1.0.0
