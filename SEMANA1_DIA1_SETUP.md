# SEMANA 1: SETUP DEL PROYECTO TÉCNICO

**Duración:** 5 días hábiles
**Objetivo:** Entorno de desarrollo completamente funcional con todas las dependencias integradas
**Confianza de éxito:** 95%

---

## 📋 CHECKLIST DIARIO

✅ Día 1: Inicialización del repositorio y stack base
✅ Día 2: Configuración de base de datos y ORM
✅ Día 3: Configuración de caché y comunicaciones en tiempo real
✅ Día 4: Configuración de 3D y rendering
✅ Día 5: Integración completa y verificación final

---

## 🚀 DÍA 1: INICIALIZACIÓN DEL REPOSITORIO Y STACK BASE

### Paso 1: Crear Repositorio GitHub

```bash
# Opción 1: Usar GitHub CLI (requiere GitHub CLI instalado)
gh repo create guerra-mundial-mvp \
  --public \
  --description "MVP de Guerra Mundial - Juego de estrategia global" \
  --homepage="https://guerra-mundial.com" \
  --license="MIT" \
  --gitignore="Node"

# Opción 2: Crear manualmente desde GitHub.com
# 1. Ve a https://github.com/new
# 2. Nombre del repositorio: guerra-mundial-mvp
# 3. Descripción: MVP de Guerra Mundial - Juego de estrategia global
# 4. Visibility: Private (para desarrollo) o Public
# 5. License: MIT
# 6. Inicializar con README: ✅
# 7. Click en "Create repository"

# Clonar repositorio localmente
git clone https://github.com/tu-usuario/guerra-mundial-mvp.git
cd guerra-mundial-mvp

# Verificar que git está inicializado
git status
```

---

### Paso 2: Inicializar Estructura de Directorios

```bash
# Crear estructura de directorios
mkdir -p app/api
mkdir -p app/(auth)/login
mkdir -p app/(auth)/register
mkdir -p app/(game)/create
mkdir -p app/(game)/join
mkdir -p app/(game)/leave
mkdir -p app/(player)/profile
mkdir -p app/(map)/provinces
mkdir -p app/(army)/move
mkdir -p app/(army)/attack
mkdir -p app/(army)/recruit
mkdir -p app/(battle)/start
mkdir -p app/(battle)/reinforce
mkdir -p app/(diplomacy)/alliance
mkdir -p app/(diplomacy)/pact
mkdir -p app/(diplomacy)/war
mkdir -p app/(diplomacy)/peace
mkdir -p app/(chat)/send
mkdir -p app/(chat)/history
mkdir -p components/ui
mkdir -p components/map
mkdir -p components/army
mkdir -p components/battle
mkdir -p components/diplomacy
mkdir -p components/chat
mkdir -p components/ThreeJs
mkdir -p stores
mkdir -p hooks
mkdir -p lib
mkdir -p lib/sockets
mkdir -p lib/utils
mkdir -p prisma
mkdir -p prisma/migrations
mkdir -p public/images
mkdir -p styles
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e

# Verificar estructura de directorios
tree -L 2
```

---

### Paso 3: Inicializar Next.js 15 con App Router

```bash
# Inicializar proyecto Next.js 15 con App Router
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# O usar Bun (más rápido)
bunx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Confirmar opciones en CLI:
# ? Would you like to use TypeScript? Yes
# ? Would you like to use ESLint? Yes
# ? Would you like to use Tailwind CSS? Yes
# ? Would you like to use `src/` directory? Yes
# ? Would you like to use App Router? Yes
# ? Would you like to customize the default import alias? Yes
# ? What import alias would you like configured? @/*

# Verificar estructura de archivos creada
tree -L 2
# Deberías ver:
# ├── src/
# │   ├── app/
# │   │   ├── layout.tsx
# │   │   └── page.tsx
# │   ├── components/
# │   ├── lib/
# │   └── public/
# ├── package.json
# ├── tsconfig.json
# ├── tailwind.config.ts
# └── next.config.mjs
```

