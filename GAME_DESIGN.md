# WORLD CONFLICT 1945 - GAME DESIGN DOCUMENT
## Clone de Supremacy 1914 - Temática Segunda Guerra Mundial

---

## 🎯 CONCEPTO GENERAL

**Juego de Estrategia en Tiempo Real Multijugador (MMORTS)** ambientado en la Segunda Guerra Mundial donde los jugadores controlan naciones, expanden territorios mediante conquista diplomática y militar, gestionan economías complejas y compiten en tiempo real para convertirse en la potencia dominante de 1945.

### Características Principales:
- ⏱️ Estrategia en tiempo real con progresión continua (24/7)
- 🗺️ Sistema de provincias geográficas con recursos específicos
- 💰 Gestión económica compleja con múltiples recursos
- ⚔️ Producción militar con unidades de WW2 (tierra, aire, mar)
- 🤝 Sistema de diplomacia con alianzas, guerras y comercio
- 🤖 IA para naciones NPC
- 🏆 Sistema de puntos para determinar el ganador

---

## 🗺️ SISTEMA DE MAPA Y PROVINCIAS

### Estructura Geográfica:
- **Mapas disponibles:**
  - Europa 1945 (10 jugadores)
  - Teatro del Pacífico (20 jugadores)
  - Frente Oriental (15 jugadores)
  - Mapa Mundial (100+ jugadores)

### Provincias:
- Cada provincia produce UN recurso principal
- Algunas tienen "doble producción"
- Provincias costeras permiten puertos
- Conexiones por carreteras y ferrocarriles
- Rutas marítimas para movimiento naval

### Sistema de Colores (Moral):
| Color | Estado | Producción |
|-------|--------|------------|
| 🟢 Verde Oscuro | Alta moral | 100% |
| 🟢 Verde Claro | Buena moral | 85% |
| 🟡 Amarillo | Moral aceptable | 70% |
| 🟠 Naranja | Moral baja | 50% |
| 🔴 Rojo | Moral crítica | 25% |

### Interactividad:
- Click = seleccionar provincia
- Arrastrar unidades = mover
- Click derecho = menú contextual
- Scroll/Pinch = Zoom (sigue al puntero)
- Drag/Swipe = Pan del mapa
- Niebla de guerra según diplomacia

---

## 💰 SISTEMA ECONÓMICO - RECURSOS WW2

### Recursos Principales:

#### 1. 🌾 COMIDA (Food)
- Consumo continuo por población y ejército
- Necesaria para producción
- Escasez = caída de moral, deserciones

#### 2. ⚙️ ACERO (Steel) - antes "Iron"
- Construcción de edificios
- Producción de vehículos y armas
- Crítico para tanques y barcos

#### 3. 🛢️ PETRÓLEO (Oil)
- Combustible para vehículos y aviones
- Sin petróleo = vehículos inmóviles
- Recurso estratégico clave de WW2

#### 4. 🪙 ORO (Gold)
- Moneda universal
- Comercio internacional
- Mantenimiento de ejército

#### 5. 💎 MATERIALES RAROS (Rare Materials)
- Necesarios para unidades avanzadas
- Tungsteno, caucho, bauxita
- Muy escasos

### Mecánica:
- Producción por hora
- Consumo mínimo diario por provincia
- Ingreso Neto = Producción - Consumo
- Escasez = edificios desactivados

---

## 🏭 SISTEMA DE EDIFICIOS - ERA WW2

### Timeline de Desbloqueo:

| Día | Edificios Disponibles |
|-----|----------------------|
| 0 | Centro de Reclutamiento, Cuarteles, Talleres |
| 2 | Puertos |
| 5 | Ferrocarriles |
| 8 | Fábricas de Armamento |
| 10 | Aeródromos |
| 15 | Fábricas de Tanques |
| 20 | Astilleros Navales |

### Edificios:

#### 🏛️ CENTRO DE RECLUTAMIENTO
- Produce infantería básica
- 1 unidad por día
- Mejorable a nivel 3

#### 🛠️ TALLERES
- Produce vehículos ligeros
- Jeeps, camiones
- Mejorables a Fábricas

