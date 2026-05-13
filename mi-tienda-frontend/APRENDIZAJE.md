# 🎓 Aprendizaje: Migración Django → Stack Moderno

## Lección 1: Creación del proyecto Frontend

### ¿Qué hicimos?
Creamos un proyecto React + TypeScript con Vite, el build tool moderno.

### Comando ejecutado
```bash
npm create vite@latest mi-tienda-frontend -- --template react-ts
```

### ¿Qué es cada cosa?

| Archivo/Carpeta | ¿Qué es? | ¿Para qué sirve? |
|---|---|---|
| `src/` | **Código fuente** | Todo lo que escribimos va acá |
| `src/main.tsx` | **Punto de entrada** | Es el "index.html moderno". Arranca la app de React |
| `src/App.tsx` | **Componente raíz** | El primer componente que se renderiza. Acá empezamos a construir |
| `src/index.css` | **Estilos globales** | CSS que afecta a toda la app |
| `public/` | **Archivos estáticos** | Imágenes, favicon, etc. |
| `package.json` | **"Recetario"** | Lista todas las dependencias (librerías) que usa el proyecto |
| `vite.config.ts` | **Configuración de Vite** | Cómo se compila y sirve la app |
| `tsconfig.json` | **Configuración de TypeScript** | Cómo TypeScript verifica nuestro código |

---

## Lección 2: Instalación de Tailwind CSS

### ¿Qué es Tailwind CSS?
Es una librería que te permite **diseñar directamente en el HTML**. En lugar de escribir CSS aparte como hacías en Django:

**Antes (Django):**
```html
<!-- template.html -->
<div class="mi-clase">Hola</div>
```

```css
/* styles.css */
.mi-clase { background: blue; padding: 16px; }
```

**Con Tailwind:**
```html
<div class="bg-blue-500 p-4">Hola</div>
```
> `bg-blue-500` = background azul, `p-4` = padding de 16px

### Comando ejecutado
```bash
npm install -D tailwindcss @tailwindcss/vite
```

- `-D` = dependencia de desarrollo (solo se usa al programar, no en producción)

### ¿Qué cambiamos?

**1. `vite.config.ts`** → Agregamos el plugin de Tailwind:
```ts
import tailwindcss from '@tailwindcss/vite'
// ...
plugins: [react(), tailwindcss()],
```
Esto le dice a Vite: "cuando compiles, también procesá las clases de Tailwind".

**2. `src/index.css`** → Reemplazamos TODO el CSS por:
```css
@import "tailwindcss";
```
Esta línea le dice al navegador: "cargá todas las utilidades de Tailwind".

**3. `src/App.tsx`** → Lo simplificamos a un componente mínimo:
```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white">
        🚀 Mi Tienda Moderna
      </h1>
    </div>
  )
}
```

### Explicación de las clases Tailwind usadas:
| Clase | Significado | Equivalente CSS |
|---|---|---|
| `min-h-screen` | Altura mínima = toda la pantalla | `min-height: 100vh` |
| `flex` | Layout flexible | `display: flex` |
| `items-center` | Centrar verticalmente | `align-items: center` |
| `justify-center` | Centrar horizontalmente | `justify-content: center` |
| `bg-gray-900` | Fondo gris oscuro | `background-color: #111827` |
| `text-4xl` | Texto tamaño 4 | `font-size: 2.25rem` |
| `font-bold` | Negrita | `font-weight: 700` |
| `text-white` | Texto blanco | `color: white` |

---

## Lecciones 3 y 4: Instalación y configuración de shadcn/ui

### ¿Qué es shadcn/ui?
Es una **colección de componentes** (botones, inputs, modales, etc.) que podés copiar a tu proyecto. No es una librería que se instala como tal, sino que **agrega el código fuente** de cada componente para que puedas personalizarlo.

### Comandos ejecutados
```bash
# Inicializar shadcn
npx shadcn@latest init -d

# Instalar dependencias necesarias
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot

# Agregar componente Button
npx shadcn@latest add button -y
```

### Archivos creados/modificados

#### `components.json` (raíz del proyecto)
Es el archivo de configuración de shadcn. Define:
- `aliases.components`: `@/components` → dónde vivirán los componentes
- `aliases.utils`: `@/lib/utils` → dónde está la función `cn()`
- `style`: el estilo visual de los componentes
- `iconLibrary`: `lucide` → librería de iconos que usaremos

#### `src/lib/utils.ts`
Función utilitaria `cn()` que combina clases de Tailwind:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
- `clsx`: une varias clases condicionalmente
- `tailwind-merge`: resuelve conflictos entre clases de Tailwind (ej: si ponés `bg-red-500` y `bg-blue-500`, se queda con la última)

#### `src/components/ui/button.tsx`
Componente Button de shadcn. Ofrece variantes:
- `default` → botón principal (ej: "Comprar ahora")
- `secondary` → botón secundario (ej: "Ver más")
- `outline` → botón con borde (ej: "Cancelar")
- `ghost` → botón sin fondo
- `destructive` → botón de peligro (ej: "Eliminar")
- `link` → botón con estilo de link

#### `vite.config.ts` — alias `@/`
Configuramos el alias `@/` para que apunte a `src/`:
```ts
resolve: {
  alias: { '@': path.resolve(__dirname, './src') },
}
```
Esto permite imports como `import { Button } from "@/components/ui/button"` en lugar de rutas relativas como `"../../components/ui/button"`.

#### `tsconfig.app.json` — paths para TypeScript
Agregamos `paths` para que TypeScript entienda el alias `@/`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] },
"ignoreDeprecations": "6.0"
```

---

## 🐛 Error común: "Failed to resolve import" en dev server

### Síntoma
```bash
[plugin:vite:import-analysis] Failed to resolve import "@radix-ui/react-slot"
```
El paquete está instalado (está en `package.json` y `node_modules`) pero Vite no lo encuentra en desarrollo.

### Causa
Vite guarda una **caché de módulos** en `node_modules/.vite/` para acelerar el dev server. A veces esta caché se corrompe o no detecta que se instaló un nuevo paquete.

### Solución
```bash
# 1. Detener el servidor (Ctrl + C)
# 2. Limpiar la caché de Vite
Remove-Item -Recurse -Force node_modules/.vite

# 3. Reiniciar el servidor
npm run dev
```

### ¿Por qué pasa?
- `npm run build` siempre funciona porque hace una compilación limpia desde cero
- `npm run dev` usa una caché para ser más rápido, pero a veces esa caché se desactualiza

---

---

## Lección 5: Skills de OpenCode — python-fastapi

### ¿Qué es un Skill?

Un skill es un conjunto de instrucciones reutilizables en Markdown (`SKILL.md`) que le enseña a OpenCode a hacer tareas específicas. Los skills se cargan automáticamente según el contexto.

### ¿Dónde se instalan los skills?

| Ruta | Ámbito |
|---|---|
| `.opencode/skills/<nombre>/SKILL.md` | Solo este proyecto |
| `.agents/skills/<nombre>/SKILL.md` | Solo este proyecto (compatible) |
| `~/.config/opencode/skills/<nombre>/SKILL.md` | Global (todos los proyectos) |

### Skill instalado: python-fastapi

**Origen:** [Smithery](https://smithery.ai/skill/0xkynz/python-fastapi)

**Comando ejecutado:**
```bash
npx -y smithery skill add 0xkynz/python-fastapi --agent opencode
```

**¿Qué pasó?**
1. Smithery descargó el skill desde su repositorio
2. Lo copió a `.agents/skills/python-fastapi/` (nivel proyecto)
3. El archivo `SKILL.md` tiene **709 líneas** de instrucciones

**Tecnologías que cubre el skill:**
- Python 3.12+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2
- `uv` como gestor de paquetes (Rust-based, rápido)
- PostgreSQL (dev con SQLite), Alembic para migraciones
- pytest, ruff, estructura modular por dominio

**¿Para qué sirve?** Cuando trabajemos en el backend de la tienda, OpenCode podrá usar este skill para generar código FastAPI con las mejores prácticas: estructura de carpetas, modelos SQLAlchemy, endpoints, pruebas, etc.

### 📁 ¿Dónde se guardan los skills?

Hay **dos carpetas** donde OpenCode busca skills:

| Ruta | Quién la crea |
|---|---|
| `.agents/skills/<nombre>/` | **Smithery** (al instalar con `npx smithery skill add`) |
| `.opencode/skills/<nombre>/` | Manualmente (creada a mano) |

**Decisión:** Usamos siempre `.agents/skills/`. Es la ruta que usa Smithery por defecto y así centralizamos todo en un solo lugar.

> 💡 **¿Por qué Smithery usa `.agents/` y no `.opencode/`?** Porque Smithery está diseñado para múltiples agentes de IA (OpenCode, Cursor, Windsurf, etc.), no solo para OpenCode. El nombre `.agents/` es genérico para que cualquier agente pueda encontrar los skills. OpenCode también revisa esta carpeta por compatibilidad.

> ⚠️ **Importante:** Un skill no se "activa" automáticamente. OpenCode lo carga solo cuando el contexto lo requiere. Por ejemplo, `python-fastapi` se cargará cuando trabajemos en el backend con FastAPI.

---

---

## Lección 6 (b): Reglas del proyecto — AGENTS.md

### ¿Qué es AGENTS.md?

Es un archivo que OpenCode **lee automáticamente** al iniciar una sesión. Contiene instrucciones permanentes para la IA sobre cómo comportarse en este proyecto.

### Archivos de reglas creados

| Archivo | ¿Cuándo lo lee la IA? | ¿Qué contiene? |
|---|---|---|
| `AGENTS.md` | **Siempre** (se carga solo) | Índice: dice qué archivos leer según el contexto |
| `SECURITY.md` | **Siempre** (indicado en AGENTS.md) | Seguridad: validación, secrets, headers... |
| `FRONTEND_RULES.md` | Solo cuando tocamos frontend | Diseño: SaaS aesthetic, dark mode, accesibilidad... |
| `BACKEND_RULES.md` | Solo cuando tocamos backend | Código: FastAPI async, SQLAlchemy 2, JWT... |

### ¿Por qué separados en lugar de uno solo?

Para **ahorrar contexto**. Si trabajas en frontend, la IA no gasta espacio cargando reglas de backend que no necesita. Pero `SECURITY.md` siempre aplica, así que se carga siempre.

### Las reglas en detalle

**FRONTEND_RULES.md:**
```
- premium SaaS aesthetic
- proper spacing
- subtle motion
- accessibility
- dark mode
- responsive
- reusable components
- evitar "AI slop" (código genérico sin personalidad)
```

**BACKEND_RULES.md:**
```
- async FastAPI
- SQLAlchemy 2 (async)
- Pydantic v2
- repository pattern
- service layer
- typed responses
- JWT auth
- rate limiting
- structured logging
- env validation
```

**SECURITY.md (INDEV Security Standards):**
```
- validate all inputs
- sanitize outputs
- use typed schemas
- never trust client input
- use rate limiting
- protect against SSRF
- prevent prompt injection
- use parameterized queries
- store secrets in env vars
- never expose API keys
- secure JWT handling
- implement RBAC when needed
- use secure cookies
- use async-safe database access
- implement request logging
- validate uploads
- limit payload size
- apply OWASP Top 10 practices
```

### Dato importante

Los archivos de reglas NO se cargan solos (excepto `AGENTS.md`). La IA debe **leerlos activamente**. Por eso `AGENTS.md` le dice explícitamente: "Cuando trabajes en frontend, lee FRONTEND_RULES.md".

> 💡 Imagínalo como un semáforo: `AGENTS.md` es la luz que le dice a la IA qué camino tomar.

---

## Lección 6 (c): Skill OWASP Security — Seguridad profesional

### ¿Qué es?

Skill de seguridad que cubre OWASP Top 10:2025, ASVS 5.0, LLM Top 10 y seguridad para agentes AI. A diferencia de `SECURITY.md` (que son reglas cortas), este skill tiene **~292 líneas** con ejemplos de código, checklists y patrones seguros.

### ¿Qué incluye?

| Sección | Contenido |
|---|---|
| OWASP Top 10:2025 | Las 10 vulnerabilidades más críticas con prevención |
| ASVS 5.0 | Estándar de verificación de seguridad (3 niveles) |
| LLM Top 10 2025 | Seguridad para apps con IA (prompt injection, data poisoning...) |
| Agentic AI 2026 | Seguridad para agentes autónomos |
| Peculiaridades por lenguaje | 20 lenguajes con sus pitfalls específicos |
| Code Review Checklist | Lista para revisar código manualmente |
| Patrones seguros | Ejemplos SQL injection, auth, errores, etc. |

### Instalación

```powershell
# Crear carpeta
New-Item -ItemType Directory -Force -Path ".agents/skills/owasp-security"

