# Guía: Montar un SPA con FastAPI + React — Errores y Soluciones

## Índice

1. [Arquitectura del proyecto](#1-arquitectura-del-proyecto)
2. [El problema del SPA routing](#2-el-problema-del-spa-routing)
3. [Primer intento (fallido): SPAStaticFiles](#3-primer-intento-fallido-spastaticfiles)
4. [Solución definitiva: Middleware HTTP](#4-solución-definitiva-middleware-http)
5. [Paso a paso: Montar desde cero](#5-paso-a-paso-montar-desde-cero)
6. [Docker + Coolify: Despliegue](#6-docker--coolify-despliegue)
7. [Checklist de errores comunes](#7-checklist-de-errores-comunes)

---

## 1. Arquitectura del proyecto

```
┌──────────────────────────────────────────────────┐
│                   Coolify (Proxy)                │
│  / → FastAPI   /api/* → FastAPI   /producto/2 → │
└──────────┬───────────────────────────┬───────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────────┐
│   FastAPI (backend)  │   │   FastAPI (backend)      │
│   Sirve index.html   │   │   API endpoints          │
│   (SPA)              │   │   /api/products/2        │
└─────────────────────┘   └─────────────────────────┘
           ▲
           │
┌──────────┴──────────┐
│   React SPA (dist)  │
│   index.html        │
│   /assets/*.js      │
│   /assets/*.css     │
└─────────────────────┘
```

El flujo es:

- **`/`** → FastAPI sirve `static/index.html` → React Router carga Home
- **`/producto/2`** → FastAPI **debería** servir `static/index.html` → React Router detecta la ruta y renderiza ProductDetail → llama a `/api/products/2`
- **`/api/products/2`** → FastAPI responde con JSON del producto

El problema: cuando accedes directamente a `/producto/2` (refresco, o un bot de n8n redirige), FastAPI no sabe que debe servir `index.html` y responde con `{"detail":"Not Found"}`.

---

## 2. El problema del SPA routing

Una SPA (Single Page Application) tiene UNA sola página HTML (`index.html`). La navegación entre rutas (`/producto/2`, `/categoria/audio`) la hace **JavaScript en el navegador** (React Router).

Cuando el usuario **clickea** un enlace, React cambia la URL sin recargar la página → funciona.

Cuando el usuario **refresca** o un **bot envía** la URL directamente, el navegador pide ESA ruta al servidor. El servidor no tiene un archivo `producto/2/index.html`, así que devuelve 404.

La solución se llama **SPA fallback**: el servidor debe servir `index.html` para TODAS las rutas que no sean API.

---

## 3. Primer intento (fallido): SPAStaticFiles

```python
# ❌ ESTO NO FUNCIONÓ EN PRODUCCIÓN
if os.path.isdir("static"):
    class SPAStaticFiles(StaticFiles):
        async def get_response(self, path: str, scope):
            try:
                return await super().get_response(path, scope)
            except (HTTPException, Exception) as e:
                if isinstance(e, HTTPException) and e.status_code == 404:
                    return await super().get_response("index.html", scope)
                raise

    app.mount("/", SPAStaticFiles(directory="static", html=True), name="static")
```

**¿Por qué falló?**

Cuando `get_response()` lanza un `HTTPException(404)`, la clase `StaticFiles` de Starlette **no lo propaga directamente**. Internamente:

1. `__call__` llama a `get_response()`
2. `get_response()` lanza `HTTPException(404)` si no encuentra el archivo
3. **La excepción se captura en el ASGI loop y se convierte en respuesta HTTP**
4. El `try/except` de `SPAStaticFiles.get_response()` **nunca llega a ejecutarse** porque la excepción se maneja a nivel de sub-app, no del método `get_response`

Dependiendo de la versión de Starlette, este patrón puede funcionar o no. En Starlette 1.0.0+ dejó de funcionar porque cambiaron el flujo interno.

**Lección:** No sobreescribir métodos internos de Starlette sin verificar el comportamiento en la versión exacta.

---

## 4. Solución definitiva: Middleware HTTP

```python
# ✅ ESTO FUNCIONA SIEMPRE
_has_static = os.path.isdir("static")

if _has_static:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

    @app.middleware("http")
    async def _spa_fallback(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api/"):
            return FileResponse("static/index.html")
        return response
```

**¿Por qué funciona?**

El middleware envuelve TODA la aplicación. Cuando el `StaticFiles` montado en `/` devuelve un 404 (porque no existe `producto/2/index.html`), la respuesta pasa por el middleware. El middleware:

1. Ve que el `status_code` es 404
2. Ve que la ruta NO empieza con `/api/`
3. **Sirve `index.html` en su lugar**

Ventajas:
- Funciona con cualquier versión de Starlette/FastAPI
- No depende de try/except internos
- Respeta los 404 reales de la API (`/api/productos/999` → sigue dando JSON 404)
- Simple de entender y depurar

Desventajas (menores):
- Un extra `if` por cada request que da 404 (irrelevante para rendimiento)
- El middleware lee el body de la respuesta (tampoco es problema aquí)

---

## 5. Paso a paso: Montar desde cero

### 5.1. Backend (FastAPI)

```
backend/
  src/
    app/
      main.py          ← El punto de entrada
      features/
        products/      ← API de productos
        cart/
        auth/
        orders/
        users/
  static/              ← Aquí va el build del frontend
```

`main.py` configuración clave:

```python
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Rutas de la API
app.include_router(products_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
# ...

# SPA Fallback - SIEMPRE al final
_has_static = os.path.isdir("static")

if _has_static:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

    @app.middleware("http")
    async def _spa_fallback(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api/"):
            return FileResponse("static/index.html")
        return response
```

**Regla de ORO:** El mount del SPA y el middleware deben ir DESPUÉS de todas las rutas de la API.

### 5.2. Frontend (React + Vite)

```
mi-tienda-frontend/
  src/
    App.tsx            ← Aquí se definen las rutas
    pages/
      Home.tsx
      ProductDetail.tsx   ← /producto/:id
      CategoryPage.tsx
      ...
  dist/                ← Build de producción (npm run build)
  vite.config.ts
```

`App.tsx` con React Router:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/producto/:id"        element={<ProductDetail />} />
        <Route path="/categoria/:category" element={<CategoryPage />} />
        {/* más rutas... */}
      </Routes>
    </BrowserRouter>
  )
}
```

`ProductDetail.tsx`:

```tsx
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(setProduct)
  }, [id])

  if (!product) return <div>Cargando...</div>
  return <div>{/* renderizar producto */}</div>
}
```

### 5.3. Construir y copiar

```bash
# 1. Construir frontend
cd mi-tienda-frontend
npm install
npm run build    # → genera dist/

# 2. Copiar al backend
Copy-Item -Path "dist/*" -Destination "../backend/static/" -Recurse -Force
```

Alternativa con Docker (recomendado):

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-alpine AS frontend
WORKDIR /build
COPY mi-tienda-frontend/ .
RUN npm install && npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/ .
COPY --from=frontend /build/dist /app/static

ENV PYTHONPATH=/app/src
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## 6. Docker + Coolify: Despliegue

### 6.1. El Dockerfile

El Dockerfile tiene dos fases (multi-stage):

| Fase | Imagen | Qué hace |
|------|--------|----------|
| `frontend` | `node:20-alpine` | Instala npm y construye React → `dist/` |
| final | `python:3.12-slim` | Instala Python, copia backend + `dist/` como `static/` |

**Cuidado:** La línea `COPY --from=frontend /build/dist /app/static` copia los archivos de `dist/` A `static/`. Si en Coolify cambias el `WORKDIR` o la estructura, la ruta `os.path.isdir("static")` puede fallar.

### 6.2. Coolify

En Coolify:

1. Conecta tu repositorio Git
2. Selecciona **Dockerfile** como tipo de build
3. Coolify construirá la imagen y la ejecutará
4. El puerto debe ser `8080` (el EXPOSE del Dockerfile)

**Nota importante:** Coolify a veces tiene su propio proxy inverso que puede interferir. Si ves que la homepage funciona pero las rutas no, verifica que el proxy NO esté sirviendo `index.html` directamente (eso rompe el fallback del backend).

### 6.3. Flujo completo de deploy

```bash
# 1. Hacer cambios en el código
# 2. Commit y push
git add .
git commit -m "fix: SPA fallback con middleware"
git push

# 3. En Coolify: botón "Redeploy"
```

---

## 7. Checklist de errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `{"detail":"Not Found"}` al navegar directo | Falta SPA fallback | Añadir middleware (sección 4) |
| Homepage funciona, rutas no | El montaje StaticFiles no atrapa subrutas | Misma solución que arriba |
| La homepage da 404 | `static/` no existe o está vacío | Verificar `os.path.isdir("static")` |
| El bot de n8n redirige y da 404 | Es el mismo problema: acceso directo a ruta | Implementar SPA fallback |
| Assets (JS/CSS) no cargan | `index.html` referencia `/assets/...` pero el mount usa prefijo distinto | Asegurar mount en `/` |
| Error `admin_email` al iniciar | Variables de entorno extra en `.env` no definidas en `Settings` | Revisar `config.py` |
| Error de importación (`passlib`, etc.) | Dependencias no instaladas | Usar `pip install` desde el Dockerfile |
| Docker build falla | Error en frontend build | Revisar `npm run build` localmente |

### El error más común: Todo funciona en local pero no en producción

Síntomas:
- Local: `npm run dev` + backend funcionan
- Producción: homepage OK, pero refrescar ruta da `{"detail":"Not Found"}`

Causas probables:
1. **El middleware no está en el código desplegado** → verificar `git push` + redeploy
2. **El proxy de Coolify interfiere** → revisar configuración de proxy en Coolify
3. **La carpeta `static/` no existe en el contenedor** → hacer `docker exec -it <container> ls /app/static` para verificar
4. **El `os.path.isdir("static")` da False** → el CWD no es el esperado

Para diagnosticar en producción:

```bash
# Entrar al contenedor
docker exec -it <container> sh

# Verificar estructura
ls -la /app/static/
ls -la /app/static/index.html

# Verificar PYTHONPATH
echo $PYTHONPATH

# Verificar CWD
pwd
```

---

## Conclusión

El patrón correcto para servir un SPA con FastAPI es:

```
0. Construir frontend → dist/
1. Copiar dist/ → static/
2. FastAPI: app.mount("/", StaticFiles(...))
3. Middleware: atrapar 404 no-API y servir index.html
4. Docker: multi-stage build que copia dist/ a static/
5. Coolify: simplemente redeploy
```

El error de `{"detail":"Not Found"}` al refrescar NO es un bug de tu código, es el comportamiento esperado de FastAPI. El fix es añadir la capa de middleware que hace el fallback a `index.html` para cualquier ruta que no sea de la API.