#### 🏭 FÁBRICA DE ARMAMENTO
- Produce artillería
- Cañones antitanque
- Requiere acero + oro

#### 🚗 FÁBRICA DE TANQUES
- Produce Sherman, Panzer, T-34
- Consume acero + petróleo
- Requiere fábrica nivel 2

#### ✈️ AERÓDROMO
- Base para aviones
- Produce cazas y bombarderos
- Requiere combinación con fábrica

#### ⚓ PUERTO
- Base naval
- Produce barcos de transporte
- Solo en costas

#### 🚢 ASTILLERO NAVAL
- Produce cruceros, acorazados, submarinos
- Requiere puerto + fábrica
- Alto costo en acero

#### 🛤️ FERROCARRIL
- Aumenta velocidad de movimiento 2x
- Aumenta producción de recursos
- Necesario para artillería pesada

#### 🏰 FORTIFICACIÓN
- Bunkers y trincheras
- Bonus de defensa +50%
- Oculta ejércitos de espías

---

## ⚔️ UNIDADES MILITARES WW2

### INFANTERÍA:

| Unidad | Rol | Costo | Velocidad |
|--------|-----|-------|-----------|
| 🚶 Infantería | Base, versátil | Bajo | Normal |
| 🎖️ Comandos | Élite, especial | Alto | Rápida |
| 🔥 Lanzallamas | Anti-bunker | Medio | Lenta |

### VEHÍCULOS TERRESTRES:

| Unidad | Rol | Costo | Ataque | Defensa |
|--------|-----|-------|--------|---------|
| 🚗 Jeep | Reconocimiento | Bajo | Bajo | Bajo |
| 🛻 Halftrack | Transporte | Medio | Medio | Medio |
| 🚜 Sherman | Tanque medio US | Alto | Alto | Alto |
| 🚜 Panzer IV | Tanque medio DE | Alto | Alto | Alto |
| 🚜 T-34 | Tanque medio USSR | Alto | Alto | Muy Alto |
| 🦖 Tiger | Tanque pesado | Muy Alto | Muy Alto | Muy Alto |
| 💥 Artillería | Fuego indirecto | Alto | Muy Alto | Bajo |

### AVIACIÓN:

| Unidad | Rol | Rango |
|--------|-----|-------|
| ✈️ Caza (P-51, Spitfire, Bf-109) | Superioridad aérea | 300 |
| 💣 Bombardero (B-17, Lancaster) | Bombardeo estratégico | 500 |
| 🪂 Transporte (C-47) | Paracaidistas | 400 |

### NAVAL:

| Unidad | Rol | Especial |
|--------|-----|----------|
| 🚢 Transporte | Mover tropas | - |
| ⚓ Destructor | Anti-submarino | Detecta subs |
| 🛳️ Crucero | Combate naval | Balanceado |
| 🚢 Acorazado | Poder naval | Bombardeo costero |
| 🦈 Submarino | Sigiloso | Invisible |
| ✈️🚢 Portaaviones | Base aérea móvil | Lanza aviones |

### Sistema de Tamaño de Ejército:
- **Escuadra**: 0-10 unidades
- **Pelotón**: 10-25 unidades
- **Compañía**: 25-100 unidades
- **Batallón**: 100-500 unidades
- **División**: 500+ unidades

---

## ⚔️ SISTEMA DE COMBATE

### Mecánicas:
1. **Movimiento**: Arrastrar o click + "Mover"
2. **Ataque**: Mover a territorio enemigo
3. **Combate Automático**: Resolución en tiempo real

### Bonificaciones:
- Infantería + Tanques = +25% ataque
- Artillería en rango = +30% daño
- Aviación = bonus moral y exploración
- Fortificaciones = +50% defensa

### Combate Aéreo:
- Cazas vs Cazas = superioridad aérea
- Bombarderos vs Tierra = daño a tropas/edificios
- Cazas interceptan bombarderos

### Combate Naval:
- Acorazados dominan mar abierto
- Submarinos son invisibles
- Portaaviones proyectan poder aéreo
- Destructores detectan submarinos