# Descargar skill
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/agamm/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md" -OutFile ".agents/skills/owasp-security/SKILL.md"
```

### ¿Cómo se activa?

Se activa automáticamente cuando el contexto involucra seguridad: auth, validación, cifrado, revisión de código, etc.

### Skills instalados (final)

```
.agents/skills/
├── python-fastapi/    ← Backend: FastAPI, SQLAlchemy, pytest
├── ui-ux-pro-max/     ← Frontend: diseño profesional UI/UX
└── owasp-security/    ← Seguridad: OWASP, ASVS, LLM security
```

---

### ¿Qué es?

UI/UX Pro Max es un skill de terceros que le enseña a OpenCode a **diseñar profesionalmente**. En lugar de que tú decidas colores, fuentes, espaciados, etc., el skill los elige por ti basándose en:

- **Tipo de producto**: SaaS, e-commerce, landing page, dashboard, portfolio...
- **Estilo**: minimal, playful, professional, elegant, dark mode...
- **Industria**: healthcare, fintech, gaming, education...
- **Stack tecnológico**: React, Vue, Next.js, HTML+Tailwind...

### ¿Qué incluye?

| Recurso | Cantidad |
|---|---|
| Estilos predefinidos | 67 |
| Paletas de colores | 96 |
| Pares tipográficos | 57 |
| Guías UX | 99 |
| Tipos de gráficos | 25 |
| Stacks soportados | 13 (React, Vue, Svelte, Flutter, SwiftUI...) |

### Instalación

```bash
# 1. Instalar el CLI globalmente
npm install -g uipro-cli

# 2. Ejecutar en la raíz del proyecto
uipro init --ai opencode

# 3. Se crea en .opencode/skills/ui-ux-pro-max/
#    Lo movimos manualmente a .agents/skills/ui-ux-pro-max/ (nuestra convención)

# 4. Verificar que Python 3.12+ está instalado (el skill lo usa para búsquedas)
python --version
```

### ¿Cómo se usa?

Cuando pidas algo como _"Haz una landing page para una tienda de ropa"_, OpenCode activará este skill y ejecutará un **motor de búsqueda en Python** que:

1. **Analiza** tu pedido (tipo de producto, industria, keywords)
2. **Busca** en 5 bases de datos CSV en paralelo (producto, estilo, color, typografía, landing)
3. **Aplica reglas de razonamiento** para elegir la mejor combinación
4. **Devuelve** un sistema de diseño completo: paleta, tipografía, estilos, anti-patrones a evitar

El motor se ejecuta con:

```bash
python3 scripts/search.py "e-commerce ropa urbana juvenil" --design-system -p "Urban Wear"
```

### Skills instalados actualmente

```
.agents/
└── skills/
    ├── python-fastapi/     ← Backend (FastAPI, SQLAlchemy, pytest)
    └── ui-ux-pro-max/      ← Frontend/UI (diseño profesional)
```

### ⚠️ Diferencia clave entre los dos skills

| Skill | ¿Cuándo se activa? | ¿Qué hace? |
|---|---|---|
| **python-fastapi** | Cuando trabajamos en backend (modelos, endpoints, BD) | Genera código Python con buenas prácticas |
| **ui-ux-pro-max** | Cuando trabajamos en frontend (componentes, layouts, estilos) | Elige colores, fuentes, espaciados, validación de diseño |

> 💡 No compiten por contexto porque se activan en momentos distintos.

---

## Lección 6 (d): Reglas actualizadas — Skills obligatorios

Actualizamos todos los archivos de reglas para **obligar** a la IA a usar los skills:

```markdown
AGENTS.md:
  "Must load and follow the owasp-security skill"
  "Must load and use the ui-ux-pro-max skill (run search.py --design-system)"
  "Must load and follow the python-fastapi skill"

FRONTEND_RULES.md:
  "Obligatorio: cargar y seguir el skill ui-ux-pro-max antes de escribir código frontend"
  + "usar CSS variables del tema shadcn (no colores hardcodeados)"
  + "seguir el sistema de diseño generado por el skill"

BACKEND_RULES.md:
  "Obligatorio: cargar y seguir el skill python-fastapi"

SECURITY.md:
  "Obligatorio: cargar y seguir el skill owasp-security"
```

**Por qué es importante:** El error más común es que la IA escriba código de memoria ignorando el skill. Ahora las rules lo exigen explícitamente.

---

## Lección 6 (e): Script de instalación completo

Para usar en el próximo proyecto, script copypasteable:

```powershell
# Archivos de reglas (crear en la raíz del proyecto)
# AGENTS.md, FRONTEND_RULES.md, BACKEND_RULES.md, SECURITY.md

# Skills
npx -y smithery skill add 0xkynz/python-fastapi --agent opencode
npx uipro-cli init --ai opencode --force

New-Item -ItemType Directory -Force -Path ".agents/skills/owasp-security"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/agamm/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md" -OutFile ".agents/skills/owasp-security/SKILL.md"
```

---

## Lección 7: Layout base de la tienda

### ¿Qué construimos?

```shell
src/
├── types/
│   └── product.ts              ← Interface Product + mock data (6 productos)
├── components/
│   ├── ui/                     ← shadcn/ui (button, card, input, badge, sheet, separator)
│   └── layout/
│       ├── Header.tsx           ← Navbar sticky, logo, búsqueda, carrito
│       ├── Hero.tsx             ← Sección principal con CTA
│       ├── ProductCard.tsx      ← Card de producto (imagen, precio, rating, descuento)
│       └── Footer.tsx           ← Multi-columna con links
├── App.tsx                      ← Composicion del layout completo
└── index.css                    ← @import "tailwindcss"
```

### Componentes shadcn agregados

Usamos `npx shadcn@latest add` para agregar:

- `card` → contenedor de producto
- `input` → búsqueda en Header
- `badge` → descuentos y contador carrito
- `sheet` → panel lateral del carrito
- `separator` → divisiones visuales
- `button` → ya existía (se actualizó a v4)

### ⚠️ Cambio importante: shadcn v4 usa @base-ui/react

shadcn/ui actualizó su capa subyacente de **Radix UI → Base UI**. Esto cambia:

| Antes (v3) | Ahora (v4) |
|---|---|
| `@radix-ui/react-dialog` | `@base-ui/react/dialog` |
| `asChild` prop | `render` prop |
| `Overlay` | `Backdrop` |

Ejemplo del cambio:
```tsx
// Antes (shadcn v3)
<SheetTrigger asChild>
  <Button>Click</Button>
</SheetTrigger>

// Ahora (shadcn v4)
<SheetTrigger render={<Button variant="ghost" size="icon" />}>
  <ShoppingCart />
</SheetTrigger>
```

### 📁 Error con la instalación de shadcn

Cuando ejecutamos `npx shadcn@latest add`, los archivos se crearon en una carpeta `@/components/ui/` en la **raíz del proyecto** en lugar de `src/components/ui/`. Hubo que moverlos manualmente.

### Estructura visual

```
┌─────────────────────────────────────────────────┐
│ Header (sticky, glassmorphism, backdrop-blur)   │
│ [Logo] [Nav] [Buscar...] [🛒 3]                 │
├─────────────────────────────────────────────────┤
│ Hero                                             │
│ "Tecnología que impulsa tu mundo"                │
│ [Ver productos] [Ofertas del mes]                │
├─────────────────────────────────────────────────┤
│ Productos destacados                             │
│ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │ Card │ │ Card │ │ Card │                      │
│ └──────┘ └──────┘ └──────┘                      │
├─────────────────────────────────────────────────┤
│ Footer                                           │
│ [Logo] [Productos] [Soporte] [Legal]             │
└─────────────────────────────────────────────────┘
```

### Decisiones de diseño (basadas en FRONTEND_RULES.md)

| Regla | Cómo se aplicó |
|---|---|
| **premium SaaS aesthetic** | Glassmorphism en Header, gradientes, sombras sutiles |
| **dark mode** | `bg-gray-950`, `border-white/5`, `text-white` |
| **proper spacing** | Sistema consistente: `p-4`, `gap-6`, `py-24` |
| **subtle motion** | `transition-all`, `hover:scale-105`, `hover:bg-white/5` |
| **responsive** | Grid `sm:grid-cols-2 lg:grid-cols-3`, header adaptativo |
| **reusable components** | `ProductCard` recibe `product` prop, layout components importables |
| **accessibility** | `sr-only`, roles semánticos, `<header>`, `<main>`, `<footer>` |

---

## Lección 7 (b): Aplicando el skill UI/UX Pro Max — Liquid Glass

### El workflow correcto

El skill no se "activa solo". Hay que ejecutar su motor de búsqueda:

```powershell
# 1. Generar sistema de diseño
python .agents/skills/ui-ux-pro-max/scripts/search.py "e-commerce technology electronics premium" --design-system -p "Market"

# 2. Persistirlo (crea design-system/MASTER.md)
python .agents/skills/ui-ux-pro-max/scripts/search.py "e-commerce technology electronics premium" --design-system --persist -p "Market"

# 3. Búsquedas detalladas por dominio
python scripts/search.py "animation accessibility z-index loading" --domain ux
python scripts/search.py "aria focus keyboard semantic" --domain web
python scripts/search.py "e-commerce luxury dark" --stack shadcn
```

### Diseño generado: Liquid Glass

| Elemento | Resultado |
|---|---|
| **Estilo** | Liquid Glass — vidrio líquido, morphing, blur dinámico |
| **Paleta** | Primary `#1C1917`, Secondary `#44403C`, CTA `#CA8A04` (oro) |
| **Tipografía** | Cormorant (títulos) + Montserrat (cuerpo) — Google Fonts |
| **Efectos clave** | Aberración cromática, morphing SVG, backdrop-blur, transiciones 200-300ms |
| **Anti-patrones** | No emojis como iconos, no colores vibrantes, no layout-shifting hovers |

### Cambios importantes que aprendí:

**1. CSS variables con @theme (Tailwind v4)**
```css
@theme {
  --color-primary: hsl(42, 96%, 40%);
  --color-primary-foreground: hsl(30, 6%, 10%);
  /* ... más variables */
}
```
Esto genera automáticamente utilidades como `bg-primary`, `text-primary`, `border-primary`.

**2. shadcn v4 usa @base-ui/react (no Radix)**
- `asChild` → `render` prop
- `Overlay` → `Backdrop`
- Instalar: `npm install @base-ui/react`

**3. Errores comunes con Vite**
- `Failed to resolve import "@base-ui/react/dialog"` → limpiar `node_modules/.vite`
- `npm run build` funciona, `npm run dev` no → es la caché de Vite

**4. prefers-reduced-motion**
```tsx
// El MorphingBackground se oculta si el usuario prefiere menos movimiento
<div className="motion-reduce:hidden">
```
Esto es accesibilidad real, no solo estética.

**5. Floating Navbar (recomendación del skill)**
```tsx
<header className="sticky top-4 mx-auto max-w-7xl rounded-2xl border ...">
```
El navbar flota con separación (`top-4`) en lugar de pegarse al borde (`top-0`). Se ve más premium.

**6. Chromatic aberration en títulos**
```css
[text-shadow:_2px_2px_0_rgba(202,138,4,0.15),_-2px_-2px_0_rgba(59,130,246,0.1)]
```
Sombra de texto dorada en una dirección + azul en la opuesta = efecto de "aberración cromática".