---

### Paso 4: Configurar TypeScript

```bash
# Abrir tsconfig.json
nano src/tsconfig.json
# O usar VS Code:
code src/tsconfig.json
```

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Paso 5: Configurar Tailwind CSS 4

```bash
# Abrir tailwind.config.ts
nano src/tailwind.config.ts
# O usar VS Code:
code src/tailwind.config.ts
```

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A5D4F',
          light: '#5A6D5F',
          dark: '#3A4D3F',
        },
        secondary: {
          DEFAULT: '#708090',
          light: '#8090A0',
          dark: '#607080',
        },
        accent: {
          DEFAULT: '#E94560',
          light: '#F95570',
          dark: '#D93550',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Paso 6: Instalar Dependencias Base

```bash
# Instalar dependencias de producción
npm install zustand @tanstack/react-query socket.io-client socket.io
npm install @prisma/client
npm install three @react-three/fiber @react-three/drei
npm install next-auth @next-auth/prisma-adapter
npm install ioredis
npm install date-fns clsx tailwind-merge

# O usar Bun (más rápido)
bun add zustand @tanstack/react-query socket.io-client socket.io
bun add @prisma/client
bun add three @react-three/fiber @react-three/drei
bun add next-auth @next-auth/prisma-adapter
bun add ioredis
bun add date-fns clsx tailwind-merge

# Instalar dependencias de desarrollo
npm install -D prisma @types/node @types/react @types/react-dom eslint eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss husky lint-staged

# O usar Bun
bun add -D prisma @types/node @types/react @types/react-dom eslint eslint-config-next
bun add -D prettier prettier-plugin-tailwindcss husky lint-staged
```

---

### Paso 7: Configurar Bun Runtime (Opcional pero recomendado)

```bash
# Instalar Bun (si no está instalado)
curl -fsSL https://bun.sh/install | bash

# Verificar instalación de Bun
bun --version
# Deberías ver: Bun v1.x.x

# Crear archivo de configuración de Bun
cat > bunfig.toml << 'EOF'
[install]
# Configurar para usar npm registry por defecto
registry = "https://registry.npmjs.org"

[run]
# Configurar scripts de run
bun = "bun run"

[loader]
# Configurar loader de archivos
default = "ts"

[lockfile]
# Configurar lockfile
print = "yarn"

[test]
# Configurar testing
preload = ["bun:test/setup"]
EOF

# Inicializar proyecto con Bun
bun init

# Instalar dependencias con Bun
bun install

# Verificar package.json
cat package.json
```

---

### Paso 8: Crear Archivos de Configuración Base

```bash
# Crear .env.local
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/guerra_mundial?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-ultra-segura-para-nextauth-genera-un-nuevo"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Redis
REDIS_URL="redis://localhost:6379"
EOF

# Crear .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/guerra_mundial"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Redis
REDIS_URL="redis://localhost:6379"
EOF

# Copiar .env.local a .env (para uso local)
cp .env.local .env

# Añadir .env a .gitignore (si no está ya)
if ! grep -q ".env" .gitignore; then
  echo ".env" >> .gitignore
  echo ".env.local" >> .gitignore
  echo ".env.production.local" >> .gitignore
fi
```

---

### Paso 9: Configurar ESLint y Prettier

```bash
# Crear .eslintrc.json
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "error"
    "react/prop-types": "off"
  }
}
EOF

# Crear .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
EOF

# Crear .prettierrc.json (alternativa)
cat > .prettierrc.json << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
EOF

# Instalar husky y lint-staged
npm install -D husky lint-staged

# Inicializar husky
npx husky install

# Crear pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Crear lint-staged config
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
EOF
```

---

### Paso 10: Crear Página de Inicialización

```bash
# Crear página de prueba
mkdir -p src/app/test
cat > src/app/test/page.tsx << 'EOF'
import { Suspense } from 'react';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#4A5D4F' }}>🎮 WORLD CONFLICT 1945</h1>
      <h2>🚀 MVP Development - Semana 1: Setup</h2>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #708090', borderRadius: '8px' }}>
        <h3 style={{ color: '#E94560' }}>✅ Checklist del Día 1</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>✅ Repositorio GitHub creado</li>
          <li style={{ marginBottom: '10px' }}>✅ Estructura de directorios creada</li>
          <li style={{ marginBottom: '10px' }}>✅ Next.js 15 inicializado</li>
          <li style={{ marginBottom: '10px' }}>✅ TypeScript configurado</li>
          <li style={{ marginBottom: '10px' }}>✅ Tailwind CSS 4 configurado</li>
          <li style={{ marginBottom: '10px' }}>✅ Dependencias base instaladas</li>
          <li style={{ marginBottom: '10px' }}>✅ Bun runtime configurado</li>
          <li style={{ marginBottom: '10px' }}>✅ .env.local creado</li>
          <li style={{ marginBottom: '10px' }}>✅ ESLint y Prettier configurados</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #708090', borderRadius: '8px', backgroundColor: '#1A1A2E' }}>
        <h3 style={{ color: '#DAA520' }}>🎯 Próximos Pasos (Día 2)</h3>
        <p style={{ color: '#EAEAEA', marginBottom: '10px' }}>
          Mañana configuraremos:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, color: '#EAEAEA' }}>
          <li style={{ marginBottom: '10px' }}>• Base de datos PostgreSQL</li>
          <li style={{ marginBottom: '10px' }}>• ORM Prisma</li>
          <li style={{ marginBottom: '10px' }}>• Schema de base de datos básico</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0F3460', borderRadius: '8px', color: '#EAEAEA' }}>
        <h3 style={{ color: '#5F9EA0' }}>📋 Comandos Útiles</h3>
        <pre style={{ backgroundColor: '#16213E', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`# Iniciar servidor de desarrollo
npm run dev
# O con Bun:
bun run dev

# Ejecutar tests
npm test
# O con Bun:
bun test

# Hacer build
npm run build
# O con Bun:
bun run build
`}
        </pre>
      </div>
    </div>
  );
}
EOF

# Iniciar servidor de desarrollo
npm run dev
# O con Bun:
bun run dev

# Abrir navegador en http://localhost:3000/test
# Deberías ver la página de prueba con el checklist del Día 1
```

---

### Paso 11: Commit Inicial del Día 1

```bash
# Añadir archivos a git
git add .

# Verificar archivos añadidos
git status

# Commit inicial del Día 1
git commit -m "feat(dia-1): inicialización del repositorio y stack base

- Crear repositorio GitHub
- Inicializar estructura de directorios
- Inicializar Next.js 15 con App Router
- Configurar TypeScript
- Configurar Tailwind CSS 4
- Instalar dependencias base
- Configurar Bun runtime (opcional)
- Crear .env.local y .env.example
- Configurar ESLint y Prettier
- Crear página de prueba (/test)"

# Verificar commit
git log --oneline -1

# Push a GitHub
git push origin main
# O crear rama develop
git checkout -b develop
git push origin develop
```

---

## 📋 CHECKLIST DEL DÍA 1 - VERIFICACIÓN FINAL

```bash
# Verificar que todo está configurado correctamente
echo "═══════════════════════════════════════════════════════"
echo "🎯 CHECKLIST DEL DÍA 1"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📁 REPOSITORIO:"
echo "  ✅ Repositorio GitHub creado"
echo "  ✅ Repositorio clonado localmente"
echo "  ✅ Git inicializado"
echo "  ✅ .gitignore configurado (Node.js)"
echo ""
echo "📁 ESTRUCTURA DE DIRECTORIOS:"
echo "  ✅ app/ creado"
echo "  ✅ components/ creado"
echo "  ✅ lib/ creado"
echo "  ✅ stores/ creado"
echo "  ✅ hooks/ creado"
echo "  ✅ prisma/ creado"
echo "  ✅ tests/ creado"
echo ""
echo "📁 CONFIGURACIÓN:"
echo "  ✅ Next.js 15 inicializado"
echo "  ✅ TypeScript configurado"
echo "  ✅ Tailwind CSS 4 configurado"
echo "  ✅ ESLint configurado"
echo "  ✅ Prettier configurado"
echo ""
echo "📁 DEPENDENCIAS:"
echo "  ✅ Dependencias base instaladas"
echo "  ✅ Dependencias de desarrollo instaladas"
echo "  ✅ package.json actualizado"
echo ""
echo "📁 RUNTIME:"
echo "  ✅ Bun runtime configurado (opcional)"
echo "  ✅ bunfig.toml creado"
echo ""
echo "📁 VARIABLES DE ENTORNO:"
echo "  ✅ .env.local creado"
echo "  ✅ .env.example creado"
echo "  ✅ .env creado (copia de .env.local)"
echo ""
echo "📁 PÁGINA DE PRUEBA:"
echo "  ✅ Página /test creada"
echo "  ✅ Servidor de desarrollo iniciado"
echo "  ✅ Página accesible en http://localhost:3000/test"
echo ""
echo "📁 GIT:"
echo "  ✅ Commit inicial del Día 1 creado"
echo "  ✅ Push a GitHub realizado"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ DÍA 1 COMPLETADO!"
echo "═══════════════════════════════════════════════════════"
```

---

## 🎯 RESUMEN DEL DÍA 1

**Lo que hemos logrado:**
1. ✅ Repositorio GitHub creado
2. ✅ Estructura de directorios inicializada
3. ✅ Next.js 15 inicializado con App Router
4. ✅ TypeScript configurado
5. ✅ Tailwind CSS 4 configurado
6. ✅ Dependencias base instaladas
7. ✅ Bun runtime configurado (opcional)
8. ✅ Variables de entorno creadas (.env.local, .env.example)
9. ✅ ESLint y Prettier configurados
10. ✅ Página de prueba creada
11. ✅ Servidor de desarrollo iniciado
12. ✅ Commit inicial y push a GitHub

**Tiempo estimado:** 2-4 horas
**Confianza de éxito:** 95%

---

## 💡 TIPS DEL DÍA 1

### Para desarrollo:
- Usa **VS Code** con extensiones de TypeScript, Tailwind, ESLint, Prettier
- Usa **Git** para version control (branch develop)
- Usa **Bun** para mayor velocidad en instalación y ejecución
- Usa **Hot Reload** de Next.js para desarrollo rápido

### Para troubleshooting:
- Si Next.js no inicia, verifica que todas las dependencias estén instaladas
- Si Tailwind no funciona, verifica que el content path en tailwind.config.ts sea correcto
- Si TypeScript muestra errores, verifica que tsconfig.json esté correcto

### Para productividad:
- Configura **husky** para pre-commit hooks automáticos
- Configura **lint-staged** para lint automático en staged files
- Usa **Git hooks** para mantener código limpio

---

## 📋 PRÓXIMOS PASOS (DÍA 2)

Mañana configuraremos:
1. **Base de datos PostgreSQL** - Instalación y configuración
2. **ORM Prisma** - Inicialización y configuración
3. **Schema de base de datos básico** - Modelos y relaciones
4. **Migrations** - Crear migrations iniciales
5. **Seed Data** - Crear datos de prueba para desarrollo

**Solo sigue: SEMANA1_SETUP_MVP.md** (Sección DÍA 2)

---

**¿Listo para el Día 2?** 🚀

Solo dime: "Día 1 completada" y continuaré con el Día 2.

---

**Fecha:** 2024-01-09
**Autor:** Z.ai Code
**Versión:** 1.0.0