---

## 🤝 DIPLOMACIA Y ALIANZAS

### Estados Diplomáticos:
| Estado | Efecto |
|--------|--------|
| Paz | Neutral, sin combate |
| Derecho de Paso | Tropas pueden cruzar |
| Alianza | Cooperación total |
| Guerra | Combate activo |

### Sistema de Alianzas:
- Crear coaliciones (hasta 5 naciones)
- Compartir mapa
- Comercio preferencial
- Victoria compartida

### Mecánica de Guerra:
- Declaración formal opcional
- Ataque sorpresa posible (penalización moral)
- Periódico in-game anuncia conflictos

---

## 🕵️ INTELIGENCIA (ESPIONAJE)

### Operaciones de Espías:
| Operación | Efecto | Costo |
|-----------|--------|-------|
| Reconocimiento | Ver ejércitos | Bajo |
| Sabotaje | Dañar edificios | Alto |
| Propaganda | Bajar moral | Medio |
| Asesinato | Eliminar oficial | Muy Alto |

### Contra-inteligencia:
- Fortificaciones ocultan tropas
- Espías pueden ser capturados
- Inversión en defensa de inteligencia

---

## 💹 MERCADO Y COMERCIO

### Stock Market:
- **VENDER**: Poner recursos a la venta
- **COMPRAR**: Adquirir de otros jugadores
- **SOLICITAR**: Pedir recursos a precio definido
- Precios dinámicos por oferta/demanda

### Comercio de Alianza:
- Precios preferenciales entre aliados
- Transferencias directas
- Préstamos de recursos

---

## 😊 SISTEMA DE MORAL

### Factores que Afectan:
| Factor | Efecto |
|--------|--------|
| Recursos abundantes | +Moral |
| Escasez | -Moral |
| Victoria militar | +Moral |
| Derrota | -Moral |
| Ocupación | -Moral |
| Guarnición presente | +Estabilidad |

### Consecuencias de Moral Baja (<30%):
- Rebeliones posibles
- Insurgentes atacan guarnición
- Provincia puede unirse a otro país
- Producción mínima

---

## 🏆 VICTORIA

### Condiciones:
1. **Dominación**: Controlar 60% del mapa
2. **Puntos**: Alcanzar puntos objetivo
3. **Eliminación**: Ser el último en pie
4. **Alianza**: Victoria compartida

### Sistema de Puntos:
- +1 por provincia controlada
- +5 por capital enemiga
- +2 por edificio nivel 3
- Bonus por duración de control

---

## ⏱️ TIMELINE DEL JUEGO

### Early Game (Días 0-10):
- Construir reclutamiento en todas las provincias
- Expandir con infantería
- Asegurar recursos estratégicos
- Formar alianzas tempranas

### Mid Game (Días 10-30):
- Producir tanques y artillería
- Establecer aeródromos y puertos
- Guerras regionales
- Consolidar economía

### Late Game (Días 30+):
- Producción masiva
- Guerras mundiales
- Carrera por victoria

---

## 📱 SOPORTE MOBILE

### Gestos Táctiles:
- **1 dedo**: Arrastrar mapa
- **2 dedos**: Pinch zoom
- **Tap**: Seleccionar
- **Long press**: Menú contextual

### UI Responsiva:
- Botones más grandes en mobile
- Paneles colapsables
- Orientación landscape/portrait

---

## 🎨 ESTÉTICA WW2

### Paleta de Colores:
- Verde oliva militar
- Marrón tierra
- Gris acero
- Amarillo arena (desierto)
- Blanco nieve (invierno)

### Mapa Estilo:
- Topográfico militar
- Rutas y fronteras claras
- Iconografía militar WW2

---

## 🔧 CARACTERÍSTICAS PREMIUM

### Goldmarks (Moneda Premium):
- Acelerar construcciones
- Revelar ejércitos ocultos
- Comprar recursos de emergencia
- Skins de unidades

---

*Documento de diseño v1.0 - World Conflict 1945*
*Basado en mecánicas de Supremacy 1914, adaptado a WW2*