**7. Pre-Delivery Checklist del skill**
Cada componente debe pasar:
- [ ] Sin emojis como iconos (usar Lucide/Heroicons)
- [ ] cursor-pointer en todo elemento clickable
- [ ] Hover states con transiciones suaves (150-300ms)
- [ ] Focus states visibles para teclado
- [ ] prefers-reduced-motion respetado
- [ ] Responsive: 375px, 768px, 1024px, 1440px

---

## Lección 8: Backend con FastAPI + SQLAlchemy 🐍⚡

### ¿Qué construimos? 🏗️

Un backend REST API usando el skill `python-fastapi`. Estructura modular por feature (dominio):

```
backend/
├── pyproject.toml              ← Dependencias (como package.json)
├── .env                         ← Variables de entorno
├── src/
│   └── app/
│       ├── main.py              ← Punto de entrada de FastAPI
│       ├── config.py            ← Configuración (.env)
│       ├── database.py          ← Conexión a BD SQLite
│       ├── models/              ← Base de datos (Base ORM)
│       │   └── __init__.py
│       ├── core/                ← Utilidades compartidas
│       ├── features/
│       │   ├── products/        ← Feature: Productos
│       │   │   ├── models.py    ← Tabla SQL "products"
│       │   │   ├── schemas.py   ← Esquemas Pydantic (validación)
│       │   │   ├── repository.py← Acceso a BD (consultas)
│       │   │   ├── services.py  ← Lógica de negocio
│       │   │   └── api.py       ← Endpoints HTTP
│       │   └── cart/            ← Feature: Carrito
│       │       ├── models.py
│       │       ├── schemas.py
│       │       ├── repository.py
│       │       ├── services.py
│       │       └── api.py
└── tests/
```

### 🔑 Conceptos nuevos desde Django

| Concepto Django | Equivalente en este proyecto |
|---|---|
| `models.py` (ORM) | `features/<nombre>/models.py` (SQLAlchemy 2.0 async) |
| `views.py` | `features/<nombre>/api.py` (FastAPI router) |
| `serializers.py` | `features/<nombre>/schemas.py` (Pydantic v2) |
| `urls.py` | `router = APIRouter()` + `app.include_router()` |
| `settings.py` | `config.py` (pydantic-settings con .env) |
| `manage.py runserver` | `uvicorn app.main:app --reload` |
| `pip install` | `pip install -e ".[dev]"` |
| WSGI (sincrónico) | ASGI / async (asincrónico) |

### 📦 Dependencias instaladas

```toml
# pyproject.toml
dependencies = [
    "fastapi",           # El framework (como Django REST)
    "uvicorn",           # Servidor ASGI (como runserver pero async)
    "sqlalchemy[asyncio]", # ORM async (como Django ORM pero moderno)
    "aiosqlite",         # Driver SQLite async
    "pydantic",          # Validación de datos (como serializers)
    "pydantic-settings", # Config con .env tipada
]
```

### 🚀 Cómo se corre

```powershell
# 1. Ir a la carpeta backend
cd backend

# 2. Crear entorno virtual (solo primera vez)
python -m venv .venv

# 3. Instalar dependencias (solo primera vez)
.venv\Scripts\pip install -e ".[dev]"

# 4. Iniciar servidor
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

El flag `--reload` hace que el servidor se reinicie solo cuando cambias código (como el hot-reload de Vite).

### 🧱 Arquitectura por capas (Repository Pattern)

Cada feature sigue 4 capas:

```
Cliente HTTP → API (api.py) → Service (services.py) → Repository (repository.py) → BD
```

**¿Por qué tantas capas?** Separar responsabilidades:

| Capa | Responsabilidad | ¿Qué pasaría si no existiera? |
|---|---|---|
| **api.py** | Recibir request, devolver response HTTP | El código HTTP estaría mezclado con lógica |
| **services.py** | Lógica de negocio (ej: "no agregar si ya hay 10 items") | La lógica se replica en cada endpoint |
| **repository.py** | Consultas a la BD | Cambiar de SQLite a PostgreSQL implicaría cambiar todo |
| **models.py** | Definición de la tabla SQL | No hay types, errores en runtime |

### 📦 Endpoints creados

| Método | Ruta | ¿Qué hace? | Código |
|---|---|---|---|
| `GET` | `/api/products` | Lista todos los productos | `products/api.py` |
| `GET` | `/api/products/1` | Producto individual por ID | `products/api.py` |
| `GET` | `/api/cart` | Lista items del carrito | `cart/api.py` |
| `POST` | `/api/cart` | Agrega producto al carrito | `cart/api.py` |
| `DELETE` | `/api/cart/1` | Elimina item del carrito | `cart/api.py` |

### 🌱 Seed Data (datos iniciales)

En `main.py`, dentro del `lifespan`, al iniciar la app:

```python
# Si la tabla products está vacía, inserta 3 productos
result = await session.execute(select(Product).limit(1))
if not result.scalar_one_or_none():
    products = [
        Product(name="Auriculares Pro X", price=249.99, ...),
        Product(name="Teclado Mecánico RGB", price=179.99, ...),
        Product(name="Mouse Inalámbrico", price=89.99, ...),
    ]
    session.add_all(products)
    await session.commit()
```

Esto es el **lifespan** de FastAPI — código que corre al iniciar y al cerrar la app.

### 🔌 Conexión Frontend → Backend

**Vite Proxy:** En vez de poner `http://localhost:8000` en cada fetch, configuramos un proxy en `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // Backend
      changeOrigin: true,
    },
  },
},
```

Esto hace que `fetch('/api/products')` en el frontend se redirija automáticamente al backend. Así en producción solo cambias el target.

**Servicio API en frontend:** `src/lib/api.ts` — una carpeta `lib/` para funciones que llaman al backend:

```ts
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products')
  if (!res.ok) throw new Error("Error al cargar productos")
  return res.json()
}
```

### 🛒 Flujo del carrito completo

```
1. Usuario ve producto → hace click en "Comprar"
2. ProductCard llama a onAddToCart(product.id)
3. App.tsx llama a addToCart(product_id) → POST /api/cart
4. Backend guarda en tabla cart_items (SQLite)
5. App.tsx recarga el carrito → GET /api/cart
6. Header muestra cantidad en badge + items en sheet
```

### ⚠️ Diferencia clave: snake_case vs camelCase

El backend devuelve:
```json
{"id": 1, "original_price": 349.99}
```

El frontend espera:
```ts
interface Product { id: number; original_price: number | null }
```

**NO** usamos camelCase en el frontend — igualamos el formato del backend para mantenerlo simple. En proyectos grandes se usa `serialization_alias` de Pydantic para convertir automáticamente.

### 🧪 Probar la API directamente

```powershell
# Obtener productos
curl http://localhost:8000/api/products

# Agregar al carrito
curl -X POST http://localhost:8000/api/cart -H "Content-Type: application/json" -d "{\"product_id\": 1, \"quantity\": 1}"

# Ver carrito
curl http://localhost:8000/api/cart

# Ver documentación automática (OpenAPI/Swagger)
# Abrir en navegador: http://localhost:8000/docs
```

### 🗄️ SQLite

Usamos SQLite (archivo `market.db`) para desarrollo. Es como Django con `db.sqlite3`. La BD se crea automáticamente al iniciar la app por primera vez.

**Para reiniciar desde cero:**
```powershell
Remove-Item backend/market.db
# Luego reiniciar el servidor
```

---

## Lección 8.5: Imágenes reales y marketing en el frontend 🎨📈

### 📸 De placeholders a imágenes reales

Las imágenes de productos son el factor #1 que hace que un sitio se vea premium vs genérico. Cambiamos:

| Antes | Ahora |
|---|---|
| `placehold.co` (genérico) | `images.unsplash.com` (fotos reales) |
| Colores planos | Fotos de alta calidad |
| Sin textura visual | Imágenes que venden |

**Cómo elegir imágenes que vendan (neuromarketing visual):**

| Principio | Aplicación en la tienda |
|---|---|
| **Calidad percibida** | Fotos profesionales, iluminación studio |
| **Contexto de uso** | Auriculares en entorno real, monitor en escritorio |
| **Detalle del producto** | Imágenes que muestran texturas, materiales, luces RGB |
| **Consistencia estética** | Mismo estilo fotográfico en todos los productos |

**Las URLs de Unsplash:**

```python
image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
```

- `w=600` → ancho 600px (balance calidad/velocidad)
- `q=80` → compresión 80% (buena calidad, archivo liviano)
- `?fm=webp` se puede agregar para formato moderno

### 🧠 Neuromarketing aplicado

| Técnica | Dónde se aplicó | Cómo funciona |
|---|---|---|
| **Prueba social** | "50K+ clientes satisfechos" en Hero | La gente sigue lo que otros hacen (sesgo de manada) |
| **Stats bar** | "50K+ • 98% • 24/7 • 4.9" | Números concretos = confianza |
| **Trust badges** | Envío gratis, garantía, devolución, soporte | Reduce la ansiedad de compra |
| **Urgencia** | "Envío 24h" repetido | Crea sensación de inmediatez |
| **Garantía** | "2 años garantía" en CTA secundario | Elimina el riesgo percibido |
| **Copy premium** | "Eleva tu experiencia tecnológica" | Apela a aspiraciones, no a necesidades |
| **Precio tachado** | Precio original tachado + descuento | Anclaje: el primer precio que ves es referencia |
| **Rating estrellas** | Estrellas + puntuación en cards | Validación social por producto |

### 🎯 Hero rediseñado (3 versiones)

| Versión | Problema | Solución |
|---|---|---|
| v1 (genérica) | Centrado, sin imagen, parecía caja de IA | Left-aligned, más premium |
| v2 (caja/box) | rounded-3xl con bordes parecía "cubo IA" | Full-width, sin bordes |
| v3 (actual) | Hero de ancho completo con imagen de fondo sutil | 90vh, imagen Unsplash al 10%, izquierda alineado |

**Lección importante para novato:** Un Hero centrado funciona para landing pages minimalistas. Un Hero con contenido a la izquierda + imagen se ve más "pro" porque sigue la jerarquía visual natural (de izquierda a derecha).

### 🛒 Carrito funcional (no solo visual)

El carrito ahora TIENE LÓGICA:

```
┌─ Sheet Carrito ─────────────────────┐
│                                     │
│  [Producto]       [Precio]  [🗑️]   │
│  [Producto]       [Precio]  [🗑️]   │
│                                     │
│  ─────────────────────────────────  │
│  Total                    $519.97   │
│                                     │
│  [💳 Finalizar compra]             │
└─────────────────────────────────────┘
```

- **Badge** en el icono muestra cantidad exacta
- **Sheet** lista items con nombre, precio, cantidad y botón eliminar
- **Total** calculado automáticamente
- **Finalizar compra** simula pedido exitoso (en producción iría a pasarela de pago)

### 📁 Componentes nuevos agregados

| Componente | Archivo | ¿Qué hace? |
|---|---|---|
| `StatsBar` | `components/layout/StatsBar.tsx` | Barra de estadísticas (50K+, 98%, etc.) |
| `TrustBadges` | `components/layout/TrustBadges.tsx` | Grid de 4 badges de confianza |
| `MorphingBackground` | `components/layout/MorphingBackground.tsx` | SVG animado de fondo con morphing |

### 🧩 Conexión App.tsx final

El componente raíz ahora:
1. Carga productos del backend (`fetchProducts`)
2. Carga carrito del backend (`fetchCart`)
3. Maneja agregar/eliminar items del carrito
4. Calcula total del carrito
5. Pasa `cartItems`, `totalPrice` y `onRemoveFromCart` al Header
6. Renderiza Hero → StatsBar → Productos → TrustBadges → Footer

### 🔁 Flujo completo de la app

```
Navegador → localhost:5173
  │
  ├── Vite proxy (/api → localhost:8000)
  │     │
  │     └── FastAPI (uvicorn)
  │           │
  │           └── SQLAlchemy → SQLite (market.db)
  │
  └── React
        ├── App.tsx (orquestador)
        ├── Header (nav + carrito)
        ├── Hero (marketing + CTA)
        ├── ProductCard (6 productos)
        ├── StatsBar (confianza)
        ├── TrustBadges (seguridad)
        └── Footer (links)
```

---

---

## Lección 9: Autenticación JWT — Registro y Login 🔐

### ¿Qué es JWT?

**JWT** (JSON Web Token) es un token que prueba que un usuario está autenticado. Funciona así:

```
1. Usuario envía email + contraseña → Servidor verifica → Devuelve JWT
2. Cliente guarda el JWT (en localStorage)
3. Cliente envía JWT en cada request (header "Authorization: Bearer <token>")
4. Servidor verifica el JWT → sabe quién es el usuario
```

**¿Por qué JWT y no sesiones como Django?**
- Django usa sesiones en servidor (BD o redis)
- JWT es "stateless" — el servidor NO guarda la sesión, solo verifica la firma
- Escala mejor (cualquier servidor puede verificar el token sin compartir sesión)

### 🔧 Backend: Dependencias nuevas

```bash
pip install passlib[bcrypt] python-jose
```

| Librería | Para qué |
|---|---|
| `passlib[bcrypt]` | Hashear contraseñas (bcrypt, el estándar seguro) |
| `python-jose[cryptography]` | Crear y verificar tokens JWT |

**Problema común:** `passlib` no es compatible con `bcrypt >= 4.1`. Solución: instalar `bcrypt==4.0.1`.

### 🧱 Archivos creados

```
backend/src/app/
├── core/
│   └── security.py          ← Hash, verify, JWT create/decode
└── features/
    ├── users/
    │   ├── models.py         ← Modelo User (id, email, hashed_password, full_name)
    │   ├── repository.py     ← get_by_email, get_by_id, create
    │   ├── schemas.py        ← UserResponse
    │   └── api.py            ← GET /api/users/me (ruta protegida)
    └── auth/
        ├── models.py         ← (usa User de users)
        ├── schemas.py        ← RegisterRequest, LoginRequest, TokenResponse
        ├── services.py       ← register() y login() con lógica de negocio
        └── api.py            ← POST /api/auth/register, POST /api/auth/login
```

### 🔐 core/security.py explicado

```python
from passlib.context import CryptContext
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password: str) -> str:
    return pwd_context.hash(password)          # "123456" → "$2b$12$..."

def verify_password(plain, hashed) -> bool:
    return pwd_context.verify(plain, hashed)    # Verifica contra el hash

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=60)
    data["exp"] = expire
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None
```

### 🔄 Flujo de autenticación completo

```
REGISTRO:
  Frontend → POST /api/auth/register {email, password, full_name}
  Backend  → Verifica que email no exista
           → Hashea password con bcrypt
           → Guarda usuario en tabla "users"
           → Crea JWT con user_id en "sub"
           → Devuelve {access_token, user_id, email, full_name}
  Frontend → Guarda token en localStorage
           → Muestra nombre de usuario en Header

LOGIN:
  Frontend → POST /api/auth/login {email, password}
  Backend  → Busca usuario por email
           → Verifica password contra hash con bcrypt
           → Crea JWT → lo devuelve
  Frontend → Mismo flujo que registro

RUTA PROTEGIDA (/api/users/me):
  Frontend → GET /api/users/me con header "Authorization: Bearer <token>"
  Backend  → Extrae token del header
           → Decodifica JWT → obtiene user_id
           → Busca usuario en BD → lo devuelve
```

### 🖥️ Frontend: AuthContext

```tsx
// src/lib/auth.tsx
// React Context que envuelve toda la app y provee:
// - user: { user_id, email, full_name } | null
// - token: string | null
// - login(email, password) → llama al API, guarda token
// - register(email, password, full_name) → llama al API, guarda token
// - logout() → limpia token y user
```

**¿Por qué Context y no props?** Porque el estado de autenticación lo necesita el Header (para mostrar usuario/botón login), y potencialmente cualquier componente futuro. Context evita "prop drilling" (pasar props por 5 niveles de componentes).

### 🪟 AuthModal

El modal de autenticación:
- Se abre al hacer click en el ícono de usuario 👤
- Tiene modo "login" y "register" (se switchea con un link)
- Muestra errores del servidor (email duplicado, contraseña incorrecta)
- Botón X para cerrar
- Click fuera del modal lo cierra

### ⚠️ Errores comunes con JWT

| Error | Causa | Solución |
|---|---|---|
| `401 Unauthorized` | Token expiró (60 min) | Hacer login de nuevo |
| `401 Token inválido` | Token manipulado o falso | JWT tiene firma, detecta manipulación |
| `500 Internal Server Error` | bcrypt version mismatch | `pip install bcrypt==4.0.1` |
| No cierra sesión al recargar | Token no persiste | Guardar en `localStorage`, no en variable |
| Modal no se ve | z-index bajo | Usar `z-[60]` para estar sobre header `z-50` |

### 📦 Estructura final del proyecto

```
Primero/
├── AGENTS.md
├── FRONTEND_RULES.md
├── BACKEND_RULES.md
├── SECURITY.md
├── .agents/skills/
│   ├── python-fastapi/     ← Usado para backend
│   ├── ui-ux-pro-max/      ← Usado para diseño frontend
│   └── owasp-security/     ← Usado para seguridad
├── backend/
│   └── src/app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── core/security.py
│       └── features/
│           ├── products/   ← CRUD productos
│           ├── cart/       ← Carrito de compras
│           ├── users/      ← Modelo usuario + ruta protegida
│           └── auth/       ← Registro + Login JWT
└── mi-tienda-frontend/
    └── src/
        ├── types/product.ts
        ├── lib/
        │   ├── api.ts      ← Llamadas al backend
        │   └── auth.tsx    ← AuthContext
        └── components/
            ├── ui/         ← shadcn/ui
            └── layout/
                ├── Header.tsx
                ├── Hero.tsx
                ├── AuthModal.tsx
                ├── StatsBar.tsx
                ├── TrustBadges.tsx
                ├── ProductCard.tsx
                ├── Footer.tsx
                └── MorphingBackground.tsx
```

---

## Lección 10: React Router — Páginas y navegación 🗺️

### ¿Qué es React Router?

Es la librería estándar para navegación en React. Permite tener **múltiples páginas** (rutas) sin recargar el navegador.

```bash
npm install react-router-dom
```

### Rutas del proyecto

| Ruta | Página | Componente |
|---|---|---|
| `/` | Home (marketing + productos) | `pages/Home.tsx` |
| `/categorias` | Listado de categorías | `pages/CategoriesPage.tsx` |
| `/categoria/:category` | Productos de una categoría | `pages/CategoryPage.tsx` |
| `/producto/:id` | Detalle de producto | `pages/ProductDetail.tsx` |
| `/buscar?q=...` | Resultados de búsqueda | `pages/SearchPage.tsx` |

### Cómo funciona el Router

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>            ← Provee el sistema de rutas
      <AuthProvider>           ← AuthContext envuelve todo
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/categoria/:category" element={<CategoryPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/buscar" element={<SearchPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

**`/:param`** significa parámetro dinámico. `useParams()` lo extrae:
```tsx
const { id } = useParams()     // /producto/1 → id = "1"
const { category } = useParams()  // /categoria/Audio → category = "Audio"
```

### Link vs a (anchor)

```tsx
// ❌ MAL: recarga toda la página
<a href="/producto/1">Ver</a>

// ✅ BIEN: navegación SPA sin recargar
<Link to="/producto/1">Ver</Link>
```

`Link` solo renderiza un `<a>` pero intercepta el click para que React maneje la navegación sin recargar.

### useNavigate para navegación programática

```tsx
const navigate = useNavigate()
navigate(`/buscar?q=${query}`)  // Navega a otra ruta
```

Útil para: formularios, búsquedas, redirects después de login.

### useSearchParams para query strings

```tsx
const [searchParams] = useSearchParams()
const query = searchParams.get("q")  // /buscar?q=auriculares → "auriculares"
```

---

## Lección 10.5: Navegación profesional — Dropdowns y buscador 🔍

### Dropdown de categorías (state-based, no hover)

```tsx
const [showCats, setShowCats] = useState(false)

<button onClick={() => setShowCats(!showCats)}>Categorías ▼</button>

{showCats && (
  <div className="absolute ...">
    <Link to="/categorias">Todas las categorías</Link>
    {categories.map(cat => (
      <Link to={`/categoria/${cat.name}`}>{cat.name}</Link>
    ))}
  </div>
)}
```

**Problema con `group-hover`:** El dropdown desaparece al mover el mouse del botón a la lista. Solución: usar **state** con `onClick` + `onMouseDown` fuera para cerrar.

### Cerrar dropdown al hacer click fuera

```tsx
useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowCats(false)
    }
  }
  document.addEventListener("mousedown", handleClick)
  return () => document.removeEventListener("mousedown", handleClick)
}, [])
```

### Buscador funcional

```tsx
<form onSubmit={handleSearch}>
  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
  <button type="submit"><Search /></button>
</form>
```

El buscador navega a `/buscar?q=...` y la SearchPage filtra productos por nombre, descripción y categoría.

### Página de categorías (/categorias)

Cada categoría tiene:
- Ícono (🎧🎮🖥️🔌📷)
- Color de gradiente propio
- Conteo de productos
- Efecto hover con "Ver todos →"
- Link a `/categoria/:name`

### Página de detalle (/producto/:id)

Muestra:
- Imagen grande del producto
- Categoría, nombre, rating estrellas
- Descripción completa
- Precio + descuento
- Botón "Agregar al carrito" con feedback
- Badges: Envío 24h, Garantía 2 años, Devolución 30 días
- Si no hay sesión, al comprar redirige a login

---

## Lección 11: Endpoint de categorías en backend 🏷️

Agregamos un endpoint para obtener las categorías con su conteo:

```python
# products/repository.py
async def get_categories(self) -> list[tuple[str, int]]:
    result = await self.db.execute(
        select(Product.category, func.count(Product.id))
        .group_by(Product.category)
    )
    return [(row[0], row[1]) for row in result.all()]
```

**SQL generado:**
```sql
SELECT category, COUNT(id) FROM products GROUP BY category
```

**Respuesta:**
```json
[
  {"name": "Audio", "count": 1},
  {"name": "Gaming", "count": 1},
  {"name": "Accesorios", "count": 2}
]
```

También agregamos filtrado por categoría:
```
GET /api/products?category=Audio
```

```python
@router.get("")
async def list_products(category: str | None = Query(None)):
    if category:
        return await service.list_products_by_category(category)
    return await service.list_products()
```

---

## 🧠 Resumen: Stack completo

```
Frontend (Vite + React + TS + Tailwind + shadcn/ui)
    │
    │  fetch() via Vite proxy (/api → :8000)
    │
Backend (FastAPI + SQLAlchemy async + SQLite)
    │
    ├── /api/products         → Lista/filtra productos
    ├── /api/products/categories → Categorías con conteo
    ├── /api/products/{id}    → Detalle producto
    ├── /api/auth/register    → Registro JWT
    ├── /api/auth/login       → Login JWT
    ├── /api/users/me         → Perfil (requiere token)
    ├── /api/cart             → Carrito CRUD
    └── /docs                 → Documentación Swagger
```

---

---

## Lección 12: Animaciones con GSAP 🎬

### ¿Qué es GSAP?

**GSAP** (GreenSock Animation Platform) es la librería de animaciones JS más potente para la web. Es como CSS transitions pero con superpoderes:

| CSS Transitions | GSAP |
|---|---|
| Animaciones simples (color, tamaño, posición) | Secuencias complejas (timelines) |
| Sin control sobre scroll | `ScrollTrigger` sincroniza animaciones con scroll |
| Easing básico (`ease-in`, `ease-out`) | Decenas de easings (`power3.out`, `elastic`, `bounce`) |
| No hay "stagger" | `stagger` anima elementos en secuencia con delay automático |
| No hay control temporal preciso | `timeline()` permite coreografiar segundos exactos |

### Instalación

```bash
npm install gsap
```

GSAP pesa ~114KB (gzip ~30KB). Se paga solo si haces animaciones complejas.

### Hooks de animación creados

Creamos `src/lib/animations.ts` con 3 hooks reutilizables:

**1. useHeroAnimation** — Stagger de entrada para el Hero

```tsx
export function useHeroAnimation(ref) {
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(
      el.querySelectorAll("[data-anim]"),  // Elementos con data-anim
      { opacity: 0, y: 30 },              // Estado inicial
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }  // Estado final con stagger
    )
  }, [ref])
}
```

**Uso en Hero.tsx:**
```tsx
const ref = useRef(null)
useHeroAnimation(ref)

// En el JSX:
<div ref={ref}>
  <div data-anim>Badge</div>        {/* Aparece 1ro */}
  <h1 data-anim>Título</h1>         {/* Aparece 2do */}
  <p data-anim>Descripción</p>      {/* Aparece 3ro */}
</div>
```

El `stagger: 0.15` significa que cada elemento aparece 0.15s después del anterior.

**2. useStaggerFade** — Animación al scrollear (ScrollTrigger)

```tsx
export function useStaggerFade(containerRef, itemsSelector, stagger = 0.1) {
  useEffect(() => {
    gsap.fromTo(children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger,
        scrollTrigger: { trigger: el, start: "top 85%" },
        // "top 85%" = cuando el top del contenedor llega al 85% del viewport
      }
    )
  }, [containerRef, itemsSelector, stagger])
}
```

**Uso en Home.tsx:**
```tsx
const productsRef = useRef(null)
useStaggerFade(productsRef, "[data-card]", 0.08)

<section ref={productsRef}>
  {products.map(p => (
    <div key={p.id} data-card>   {/* Cada card volará desde abajo */}
      <ProductCard ... />
    </div>
  ))}
</section>
```

**3. useCartPulse** — Feedback visual al agregar al carrito

```tsx
export function useCartPulse(itemCount) {
  const prevCount = useRef(itemCount)
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setPulseKey(k => k + 1)  // Cambia el key → React re-renderiza con animación
    }
    prevCount.current = itemCount
  }, [itemCount])
  return pulseKey
}
```

Usa el **patrón key de React**: al cambiar el `key` de un elemento, React lo destruye y recrea, lo que re-ejecuta su animación CSS.

### Animaciones CSS adicionales

```css
@keyframes cart-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.8); }   /* Explota al doble */
  100% { transform: scale(1); }     /* Vuelve a normal */
}
```

Usada en el badge del carrito: cada vez que agregas un producto, el badge escala 1→1.8→1 en 0.4s.

### ¿Cuándo usar GSAP vs CSS?

| Situación | Usa |
|---|---|
| Hover en botones | CSS `transition: all 0.2s` |
| Badge pulse | CSS `@keyframes` animación |
| Entrada de página (stagger) | GSAP `timeline()` |
| Animación al scrollear | GSAP `ScrollTrigger` |
| Secuencias coreografiadas | GSAP `timeline()` |
| Count-up de números | GSAP `textContent` + `snap` |

### Bundle size

```bash
Sin GSAP:   375 kB
Con GSAP:   489 kB
Diferencia: 114 kB (aprox 30 kB gzip)
```

GSAP es pesado. Para proyectos simples, CSS es suficiente. Para efectos "premium" como los que queremos, GSAP vale la pena.

---

---

## Lección 13: Panel Admin con SQLAdmin 🛠️

### ¿Qué es SQLAdmin?

Es el equivalente a **Django Admin** para FastAPI. Te da una interfaz visual para CRUD de tus modelos (productos, usuarios, carrito).

```bash
pip install sqladmin
```

### Diferencias con Django Admin

| Django Admin | SQLAdmin |
|---|---|
| `python manage.py createsuperuser` | Autenticación vía JWT (o sin auth) |
| `admin.py` con clases | Admin views con herencia `ModelView` |
| Viene con Django | Paquete externo `sqladmin` |
| Login propio | Login propio de SQLAdmin |
| Tema clásico | UI moderna (Tabler) + tema oscuro |

### Cómo lo configuramos

```python
# database.py — Agregamos un sync_engine (SQLAdmin no es async)
sync_db_url = settings.database_url.replace("sqlite+aiosqlite:///", "sqlite:///")
sync_engine = create_engine(sync_db_url, echo=settings.debug)

# admin.py — Definimos vistas para cada modelo
class ProductAdmin(ModelView, model=Product):
    column_list = [Product.name, Product.category, Product.price, Product.rating]
    column_searchable_list = [Product.name]
    form_choices = {  # Dropdown para categoría
        Product.category: [("Audio", "🎧 Audio"), ("Gaming", "🎮 Gaming"), ...],
    }

# main.py — Vinculamos al app
admin = Admin(app, sync_engine, title="Market Admin")
admin.add_view(ProductAdmin)
```

**Dato clave:** SQLAdmin necesita un **engine síncrono** (no async). Por eso creamos `sync_engine` aparte del `async_engine`.

### Panel creado

| Ruta | Descripción |
|---|---|
| `http://localhost:8000/admin/` | Dashboard principal |
| `http://localhost:8000/admin/product/list` | Lista de productos (buscar, ordenar) |
| `http://localhost:8000/admin/product/new` | Crear producto (con dropdown de categoría) |
| `http://localhost:8000/admin/cartitem/list` | Items del carrito |
| `http://localhost:8000/admin/user/list` | Usuarios registrados |

### Mejoras visuales aplicadas

| Funcionalidad | Cómo se ve |
|---|---|
| **Categoría como dropdown** | Select con 🎧 Audio / 🎮 Gaming / etc |
| **Rating incluido** | Campo numérico en el formulario |
| **URL de imagen** | Campo con placeholder y vista previa en lista |
| **Descripción** | Textarea de 3 filas en vez de input |
| **Búsqueda** | Buscador por nombre y descripción |
| **Ordenamiento** | Click en columnas para ordenar |
| **Labels en español** | "Precio original" y "URL de imagen" |

### 🔐 Autenticación del admin

SQLAdmin tiene su propio login. Usamos `AuthenticationBackend`:

```python
from sqladmin.authentication import AuthenticationBackend

class AdminAuth(AuthenticationBackend):
    async def login(self, request):
        # Valida contra variables de entorno
        if email == settings.admin_email and password == settings.admin_password:
            request.session.update({"token": "admin-authed"})
            return True
        return False

    async def authenticate(self, request):
        return request.session.get("token") == "admin-authed"
```

**Credenciales por defecto:**
```
Email:    admin@market.com
Password: admin123
```
(Configurables en `.env` con `ADMIN_EMAIL` y `ADMIN_PASSWORD`)

**Middleware necesario:** Las sesiones del admin requieren `SessionMiddleware`:

```python
from starlette.middleware.sessions import SessionMiddleware
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
```

### 📱 Responsive: CSS custom

SQLAdmin no es responsive-friendly. Agregamos CSS custom inyectado vía template override:

```css
@media (max-width: 768px) {
  .page-header { flex-wrap: wrap; }
  .page-header .actions .btn { width: 100%; }
  .card-body { overflow-x: auto; }
}
```

El template `src/app/templates/base.html` extiende el base de SQLAdmin y agrega el CSS.

### ⚠️ Diferencia importante: Dos URLs, dos servidores

```
Frontend (tu tienda):  http://localhost:5173
Backend + Admin:       http://localhost:8000/admin
Login admin:           http://localhost:8000/admin/login
```

En Django todo vivía en el mismo puerto (`runserver`). Acá separamos frontend (Vite) y backend (FastAPI). El admin vive en el backend porque SQLAdmin se conecta directo a la base de datos.

---

## OWASP Security Checklist — Aplicado ✅

Revisión contra el skill `owasp-security` y `SECURITY.md`:

### OWASP Top 10:2025

| # | Vulnerabilidad | Prevención | Estado |
|---|---|---|---|
| A01 | Broken Access Control | Carrito scoped por usuario | ✅ |
| A02 | Security Misconfiguration | CORS restringido, debug off en prod | ✅ |
| A03 | Supply Chain | Dependencias en pyproject.toml | ⚠️ Básico |
| A04 | Cryptographic Failures | bcrypt para passwords, JWT HS256 | ✅ |
| A05 | Injection | SQLAlchemy parameterized queries | ✅ |
| A06 | Insecure Design | Rate limiting con slowapi | ✅ |
| A07 | Auth Failures | JWT + password min 8 chars | ✅ |
| A08 | Integrity Failures | No SRI (no aplica) | ➖ |
| A09 | Logging Failures | structlog con formato estructurado | ✅ |
| A10 | Exception Handling | FastAPI fail-closed, JSON errors | ✅ |

### ASVS 5.0 Level 1

| Requisito | Estado |
|---|---|
| Passwords mínimo 8 caracteres | ✅ Validación Pydantic |
| Rate limiting en autenticación | ✅ 5/min register, 10/min login |
| HTTPS everywhere | ⚠️ Solo desarrollo |
| Session tokens 128+ bits | ✅ JWT HS256 |
| Input validation en todos los parámetros | ✅ Pydantic schemas |

### Cómo se implementó cada fix

**1. Password validation (Pydantic v2):**
```python
@field_validator("password")
@classmethod
def password_min_length(cls, v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    return v
```

**2. Cart ownership by user:**
```python
# CartItem model tiene user_id
class CartItem(Base):
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
# API requiere autenticación
async def list_cart(user: User = Depends(get_current_user)):
    return await service.list_items(user.id)
```

**3. CORS restringido:**
```python
allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
```

**4. Rate limiting (slowapi):**
```python
@limiter.limit("5/minute")   # Register
@limiter.limit("10/minute")  # Login
@limiter.limit("30/minute")  # Add to cart
```

**5. Structured logging (structlog):**
```python
import structlog
logger = structlog.get_logger()
logger.info("App started", app_name=settings.app_name)
```

---

## 🎯 Stack completo final

```
Frontend (Vite + React + TS + Tailwind + shadcn/ui + GSAP)
    │
    │  fetch() via Vite proxy (/api → :8000)
    │
Backend (FastAPI + SQLAlchemy async + SQLite + SQLAdmin)
    │
    ├── /api/products(/categories)  → Productos + categorías
    ├── /api/auth(register,login)   → JWT
    ├── /api/users/me               → Perfil autenticado
    ├── /api/cart                   → Carrito CRUD
    ├── /admin/*                    → Panel admin (SQLAdmin)
    └── /docs                       → Swagger automático

Base de datos: SQLite (market.db)
```

## Completado ✅

| Lección | Tema |
|---|---|
| 1 | Creación proyecto Vite + React + TS |
| 2 | Tailwind CSS |
| 3-4 | shadcn/ui |
| 5 | Skills: python-fastapi |
| 6a | Skills: ui-ux-pro-max + owasp-security |
| 6b | AGENTS.md + reglas del proyecto |
| 6c | OWASP Security skill |
| 6d | Skills obligatorios en rules |
| 6e | Script de instalación completo |
| 7 | Layout base de la tienda |
| 7b | Liquid Glass + diseño UI/UX Pro Max |
| 8 | Backend FastAPI + SQLAlchemy |
| 8.5 | Imágenes reales + marketing + neuromarketing |
| 9 | Autenticación JWT |
| 10 | React Router (páginas y navegación) |
| 10.5 | Dropdowns + buscador funcional |
| 11 | Endpoint de categorías |
| 12 | Animaciones GSAP |
| 13 | Panel Admin SQLAdmin + auth + responsive |
| OWASP | Security checklist completado |

## Próximas lecciones (planificadas)

- [ ] Dockerizar la app y desplegar en Coolify

---

## Lección 14: UX y Neuromarketing — 4 mejoras implementadas 🧠✨

### 🔍 Contexto

Se realizó una auditoría rápida de UX/neuromarketing al proyecto completo. Se identificaron oportunidades de mejora priorizadas en una matriz impacto/esfuerzo. Se implementaron las 4 primeras:

| # | Mejora | Principio neuromarketing |
|---|---|---|
| 1 | Menú hamburguesa móvil + búsqueda responsive | Accesibilidad mobile (UX) |
| 2 | Countdown timer real + indicador de stock | Escasez / Urgencia (FOMO) |
| 3 | Galería de imágenes + zoom en Product Detail | Calidad percibida / Confianza |
| 4 | Banner de ventas recientes (FOMO) | Prueba social / Efecto manada |

---

### Mejora 1: Menú hamburguesa móvil + búsqueda responsive 📱

**Problema:** En móvil el `nav` y el buscador estaban ocultos (`hidden sm:flex`) sin alternativa. El usuario móvil no podía navegar por categorías ni buscar productos.

**Solución:** Sheet lateral izquierdo con:
- Buscador funcional
- Links "Inicio" y "Todas las categorías"
- Lista completa de categorías con íconos y conteo
- Botón hamburguesa (solo visible en `< md`)

**Archivos modificados:**
- `src/components/layout/Header.tsx`

**Código clave — Botón hamburguesa:**
```tsx
<button
  className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
  onClick={() => setMobileSheetOpen(true)}
  aria-label="Menú"
>
  <Menu className="h-5 w-5" />
</button>
```

**Código clave — Sheet móvil con buscador + categorías:**
```tsx
<Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
  <SheetContent side="left" className="w-72 ..." showCloseButton={false}>
    <div className="flex h-14 items-center justify-between border-b ...">
      <span className="font-heading ...">Menú</span>
      <button onClick={() => setMobileSheetOpen(false)}>
        <X className="h-5 w-5" />
      </button>
    </div>
    <form onSubmit={handleMobileSearch}>
      <Input placeholder="Buscar productos..." />
    </form>
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/categorias">Todas las categorías</Link>
    </nav>
    <div className="my-3 border-t ..." />
    {categories.map(cat => (
      <Link to={`/categoria/${cat.name}`}>
        {categoryIcons[cat.name]} {cat.name}
      </Link>
    ))}
  </SheetContent>
</Sheet>
```

---

### Mejora 2: Countdown timer real + indicador de stock ⏰📦

#### Countdown timer

**Problema:** La oferta decía "Oferta válida por 7 días" — un timeframe demasiado largo que no genera urgencia real.

**Solución:** Timer de 48h con contador regresivo en vivo (horas:minutos:segundos) con diseño tipo "reloj digital".

**Hook inline en Home.tsx:**
```tsx
const offerEnd = useRef(Date.now() + 48 * 60 * 60 * 1000)
const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 })

useEffect(() => {
  const timer = setInterval(() => {
    const diff = offerEnd.current - Date.now()
    if (diff <= 0) { /* expiró */ return }
    setTimeLeft({
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    })
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

**UI:** 3 cajas con `font-mono` y fondo oscuro: `HH : MM : SS` con etiquetas "Horas", "Min", "Seg".

#### Stock

**Problema:** No se mostraba disponibilidad de producto. El usuario no sabía si quedaban pocas unidades, lo que es un gran driver de urgencia.

**Solución:**

**Backend:**
- Se agregó `stock: int` al modelo `Product` en `backend/src/app/features/products/models.py`
- Se agregó `stock` al schema Pydantic en `schemas.py`
- Se pobló con valores realistas en los seeds (3-50 unidades por producto)

**Frontend — ProductCard.tsx:**
```tsx
const isLowStock = product.stock > 0 && product.stock <= 5
const isOutOfStock = product.stock === 0
```
- Stock bajo: badge rojo `⚡ X uds` con `animate-pulse`, borde rojo pulsante en la card
- Stock 0: badge "Agotado", card atenuada (`opacity-60`), botón "Comprar" deshabilitado

**Frontend — ProductDetail.tsx:**
- Badge `⚡ Solo X uds` (rojo, fijo en la imagen)
- Indicador verde `✅ X en stock` o rojo `⚠️ Solo quedan X unidades`
- Botón "Agregar al carrito" se deshabilita si stock es 0

---

### Mejora 3: Galería de imágenes + zoom en ProductDetail 🖼️🔍

**Problema:** Solo se mostraba 1 imagen del producto. En e-commerce, la falta de múltiples vistas y zoom reduce drásticamente la tasa de conversión.

**Solución:**

#### Backend — Campo `images`
```python
# models.py
images: Mapped[str | None] = mapped_column(String(2000), nullable=True)
```
Se almacena como JSON string (array de URLs). El schema Pydantic parsea automáticamente:
```python
@field_serializer("images")
def serialize_images(self, v):
    if isinstance(v, str) and v:
        try: return json.loads(v)
        except: return [img.strip() for img in v.split(",") if img.strip()]
    return v if isinstance(v, list) else []
```

#### Frontend — Galería con miniaturas
```tsx
const allImages = product.images?.length > 0 ? product.images : [product.image]
const [selectedImage, setSelectedImage] = useState(0)

{allImages.length > 1 && (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {allImages.map((img, i) => (
      <button key={i} onClick={() => setSelectedImage(i)}
        className={`h-16 w-16 rounded-xl border-2 ${
          i === selectedImage
            ? "border-primary shadow-md shadow-primary/20"
            : "border-border/20 opacity-60"
        }`}
      >
        <img src={img} alt={`${product.name} ${i + 1}`} />
      </button>
    ))}
  </div>
)}
```

#### Frontend — Zoom on hover
```tsx
const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
const [zoomActive, setZoomActive] = useState(false)
const imageRef = useRef<HTMLDivElement>(null)

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = imageRef.current!.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  setZoomPos({ x, y })
}

// En el JSX:
<div ref={imageRef}
  onMouseMove={handleMouseMove}
  onMouseEnter={() => setZoomActive(true)}
  onMouseLeave={() => setZoomActive(false)}
  className="cursor-crosshair"
>
  <img style={zoomActive ? {
    transform: "scale(2)",
    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
  } : {}} />
</div>
```

El zoom sigue el cursor del mouse con `transformOrigin` dinámico y escala 2x.

---

### Mejora 4: Banner de ventas recientes (FOMO) 🔔

**Problema:** No había prueba social dinámica. Las notificaciones de "alguien compró esto" aumentan la confianza y generan FOMO.

**Solución:** Notificación flotante en la esquina inferior izquierda.

#### Backend — Endpoint de compras recientes
```python
# products/api.py
RECENT_PURCHASES = [
    {"name": "María G.", "product": "Auriculares NoiseCancel Pro", "time": "hace 5 min", "city": "Madrid"},
    {"name": "Carlos L.", "product": "Monitor UltraWide 34\"", "time": "hace 12 min", "city": "Barcelona"},
    # ... 12 compras realistas
]

@router.get("/recent-purchases/list", response_model=list[dict])
async def recent_purchases():
    return random.sample(RECENT_PURCHASES, min(5, len(RECENT_PURCHASES)))
```

#### Frontend — Notificación rotativa
```tsx
const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
const [visiblePurchase, setVisiblePurchase] = useState(0)

// Cargar al inicio
fetchRecentPurchases().then(setRecentPurchases)

// Rotar cada 6 segundos
useEffect(() => {
  const interval = setInterval(() => {
    setVisiblePurchase((prev) => (prev + 1) % recentPurchases.length)
  }, 6000)
  return () => clearInterval(interval)
}, [recentPurchases.length])
```

**UI de la notificación flotante:**
```tsx
<div className="fixed bottom-28 left-4 z-40 max-w-xs animate-in slide-in-from-left-2 fade-in ...">
  <div className="rounded-2xl border border-border/30 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <span className="text-sm">🛒</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">
          {recentPurchases[visiblePurchase]?.name}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          compró {recentPurchases[visiblePurchase]?.product}
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          {recentPurchases[visiblePurchase]?.city} · {recentPurchases[visiblePurchase]?.time}
        </p>
      </div>
      <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
    </div>
  </div>
</div>
```

El punto verde pulsante atrae la atención sin ser intrusivo.

---

### 📋 Resumen de archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `backend/.../features/products/models.py` | Backend | +campo `stock`, +campo `images` |
| `backend/.../features/products/schemas.py` | Backend | +`stock`, +`images` con serializer |
| `backend/.../features/products/api.py` | Backend | +endpoint `/recent-purchases/list` |
| `backend/.../admin.py` | Backend | +`stock` al panel admin |
| `backend/.../main.py` | Backend | Seeds con stock e imágenes reales |
| `frontend/src/types/product.ts` | Frontend | +`stock`, +`images` |
| `frontend/src/lib/api.ts` | Frontend | +`fetchRecentPurchases` |
| `frontend/src/components/layout/Header.tsx` | Frontend | +menú hamburguesa móvil (Sheet) |
| `frontend/src/components/layout/ProductCard.tsx` | Frontend | +stock bajo/agotado visual |
| `frontend/src/pages/ProductDetail.tsx` | Frontend | +galería thumbnails, zoom 2x, stock indicator |
| `frontend/src/pages/Home.tsx` | Frontend | +countdown timer 48h, +FOMO banner |

### 📈 Impacto esperado

| Indicador | Antes | Después |
|---|---|---|
| Usabilidad mobile | Navegación rota en <768px | Navegación completa vía sheet |
| Urgencia percibida | "7 días" (estático, sin efecto) | Countdown real 48h (tick tick tick) |
| Confianza en compra | Sin indicador de stock | Badge de stock + colores semáforo |
| Calidad percibida | 1 imagen plana | Galería + miniaturas + zoom 2x |
| Prueba social | Stats estáticos (50K+) | Notificaciones en vivo rotando cada 6s |

### 🧠 Neuromarketing: principios aplicados

| Principio | Dónde se aplicó | Explicación técnica |
|---|---|---|
| **Escasez** | Badge rojo `⚡ Solo 3 uds` | La escasez activa la aversión a la pérdida — el cerebro valora más lo que puede perder que lo que puede ganar |
| **Urgencia** | Countdown `HH:MM:SS` | Un timer visible crea presión temporal. 48h es lo suficientemente corto para activar acción pero lo suficientemente largo para no sentirse imposible |
| **FOMO (Fear of Missing Out)** | Banner "María de Madrid compró..." | Ver que otros compran en tiempo real activa el sesgo de manada (bandwagon effect) |
| **Anclaje de precio** | Precio tachado + descuento | El cerebro compara el primer precio que ve (original) con el final y percibe el descuento como una ganancia |
| **Prueba social** | Stats bar + notificaciones de compra | La gente sigue lo que otros hacen (informational social influence) |
| **Reducción de riesgo** | Badge "Garantía 2 años", "30 días devolución" | La incertidumbre es el mayor blocker de compra. Las garantías eliminan el riesgo percibido |
| **Calidad percibida** | Galería con zoom 2x | Poder ver el producto en detalle aumenta la confianza y la percepción de calidad |

---

## Lección 15: Timer en carrusel + sección de contacto 🎠📞

### 🔍 Problema detectado

El slide del countdown timer en el carrusel quedaba tapado por el texto del Hero (el título "Tecnología que transforma", botones, etc.). La solución fue ocultar condicionalmente el overlay de texto del Hero cuando el carrusel muestra la slide de oferta.

### 🧩 Cambio 1: HeroCarousel expone slide activa

Se agregó un callback `onSlideChange` para que el Hero sepa qué slide está mostrando el carrusel:

```tsx
// HeroCarousel.tsx
interface HeroCarouselProps {
  onSlideChange?: (index: number) => void
}

// Cada vez que cambia current, se dispara el callback
useEffect(() => {
  onSlideChange?.(current)
}, [current, onSlideChange])
```

### 🧩 Cambio 2: Hero oculta texto condicionalmente

```tsx
// Hero.tsx
const [offerSlide, setOfferSlide] = useState(false)

<HeroCarousel onSlideChange={(i) => setOfferSlide(i === 3)} />

{!offerSlide && (
  <div ref={ref} className="...">
    {/* Todo el texto del Hero se oculta cuando la slide de oferta está activa */}
  </div>
)}
```

Cuando `offerSlide` es `true` (slide #4, la de la oferta), el div con el texto del Hero no se renderiza, dejando visible el timer del carrusel.

### 🧩 Cambio 3: Sección de urgencia en Home + imagen de audífonos

Se restauró la sección de oferta relámpago en Home (debajo de los productos) con:
- Timer countdown 48h en vivo
- Código promocional `BIENVENIDO`
- Imagen de audífonos (Unsplash) en lugar de producto genérico
- Texto "Aplica a todos los productos"

```tsx
<img
  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  alt="Auriculares oferta"
/>
```

### 🔄 Flujo completo

```
Carrusel Hero (rota cada 5s):
  Slide 1-3: imágenes + overlay con texto Hero visible
  Slide 4:   timer oferta + overlay Hero OCULTO

Sección abajo (Home):
  Timer sincronizado + imagen audífonos + código BIENVENIDO
  
Sección contacto:
  Email, teléfono, ubicación + botón "Enviar mensaje"
```

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `HeroCarousel.tsx` | +prop `onSlideChange`, +useEffect para callback |
| `Hero.tsx` | +state `offerSlide`, render condicional del texto |
| `Home.tsx` | +estado/effect del timer, +sección urgencia con audífonos |

---

## Lección 16: Hero dinámico — Copy distinto por slide + 3 slides 🎠🧠

### 🔍 Problema original

El carrusel tenía 4 slides, pero el gradiente global opacaba todo, la slide de oferta no tenía imagen de fondo, y el texto del Hero era el mismo para slides 2 y 3 ("Tecnología que transforma" se repetía).

### 📐 Arquitectura final (3 slides)

```
Slide 0: OFERTA (principal, se muestra al cargar)
  Imagen workspace de fondo + timer overlay centrado
  Sin hero text overlay (se oculta con pointer-events)
  Gradiente suave propio dentro del overlay del timer

Slide 1: AUDÍFONOS
  Imagen auriculares + hero text: "Tecnología que transforma"
  Copy aspiracional + badges: 🚚 Envío 24h / 🛡️ Garantía / ↩️ Devolución

Slide 2: CONTROL GAMING  
  Imagen control + hero text: "Domina cada partida como un pro"
  Copy gaming + badges: ⚡ 0% latencia / 🎯 Switches Cherry MX / 💨 60fps
```

### 🧩 Cambios clave

#### 1. HeroCarousel — Sin gradiente global, cada slide maneja su overlay

```tsx
const slides = [
  { type: "offer",  image: "...workspace...",   alt: "Oferta relámpago" },
  { image: "...auriculares...",                  alt: "Auriculares premium" },
  { image: "...control-gaming...",               alt: "Control gaming" },
]
```

Se eliminó el `<div className="bg-gradient-to-r ...">` global. En su lugar:
- **Offer slide**: el overlay del timer tiene `bg-gradient-to-r from-background/70` propio
- **Slides imagen**: un gradiente sutil `from-background/50` solo a la izquierda

#### 2. Hero.tsx — Contenido dinámico por slide

```tsx
const slideContent = [
  null,  // Slide 0: sin overlay de texto
  {
    tag: "50K+ clientes satisfechos",
    title: <>Tecnología que<br /><span className="bg-gradient-to-r from-amber-400 ...">transforma</span><br />tu día a día</>,
    desc: "Equipos premium seleccionados por expertos...",
  },
  {
    tag: "🎮 Zona gamer",
    title: <>Domina cada<br /><span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-500 ...">partida</span><br />como un pro</>,
    desc: "Periféricos con precisión milimétrica...",
  },
]
```

Los 3 badges inferiores también cambian por slide:

| Slide | Badge 1 | Badge 2 | Badge 3 |
|---|---|---|---|
| Audífonos | 🚚 Envío 24h | 🛡️ 2 años garantía | ↩️ 30 días devolución |
| Gaming | ⚡ 0% latencia | 🎯 Switches Cherry MX | 💨 60fps estables |

#### 3. pointer-events para no bloquear el carrusel

```tsx
<div className="pointer-events-none absolute inset-0 ...">
  <div className="pointer-events-auto max-w-2xl">
    <Button>Comprar ahora</Button>
  </div>
</div>
```

El overlay no intercepta clicks — los dots del carrusel y los botones funcionan.

### 🧠 Neuromarketing por slide

| Slide | Copy | Técnica |
|---|---|---|
| **Oferta** | Timer "48h" + código BIENVENIDO | Urgencia + Escasez + Reciprocidad |
| **Audífonos** | "Tecnología que transforma tu día" | Aspiración / Calidad de vida |
| **Gaming** | "Domina cada partida como un pro" | Identidad de tribu + Especificaciones |

### 📁 Archivos modificados

| Archivo | Cambio |
|---|---|
| `HeroCarousel.tsx` | 3 slides, oferta con imagen de fondo, sin gradiente global |
| `Hero.tsx` | Array `slideContent`, render condicional por slide, badges dinámicos |

---

## Lección 17: Panel de usuario — Cuenta, pedidos y checkout 👤📦

### 🎯 Resumen

Se implementó un sistema completo de gestión de usuario: dropdown de usuario en el navbar, página de edición de perfil, historial de pedidos y checkout con datos de envío.

### 🧱 Backend (python-fastapi)

#### User extendido

```python
# models.py — +phone, +address
class User(Base, TimestampMixin):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
```

#### Nuevo feature: Orders

```
backend/src/app/features/orders/
├── __init__.py          ← exporta router
├── models.py            ← Order (user_id, total, status, shipping_*) + OrderItem
├── schemas.py           ← OrderResponse, OrderItemResponse, CheckoutRequest
├── repository.py        ← get_user_orders, create_order, create_order_item
├── services.py          ← list_orders, checkout (cart → order + limpiar carrito)
└── api.py               ← GET /api/orders, POST /api/orders/checkout
```

**Flujo de checkout:**
```
1. Usuario hace click en "Finalizar compra"
2. Se muestra formulario con: nombre, teléfono, dirección
3. Se auto-preenllena con datos guardados del perfil
4. POST /api/orders/checkout → crea Order + OrderItems
5. Vacía el carrito del usuario
6. Muestra confirmación "Pedido confirmado ✅"
```

#### Endpoints nuevos

| Método | Ruta | ¿Qué hace? |
|---|---|---|
| `PATCH` | `/api/users/me` | Actualizar perfil (nombre, email, teléfono, dirección, password) |
| `GET` | `/api/orders` | Listar pedidos del usuario autenticado |
| `POST` | `/api/orders/checkout` | Crear pedido desde carrito + datos de envío |

### 🖥️ Frontend

#### Dropdown de usuario (Header)

```tsx
{user ? (
  <div className="relative" ref={userDropdownRef}>
    <button onClick={() => setUserDropdown(!userDropdown)}>
      <User /> {user.full_name} <ChevronDown />
    </button>
    {userDropdown && (
      <div className="absolute right-0 top-full ...">
        <Link to="/cuenta"><Settings /> Mi cuenta</Link>
        <Link to="/pedidos"><Package /> Mis pedidos</Link>
        <button onClick={logout}><LogOut /> Cerrar sesión</button>
      </div>
    )}
  </div>
) : (
  <Button onClick={onOpenAuth}><User /></Button>
)}
```

#### Página /cuenta (AccountPage.tsx)

Formulario para editar:
- Nombre completo
- Email
- Teléfono
- Dirección de envío
- Contraseña (opcional, solo si se quiere cambiar)

Usa `PATCH /api/users/me` y actualiza el contexto de autenticación con `updateUser()`.

#### Página /pedidos (OrdersPage.tsx)

Lista expandible de pedidos con:
- Estado (confirmado/pendiente) con punto de color verde/ámbar
- Fecha, total, items del pedido
- Dirección de envío y teléfono al expandir
- Estado vacío si no hay pedidos

#### Checkout con datos de envío (Header cart sheet)

3 pasos en el Sheet del carrito:
1. **Cart** → muestra items + total + "Finalizar compra"
2. **Form** → inputs para nombre, teléfono, dirección (prellenados del perfil)
3. **Done** → confirmación visual con ícono verde

### 📁 Archivos nuevos/modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `backend/.../users/models.py` | Backend | +phone, +address |
| `backend/.../users/schemas.py` | Backend | +UserUpdate, +phone, +address |
| `backend/.../users/repository.py` | Backend | +update method |
| `backend/.../users/api.py` | Backend | +PATCH /me |
| `backend/.../auth/schemas.py` | Backend | +phone, +address en TokenResponse |
| `backend/.../auth/services.py` | Backend | Retorna phone/address en login/register |
| `backend/.../orders/*` | Backend | Feature completo (6 archivos) |
| `backend/.../main.py` | Backend | +router orders |
| `frontend/lib/auth.tsx` | Frontend | +phone/address en AuthUser, +updateUser, +refreshUser |
| `frontend/lib/api.ts` | Frontend | +fetchOrders, +checkout, +updateProfile |
| `frontend/Header.tsx` | Frontend | +user dropdown, +checkout form 3 pasos |
| `frontend/App.tsx` | Frontend | +routes /cuenta, /pedidos |
| `frontend/pages/AccountPage.tsx` | Frontend | Nueva página editar perfil |
| `frontend/pages/OrdersPage.tsx` | Frontend | Nueva página lista pedidos |

---

---

## Lección 18: Auditoría UI/UX — Accesibilidad WCAG + Calidad de código ♿🎯

### 🔍 Contexto

Se realizó una auditoría completa del frontend contra el skill `ui-ux-pro-max` y guías WCAG. Se identificaron **18 mejoras** organizadas en 3 sprints. Se implementaron todas.

### 📊 Resumen de cambios

| Categoría | Ítems | Sprint |
|---|---|---|
| Accesibilidad WCAG | 5 (emojis, focus, reduced-motion, ARIA, labels) | Sprint 1 |
| UX + Estabilidad visual | 4 (constantes, skeleton, CLS, FOMO a11y) | Sprint 2 |
| Polish + Performance | 4 (ErrorBoundary, titles, crossOrigin, transiciones) | Sprint 3 |

### 🔴 Sprint 1 — Accesibilidad WCAG básica

#### 1. Emojis → Lucide icons

Se eliminaron **12+ emojis** usados como iconos en toda la app y se reemplazaron por componentes de `lucide-react`:

| Archivo | Emojis eliminados | Icono Lucide |
|---|---|---|
| `Header.tsx` | 🎧🎮🖥️🔌📷 | `Headphones`, `Gamepad`, `Monitor`, `Plug`, `Camera` |
| `HeroCarousel.tsx` | ⏰📦 | `Clock`, `Package` |
| `Hero.tsx` | 🎮⚡🚚🎯🛡️💨↩️ | `Gamepad`, `Zap`, `Truck`, `Crosshair`, `ShieldCheck`, `Wind`, `Undo2` |
| `Home.tsx` | 🚚🛡️💬📦🛒⏰ | `Truck`, `ShieldCheck`, `MessageCircle`, `ShoppingCart`, `Clock` |
| `ProductDetail.tsx` | ⚡⚠️✅ | `Zap` (ya existía), texto plano |
| `ProductCard.tsx` | ⚡ | `Zap` |
| `CategoriesPage.tsx` | 🎧🎮🖥️🔌📷 | `categoryIconMap` |
| `CategoryPage.tsx` | 🎧🎮🖥️🔌📷 | `categoryIconMap` |

**Archivo nuevo:** `src/constants/categories.ts` — mapa centralizado de categorías con iconos Lucide:

```ts
export const categoryIconMap: Record<string, LucideIcon> = {
  Audio: Headphones,
  Gaming: Gamepad,
  Monitores: Monitor,
  Accesorios: Plug,
  Cámaras: Camera,
}
```

**Uso en componentes:**
```tsx
const Icon = categoryIconMap[cat.name]
return Icon ? <Icon className="h-4 w-4" /> : null
```

#### 2. Foco visible (`:focus-visible`)

Agregado a `src/index.css`:

```css
:focus-visible {
  outline: 2px solid hsl(42, 96%, 40%);
  outline-offset: 2px;
  border-radius: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

Esto asegura que todos los elementos interactivos tengan un indicador de foco visible para navegación por teclado, usando el color primary del tema.

#### 3. prefers-reduced-motion

Dos capas de protección:

**CSS global (`index.css`):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JS (GSAP) — `animations.ts`:**
```tsx
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// useFadeInUp, useStaggerFade, useHeroAnimation verifican antes de ejecutar GSAP
if (prefersReducedMotion()) {
  // Skip animación, mostrar estado final inmediato
  el.style.opacity = "1"
  el.style.transform = "translateY(0)"
  return
}
```

#### 4. ARIA en HeroCarousel

```tsx
<div
  role="region"
  aria-roledescription="carousel"
  aria-label="Banner principal de ofertas"
>
  {slides.map((slide, i) => (
    <div
      key={i}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${i + 1} de ${slides.length}`}
      aria-hidden={i !== current}
    >
```

Los dots de navegación también recibieron `aria-label="Ir a slide {n}"`.

#### 5. Labels accesibles en formularios

Se agregaron `<label>` con clase `sr-only` (solo lectores de pantalla):

| Ubicación | Input | Label |
|---|---|---|
| Header desktop | Búsqueda | `id="search-desktop"` |
| Header mobile | Búsqueda | `id="search-mobile"` |
| Checkout | Nombre | `id="checkout-name"` |
| Checkout | Teléfono | `id="checkout-phone"` |
| Checkout | Dirección | `id="checkout-address"` |
| AuthModal | Email | `id="auth-email"` |
| AuthModal | Contraseña | `id="auth-password"` |
| AuthModal | Nombre (register) | `id="auth-name"` |

Los botones de búsqueda también recibieron `aria-label="Buscar"`.

### 🟠 Sprint 2 — UX + Estabilidad visual

#### 6. Duplicación de constantes eliminada

Antes: `categoryIcons` definido en 3 archivos distintos (Header, Home, CategoriesPage).

Después: Mapa centralizado en `src/constants/categories.ts`. Todos los componentes lo importan.

#### 7. ProductCardSkeleton

**Archivo nuevo:** `src/components/layout/ProductCardSkeleton.tsx`

```tsx
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/20 bg-card/40 p-4">
      <div className="aspect-[4/3] rounded-xl bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
        <div className="h-3 w-1/4 rounded bg-muted-foreground/20" />
      </div>
    </div>
  )
}
```

Usa `animate-pulse` de Tailwind para un efecto shimmer suave mientras cargan los datos.

#### 8. CLS — width/height en imágenes

Todas las `<img>` sin dimensiones explícitas recibieron `width` y `height` para que el navegador reserve espacio antes de cargar:

| Componente | width | height |
|---|---|---|
| `ProductCard.tsx` | 400 | 400 |
| `ProductDetail.tsx` (principal) | 800 | 800 |
| `ProductDetail.tsx` (thumbnails) | 64 | 64 |
| `HeroCarousel.tsx` | 1920 | 1080 |
| `Home.tsx` (featured) | 800 | 800 |
| `Home.tsx` (ofertas) | 800 | 600 |
| `Home.tsx` (contacto) | 800 | 600 |

#### 9. FOMO — aria-live

El banner de compras recientes ahora es detectable por lectores de pantalla:

```tsx
<div aria-live="polite" aria-atomic="true" className="fixed bottom-28 left-4 ...">
```

`aria-live="polite"` permite que el screen reader anuncie los cambios sin interrumpir.

#### 10. ProductCard — Link structure

**Antes:** Un solo `<Link>` envolviendo toda la card → texto accesible confuso.

**Después:**
```tsx
<article className="group ...">
  <Link to={`/producto/${product.id}`} aria-label={product.name}>
    <img ... />
  </Link>
  <div className="relative p-4 sm:p-5">
    <Link to={`/producto/${product.id}`}>
      <h3 className="...">{product.name}</h3>
    </Link>
    {/* precio, rating, botón */}
  </div>
</article>
```

### 🟡 Sprint 3 — Polish + Performance

#### 11. ErrorBoundary

**Archivo nuevo:** `src/components/ErrorBoundary.tsx`

```tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError
      ? this.props.fallback || <div>Error al cargar esta sección</div>
      : this.props.children
  }
}
```

Envuelve toda la app en `App.tsx`:
```tsx
<ErrorBoundary>
  <Routes>...</Routes>
  <WhatsAppButton />
  <ChatBot />
</ErrorBoundary>
```

#### 12. Títulos dinámicos por página

Cada página ahora actualiza `document.title`:

| Ruta | Título |
|---|---|
| `/` | `Market - Tu tienda de tecnología` |
| `/producto/:id` | `Market - {product.name}` |
| `/categorias` | `Market - Categorías` |
| `/categoria/:cat` | `Market - {category}` |
| `/buscar?q=...` | `Market - Búsqueda: {query}` |
| `/cuenta` | `Market - Mi cuenta` |
| `/pedidos` | `Market - Mis pedidos` |

#### 13. crossOrigin + decoding en imágenes

Todas las imágenes de Unsplash ahora incluyen:

```tsx
<img
  crossOrigin="anonymous"
  decoding="async"
  width={400}
  height={400}
/>
```

- `crossOrigin="anonymous"` → evita problemas de CORS cache
- `decoding="async"` → no bloquea el render mientras decodifica la imagen

#### 14. Consistencia de transiciones

Se estandarizaron las duraciones de transición:

| Antes | Ahora | Dónde |
|---|---|---|
| `duration-300` en Hero.tsx | `duration-200` | Botones "Comprar ahora" y "Ver ofertas" |
| `duration-700` en Home.tsx | `duration-500` | Imagen featured hover:scale |
| `duration-300` en ProductCard.tsx | `duration-200` | Card hover border/opacity |

### ✅ Verificaciones

- `<main>` landmark presente en **todas las páginas** (Home, ProductDetail, AccountPage, OrdersPage, CategoryPage, CategoriesPage, SearchPage)
- `setInterval` cleanup correcto en todos los `useEffect`
- Sheet Escape manejado nativamente por `@base-ui/react/dialog`

### 📁 Archivos creados

| Archivo | Propósito |
|---|---|
| `src/constants/categories.ts` | Mapas centralizados de categorías + colores + descripciones |
| `src/components/layout/ProductCardSkeleton.tsx` | Skeleton loader animado |
| `src/components/ErrorBoundary.tsx` | Error boundary para cada página |

### 📁 Archivos modificados

| Archivo | Cambios |
|---|---|
| `src/index.css` | `:focus-visible`, `prefers-reduced-motion` global |
| `src/lib/animations.ts` | `prefersReducedMotion()` check en GSAP hooks |
| `src/App.tsx` | +ErrorBoundary, +ChatBot |
| `src/components/layout/Header.tsx` | Emojis→Lucide, labels sr-only |
| `src/components/layout/HeroCarousel.tsx` | ARIA attributes, emojis→Lucide, crossOrigin, dimensiones |
| `src/components/layout/Hero.tsx` | Emojis→Lucide, descripción blanca legible, transiciones consistentes |
| `src/components/layout/ProductCard.tsx` | Link structure fix, crossOrigin, dimensiones, emojis→Lucide |
| `src/components/layout/AuthModal.tsx` | `htmlFor` en labels |
| `src/pages/Home.tsx` | Emojis→Lucide, FOMO aria-live, document.title, dimensiones, crossOrigin |
| `src/pages/ProductDetail.tsx` | Emojis→Lucide, document.title, crossOrigin, dimensiones |
| `src/pages/CategoryPage.tsx` | Emojis→Lucide, document.title |
| `src/pages/CategoriesPage.tsx` | Emojis→Lucide, document.title |
| `src/pages/SearchPage.tsx` | document.title |
| `src/pages/AccountPage.tsx` | document.title |
| `src/pages/OrdersPage.tsx` | document.title |

---

## Lección 19: Widget Chatbot N8N 🤖💬

### 🔍 Contexto

Se integró un chatbot asistente vía N8N en la esquina inferior derecha, posicionado encima del botón de WhatsApp con solapamiento parcial.

### 📐 Arquitectura

```
Pantalla (esquina inferior derecha):
┌────────────────────┐
│  Chat Widget (360px)│  ← Se abre al hacer click
│  [iframe N8N]      │
│                    │
└────────────────────┘
        🟡  ← Botón chatbot (bottom-24 right-6)
        🟢  ← Botón WhatsApp (bottom-6 right-6)
```

### 🧩 Componente ChatBot

**Archivo:** `src/components/layout/ChatBot.tsx`

```tsx
const N8N_URL = "https://n8n.skatmaskacore.com/webhook/chatbot-calendar-001/chat"

export function ChatBot() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed bottom-32 right-6 z-50 w-[360px] h-[520px]
                        rounded-2xl border border-border/30
                        bg-background/80 backdrop-blur-2xl
                        shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-card/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg
                              bg-gradient-to-br from-primary to-amber-400 shadow-sm">
                <MessageSquareMore className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-sm font-semibold text-foreground">Asistente</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe src={N8N_URL} className="h-full w-full flex-1 border-0"
                  title="Chatbot asistente" />
        </div>
      )}
      <button onClick={() => setOpen((prev) => !prev)}
              className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center
                         rounded-full bg-gradient-to-br from-primary to-amber-400
                         text-primary-foreground shadow-lg shadow-primary/30
                         transition-all duration-200 hover:scale-110
                         hover:shadow-xl hover:shadow-primary/40 active:scale-95"
              aria-label={open ? "Cerrar chat" : "Abrir chat"}>
        {open ? <X className="h-5 w-5" /> : <MessageSquareMore className="h-5 w-5" />}
      </button>
    </>
  )
}
```

### 🎨 Diseño

| Elemento | Estilo | Justificación |
|---|---|---|
| **Burbuja** | `h-12 w-12`, gradiente `from-primary to-amber-400` | Misma paleta que el logo "M" del Header |
| **Posición** | `bottom-24 right-6` | 18px arriba del WhatsApp (bottom-6 + diff de alturas) |
| **Chat window** | `360x520px`, `bg-background/80 backdrop-blur-2xl` | Glassmorphism consistente con el Header |
| **Cabecera** | `bg-card/40`, ícono `MessageSquareMore` | Branding + ícono reconocible |
| **Sombra** | `shadow-lg shadow-primary/30` → `shadow-xl shadow-primary/40` | Coherente con el sistema de diseño |
| **Transición** | `duration-200 hover:scale-110 active:scale-95` | Micro-interacción estándar del proyecto |

### 🔗 Integración App.tsx

```tsx
import { ChatBot } from "@/components/layout/ChatBot"

// Dentro del render:
<ErrorBoundary>
  <Routes>...</Routes>
  <ChatBot />
  <WhatsAppButton />
</ErrorBoundary>
```

### 🔧 Fix adicional: Texto del Hero legible

Se cambió el color del texto descriptivo en el Hero de `text-muted-foreground` a `text-white/80` para que sea legible contra las imágenes de fondo Unsplash:

```tsx
<p data-anim className="mt-6 max-w-lg text-base text-white/80 font-light leading-relaxed sm:text-lg">
  {content.desc}
</p>
```

### 📁 Archivos creados

| Archivo | Propósito |
|---|---|
| `src/components/layout/ChatBot.tsx` | Widget flotante del chatbot N8N |

### 📁 Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | +import ChatBot, +render `<ChatBot />` |
| `src/components/layout/Hero.tsx` | Descripción `text-white/80` para legibilidad |

---

## Completado ✅

| Lección | Tema |
|---|---|
| 1 | Creación proyecto Vite + React + TS |
| 2 | Tailwind CSS |
| 3-4 | shadcn/ui |
| 5 | Skills: python-fastapi |
| 6a | Skills: ui-ux-pro-max + owasp-security |
| 6b | AGENTS.md + reglas del proyecto |
| 6c | OWASP Security skill |
| 6d | Skills obligatorios en rules |
| 6e | Script de instalación completo |
| 7 | Layout base de la tienda |
| 7b | Liquid Glass + diseño UI/UX Pro Max |
| 8 | Backend FastAPI + SQLAlchemy |
| 8.5 | Imágenes reales + marketing + neuromarketing |
| 9 | Autenticación JWT |
| 10 | React Router (páginas y navegación) |
| 10.5 | Dropdowns + buscador funcional |
| 11 | Endpoint de categorías |
| 12 | Animaciones GSAP |
| 13 | Panel Admin SQLAdmin + auth + responsive |
| OWASP | Security checklist completado |
| **14** | **UX + Neuromarketing (4 mejoras)** |
| **15** | **Timer en carrusel + sección de contacto** |
| **16** | **Hero dinámico: copy distinto por slide** |
| **17** | **Panel usuario + Pedidos + Checkout** |
| **18** | **Auditoría UI/UX — Accesibilidad WCAG + Calidad** |
| **19** | **Widget Chatbot N8N** |
