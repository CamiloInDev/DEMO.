# 🛡️ Observación de Seguridad — Market

Registro detallado de todas las medidas de seguridad implementadas en el proyecto, explicadas desde cero.

---

## Índice

1. [Skill OWASP Security](#1-skill-owasp-security)
2. [SECURITY.md — Reglas del proyecto](#2-securitymd--reglas-del-proyecto)
3. [bcrypt — Hash de contraseñas](#3-bcrypt--hash-de-contraseñas)
4. [JWT — JSON Web Tokens](#4-jwt--json-web-tokens)
5. [Rate Limiting — Límite de peticiones](#5-rate-limiting--límite-de-peticiones)
6. [CORS — Orígenes permitidos](#6-cors--orígenes-permitidos)
7. [Pydantic — Validación de datos](#7-pydantic--validación-de-datos)
8. [SQLAlchemy — Consultas parametrizadas](#8-sqlalchemy--consultas-parametrizadas)
9. [get_current_user — Control de acceso](#9-get_current_user--control-de-acceso)
10. [Structured Logging — Registro estructurado](#10-structured-logging--registro-estructurado)
11. [Error Handling — Manejo de errores](#11-error-handling--manejo-de-errores)
12. [Environment Variables — Variables de entorno](#12-environment-variables--variables-de-entorno)
13. [UserUpdate — Validación de contraseña al editar](#13-userupdate--validación-de-contraseña-al-editar)
14. [Bug corregido: Carrito a pedido](#14-bug-corregido-carrito-a-pedido)
15. [Resumen: Checklist OWASP final](#15-resumen-checklist-owasp-final)

---

## 1. Skill OWASP Security

### ¿Qué es?

Un skill es un conjunto de instrucciones que le enseña a la IA (OpenCode) a escribir código seguro. El skill `owasp-security` cubre:

- **OWASP Top 10:2025** — Las 10 vulnerabilidades más críticas en apps web
- **ASVS 5.0** — Estándar de verificación de seguridad (3 niveles)
- **LLM Top 10 2025** — Seguridad para apps con IA
- **Agentic AI 2026** — Seguridad para agentes autónomos
- **Patrones seguros por lenguaje** — 20 lenguajes con sus pitfalls

### Instalación

```powershell
New-Item -ItemType Directory -Force -Path ".agents/skills/owasp-security"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/agamm/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md" -OutFile ".agents/skills/owasp-security/SKILL.md"
```

### ¿Cómo se activa?

En `AGENTS.md` y `SECURITY.md` se le ordena a la IA cargar este skill siempre que se toquen temas de seguridad: auth, validación, cifrado, revisión de código, etc.

---

## 2. SECURITY.md — Reglas del proyecto

Archivo en la raíz que contiene reglas cortas de seguridad que la IA debe seguir siempre:

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

**Dato importante:** `SECURITY.md` se carga siempre (indicado en `AGENTS.md`), a diferencia de `FRONTEND_RULES.md` y `BACKEND_RULES.md` que solo se cargan según el contexto.

---

## 3. bcrypt — Hash de contraseñas

### ¿Qué es bcrypt?

bcrypt es un algoritmo de hash de contraseñas **lento por diseño**. A diferencia de MD5 o SHA (que son rápidos), bcrypt tarda ~100ms en calcularse. Esto hace que si un atacante roba la base de datos, le tome **años** descifrar las contraseñas.

### ¿Por qué no guardar la contraseña tal cual?

Si guardas `password = "123456"` en la base de datos y alguien accede a ella, tiene TODAS las contraseñas de tus usuarios. Con hash, solo tiene texto ilegible como `$2b$12$LJ3m...`.

### Código implementado

**backend/src/app/core/security.py:**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Convierte '123456' → '$2b$12$LJ3m...' (hash de 60 caracteres)"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara '123456' contra '$2b$12$LJ3m...' y dice si coinciden"""
    return pwd_context.verify(plain_password, hashed_password)
```

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: guardar contraseña en texto plano
user.password = "miPassword123"  # Si alguien accede a la BD, las tiene todas

# ❌ INSEGURO: algoritmo obsoleto (MD5)
import hashlib
hashed = hashlib.md5("miPassword123".encode()).hexdigest()  # Se descifra en segundos

# ❌ INSEGURO: SHA256 (rápido, vulnerable a fuerza bruta)
import hashlib
hashed = hashlib.sha256("miPassword123".encode()).hexdigest()  # 10M hashes/segundo

# ✅ SEGURO: bcrypt (lento por diseño, 100ms por hash)
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])
hashed = pwd_context.hash("miPassword123")  # $2b$12$... (10 hashes/segundo)
```

### Flujo real

```
Registro:
  Usuario envía: {"email": "a@b.com", "password": "miPassword123"}
  Backend: hash_password("miPassword123") → "$2b$12$..."
  Backend: guarda en DB: email="a@b.com", hashed_password="$2b$12$..."

Login:
  Usuario envía: {"email": "a@b.com", "password": "miPassword123"}
  Backend: busca en DB por email → encuentra "$2b$12$..."
  Backend: verify_password("miPassword123", "$2b$12$...") → True ✅
  Backend: crea JWT y lo devuelve
```

### ¿Qué significa `$2b$12$...`?

| Parte | Significado |
|---|---|
| `$2b$` | Versión de bcrypt |
| `12` | Coste (2^12 = 4096 iteraciones). Más alto = más seguro = más lento |
| `...` | Salt (22 caracteres) + hash (31 caracteres) |

### Dependencias

```bash
pip install passlib[bcrypt] bcrypt==4.0.1
```

**Problema común:** `passlib` no es compatible con `bcrypt >= 4.1`. Solución: instalar `bcrypt==4.0.1`.

---

## 4. JWT — JSON Web Tokens

### ¿Qué es JWT?

JWT (JSON Web Token) es un token que prueba que un usuario está autenticado. Es como un **carnet de identidad digital**: contiene quién eres y está firmado para que nadie pueda falsificarlo.

### ¿Cómo funciona?

```
1. Usuario hace login con email + contraseña
2. Servidor verifica contraseña (bcrypt)
3. Servidor crea JWT: { "sub": "1", "exp": "2026-05-13T12:00:00" }
4. Servidor firma el JWT con una clave secreta (HS256)
5. Servidor devuelve el JWT al cliente
6. Cliente guarda el JWT en localStorage
7. Cliente envía JWT en cada request (header "Authorization: Bearer <token>")
8. Servidor verifica la firma del JWT → sabe que es auténtico
9. Servidor extrae "sub" (user_id) del JWT → sabe quién es el usuario
```

### ¿Por qué JWT y no sesiones?

| Sesiones (Django) | JWT |
|---|---|
| Guardas sesión en servidor (BD o Redis) | NO guardas nada en servidor |
| El servidor tiene que buscar la sesión en cada request | El servidor solo verifica la firma (más rápido) |
| Escalar a varios servidores requiere compartir sesiones | Cualquier servidor puede verificar el JWT |

### Código implementado

**backend/src/app/core/security.py:**

```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

# Crear token (válido por 60 minutos)
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")

# Verificar token
def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        return None  # Token inválido o expirado
```

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: sesión tradicional en servidor (Django-style)
# Ocupa memoria/BD, difícil de escalar
request.session["user_id"] = 1

# ❌ INSEGURO: token sin firma (base64, cualquiera lo modifica)
import base64
token = base64.b64encode(b'{"user_id": 1}')  # Se decodifica y cambia fácil

# ✅ SEGURO: JWT firmado con HS256
# El token está firmado, si alguien lo modifica, la firma no coincide
token = jwt.encode({"sub": "1", "exp": expire}, SECRET_KEY, algorithm="HS256")
```

### El JWT por dentro

```javascript
// Header (algoritmo)
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (datos)
{
  "sub": "1",           // user_id
  "exp": 1747123200     // fecha de expiración (timestamp Unix)
}

// Signature (firma)
// HMAC-SHA256(base64(header) + "." + base64(payload), secret_key)
```

### Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `401 Unauthorized` | Token expiró (60 min) | Hacer login de nuevo |
| `401 Token inválido` | Token manipulado | JWT tiene firma, detecta manipulación |
| No cierra sesión al recargar | Token no persiste | Guardar en `localStorage`, no en variable |

---

## 5. Rate Limiting — Límite de peticiones

### ¿Qué es?

Limita cuántas veces un usuario puede llamar a un endpoint en un período de tiempo. Evita ataques de fuerza bruta (ej: probar 1 millón de contraseñas por minuto).

### Implementación con slowapi

**backend/src/app/core/rate_limit.py:**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**Límites configurados:**

| Endpoint | Límite | ¿Por qué? |
|---|---|---|
| `POST /api/auth/register` | 5/minuto | Evita crear miles de cuentas automáticas |
| `POST /api/auth/login` | 10/minuto | Evita fuerza bruta en login |
| `POST /api/cart` | 30/minuto | Evita flood de requests al carrito |
| `DELETE /api/cart/{item_id}` | 20/minuto | Misma razón |

**Cómo se aplica:**

```python
@router.post("/register", ...)
@limiter.limit("5/minute")
async def register(request: Request, ...):
    ...

@router.post("/login", ...)
@limiter.limit("10/minute")
async def login(request: Request, ...):
    ...
```

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: sin rate limiting
# Un atacante puede probar 1.000.000 de contraseñas por minuto
@router.post("/login")
async def login(req: LoginRequest):
    user = auth_service.login(req.email, req.password)
    return user

# ✅ SEGURO: con rate limiting
# Solo 10 intentos por minuto por IP
@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, req: LoginRequest):
    user = auth_service.login(req.email, req.password)
    return user
```

### Dato clave

`slowapi` usa la IP del cliente para contar requests. Si un atacante tiene 1000 IPs distintas (botnet), el rate limiting por IP no sirve. Para eso se necesita rate limiting por usuario autenticado o CAPTCHA.

---

## 6. CORS — Orígenes permitidos

### ¿Qué es CORS?

Cross-Origin Resource Sharing — controla qué dominios pueden llamar a tu API. Sin CORS, cualquier página web podría hacer peticiones a tu backend.

### Configuración

**backend/src/app/main.py:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Solo permitimos:
- `localhost:5173` — Frontend en desarrollo (Vite)
- `127.0.0.1:5173` — Mismo frontend pero con IP local

**En producción**, se cambian por el dominio real (ej: `https://mitienda.com`).

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: CORS abierto a cualquier origen
# Cualquier página web puede hacer fetch a tu API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ¡PELIGRO!
    ...
)

# ✅ SEGURO: CORS restringido a orígenes específicos
# Solo localhost:5173 puede llamar a la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    ...
)
```

### ¿Qué pasa si ponemos `allow_origins=["*"]`?

Cualquier página web en internet podría hacer fetch a tu API. Esto permitiría que un sitio malicioso robe datos de tus usuarios si están autenticados (CSRF).

---

## 7. Pydantic — Validación de datos

### ¿Qué es Pydantic?

Es la librería que valida los datos que entran y salen del backend. Define **esquemas** con tipos y reglas.

### ¿Por qué es seguridad?

Si el frontend envía `{"price": -500}` o `{"email": "no-es-un-email"}`, Pydantic lo rechaza antes de que llegue a la base de datos.

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: sin validación
# Cualquier dato basura llega a la base de datos
@router.post("/register")
async def register(email: str, password: str):  # Sin tipos reales
    user = User(email=email, password=password)  # password en texto plano
    db.add(user)
    await db.commit()
    return user

# ✅ SEGURO: con Pydantic
# Los datos se validan antes de llegar a la BD
class RegisterRequest(BaseModel):
    email: str
    password: str
    
    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v

@router.post("/register")
async def register(req: RegisterRequest):
    user = auth_service.register(req)  # req YA está validado
    return user
```

### Ejemplo de validación

**backend/src/app/features/auth/schemas.py:**

```python
from pydantic import BaseModel, field_validator

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v
```

### Validaciones en productos

**backend/src/app/features/products/schemas.py:**

```python
class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: str
    price: float
    original_price: float | None = None
    image: str
    images: list[str] = []
    category: str
    rating: float
    stock: int = 0

    @field_validator("name", "description", "image")
    @classmethod
    def no_empty_strings(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Este campo no puede estar vacío")
        if len(v) > 500:
            raise ValueError("Este campo es demasiado largo (máx 500 caracteres)")
        return v

    @field_validator("price", "rating")
    @classmethod
    def no_negatives(cls, v: float) -> float:
        if v < 0:
            raise ValueError("El valor no puede ser negativo")
        return v
```

### ¿Qué previene cada validación?

| Validación | Previene |
|---|---|
| `len(v) < 8` | Contraseñas débiles |
| `no_empty_strings` | Nombres/descripciones vacíos |
| `len(v) > 500` | Ataques de buffer/texto enorme |
| `no_negatives` | Precios negativos (lógica de negocio corrupta) |
| `model_config = ConfigDict(from_attributes=True)` | Que el schema funcione con SQLAlchemy |

---

## 8. SQLAlchemy — Consultas parametrizadas

### ¿Qué es SQL Injection?

Es cuando un atacante mete código SQL en un input. Ejemplo clásico:

```python
# ❌ PELIGROSO: String concatenation
query = f"SELECT * FROM users WHERE email = '{email}'"
# Si email = "' OR '1'='1", la query se convierte en:
# SELECT * FROM users WHERE email = '' OR '1'='1'
# → Devuelve TODOS los usuarios
```

### Cómo lo prevenimos

Usamos SQLAlchemy ORM, que **siempre** usa consultas parametrizadas:

```python
# ✅ SEGURO: SQLAlchemy ORM
result = await self.db.execute(
    select(User).where(User.email == email)
)
# SQLAlchemy convierte esto automáticamente a:
# SELECT * FROM users WHERE email = ?  ← parámetro, no concatenación
```

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: concatenación de strings (SQL Injection)
# Si email = "' OR '1'='1", devuelve TODOS los usuarios
query = f"SELECT * FROM users WHERE email = '{email}'"
cursor.execute(query)  

# ❌ INSEGURO: otra forma, igual de vulnerable
query = "SELECT * FROM users WHERE email = '%s'" % email
cursor.execute(query)

# ✅ SEGURO: SQLAlchemy ORM (parametrizado automáticamente)
# SQLAlchemy convierte a: SELECT * FROM users WHERE email = ?
# El ? se reemplaza por el valor como DATO, no como código SQL
result = await self.db.execute(
    select(User).where(User.email == email)
)
```

### Todos los repositorios usan este patrón

```python
# ProductRepository
result = await self.db.execute(select(Product).where(Product.id == product_id))

# CartRepository
result = await self.db.execute(select(CartItem).where(CartItem.user_id == user_id))

# UserRepository
result = await self.db.execute(select(User).where(User.email == email))
```

### ¿Por qué SQLAlchemy es seguro?

1. Usa `?` como placeholder en lugar de concatenar strings
2. La base de datos recibe el valor por separado, no como parte del SQL
3. Aunque el valor contenga `'; DROP TABLE users; --`, la BD lo trata como un string, no como código SQL

---

## 9. get_current_user — Control de acceso

### ¿Qué hace?

Extrae el usuario autenticado del token JWT en cada request. Si el token no es válido, devuelve 401.

### Código

**backend/src/app/features/users/api.py:**

```python
async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    # 1. ¿El header tiene "Authorization: Bearer <token>"?
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    # 2. Extraer el token
    token = authorization.split(" ")[1]

    # 3. Verificar la firma del token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    # 4. Buscar usuario en BD por el ID del token
    repo = UserRepository(db)
    user = await repo.get_by_id(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
```

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: cualquiera puede ver el carrito de otro usuario
@router.get("/cart")
async def list_cart(user_id: int):  # El user_id viene del cliente
    return await service.list_items(user_id)
# Un atacante cambia user_id=2 y ve el carrito de otro

# ✅ SEGURO: el user_id viene del JWT, no del cliente
@router.get("/cart")
async def list_cart(
    service: CartService = Depends(get_service),
    user: User = Depends(get_current_user),  # user_id del token
):
    return await service.list_items(user.id)  # user.id del JWT, inmutable
```

### ¿Dónde se usa?

En todos los endpoints que requieren autenticación:

```python
@router.get("/cart", response_model=list[CartItemResponse])
async def list_cart(
    service: CartService = Depends(get_service),
    user: User = Depends(get_current_user),  # ← Aquí
):
    return await service.list_items(user.id)
```

### Principio de seguridad aplicado

**Fail-closed (denegar por defecto):** Si no hay token o es inválido, se deniega el acceso. Nunca se permite el acceso por error.

**User ID desde el token, no del cliente:** El `user_id` se extrae del JWT, no del cuerpo de la request. Un atacante no puede modificar el user_id porque el JWT está firmado.

---

## 10. Structured Logging — Registro estructurado

### ¿Qué es?

En lugar de `print("Error: algo pasó")`, se usa un logger estructurado que registra eventos con contexto.

### Implementación con structlog

**backend/src/app/main.py:**

```python
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)
logger = structlog.get_logger()

logger.info("App started", app_name=settings.app_name)
```

### ¿Por qué es seguridad?

- Si alguien intenta 1000 logins fallidos, los logs muestran el patrón
- Si hay un error interno, el log tiene contexto para debuggear
- Los logs estructurados se pueden analizar automáticamente (ELK, Datadog, etc.)

---

## 11. Error Handling — Manejo de errores

### Principio: Fail-closed

Cuando ocurre un error inesperado, el sistema debe **denegar el acceso** en lugar de permitirlo.

### Código seguro vs inseguro

```python
# ❌ INSEGURO: Fail-open
def check_permission(user, resource):
    try:
        return auth_service.check(user, resource)
    except Exception:
        return True  # ¡PELIGROSO! Si falla, permite el acceso

# ✅ SEGURO: Fail-closed
def check_permission(user, resource):
    try:
        return auth_service.check(user, resource)
    except Exception as e:
        logger.error(f"Auth check failed: {e}")
        return False  # Si falla, deniega
```

### FastAPI maneja esto automáticamente

```python
# Si ocurre una excepción no manejada, FastAPI devuelve:
# {"detail": "Internal Server Error"}
# Sin stack traces, sin información interna
```

### En el proyecto

- `get_current_user` retorna 401 si el token falta o es inválido ✅
- `get_product` retorna 404 si el producto no existe ✅
- `checkout` retorna 400 si el carrito está vacío ✅

---

## 12. Environment Variables — Variables de entorno

### ¿Qué son?

Valores de configuración que NO están en el código, sino en un archivo `.env` que no se sube al repositorio.

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: secretos hardcodeados en el código
# Si subes esto a GitHub, cualquiera tiene tu SECRET_KEY
SECRET_KEY = "mi-clave-super-secreta"  # ¡NUNCA! Cualquiera puede firmar JWTs falsos

# ✅ SEGURO: secretos en variables de entorno
# SECRET_KEY está en .env, que está en .gitignore
# En el código solo se referencia:
secret_key = settings.secret_key  # Viene de .env, no del código
```

### Configuración

**backend/.env:** (NO se sube a GitHub)

```env
DATABASE_URL=sqlite+aiosqlite:///market.db
SECRET_KEY=tu-clave-secreta-aqui
ADMIN_EMAIL=admin@market.com
ADMIN_PASSWORD=admin123
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**backend/src/app/config.py:**

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    
    app_name: str = "Market API"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///market.db"
    secret_key: str = "change-me"
    admin_email: str = "admin@market.com"
    admin_password: str = "admin123"
    access_token_expire_minutes: int = 60
```

### ¿Por qué es seguridad?

- La `SECRET_KEY` (usada para firmar JWT) no está en el código
- Si alguien obtiene el código fuente, no puede firmar tokens falsos
- En producción se usan valores diferentes que en desarrollo
- El archivo `.env` está en `.gitignore` (no se sube a GitHub)

---

## 13. UserUpdate — Validación de contraseña al editar

### ¿Qué se agregó?

Cuando un usuario edita su perfil (`PATCH /api/users/me`), puede cambiar su contraseña. Pero debe cumplir los mismos requisitos que al registrarse.

### ❌ Antes (inseguro) vs ✅ Después (seguro)

```python
# ❌ INSEGURO: sin validación, sin hash en edición
@router.patch("/me")
async def update_me(password: str):
    user.password = password  # Se guarda en texto plano
    return user
# Problemas: 
#   1. Password en texto plano
#   2. Sin mínimo de caracteres
#   3. Password "" (vacío) se guarda como contraseña

# ✅ SEGURO: validación + hash + password vacío ignorado
class UserUpdate(BaseModel):
    password: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if v is None: return v       # No se envió → no validar
        if v == "": return None      # Vacío → convertirlo a None
        if len(v) < 8: raise ValueError("Mínimo 8 caracteres")
        return v

# En api.py:
update_data = data.model_dump(exclude_unset=True)
if "password" in update_data:
    update_data["hashed_password"] = hash_password(update_data.pop("password"))
```

### Código implementado

**backend/src/app/features/users/schemas.py:**

```python
class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    password: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str | None) -> str | None:
        # Si no se envió password, no validar
        if v is None:
            return v
        # Si se envió vacío, convertirlo a None (no actualizar)
        if v == "":
            return None
        # Si se envió pero es muy corto, rechazar
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v
```

### Casos que maneja

| El usuario envía | ¿Qué pasa? |
|---|---|
| `{}` (sin password) | `password` es `None` → no se valida, no se actualiza |
| `{"password": ""}` | Se convierte a `None` → no se actualiza |
| `{"password": "abc"}` | Error: "La contraseña debe tener al menos 8 caracteres" |
| `{"password": "12345678"}` | Se valida OK → se hashea con bcrypt → se guarda |

### ¿Por qué es necesario?

Sin esta validación, un usuario podría poner una contraseña de 1 carácter, lo que facilitaría que alguien adivine su cuenta.

---

## 14. Bug corregido: Carrito a pedido

### ¿Qué pasó?

Durante la revisión OWASP, se encontraron 2 bugs en el servicio de checkout (`orders/services.py`):

### Bug 1: Método incorrecto

```python
# ❌ ANTES (no existía este método)
cart_items = await self.cart_repo.get_user_cart(user_id)

# ✅ DESPUÉS (el método real se llama get_by_user)
cart_items = await self.cart_repo.get_by_user(user_id)
```

**¿Por qué pasó?** El repositorio de carrito tenía `get_by_user()`, no `get_user_cart()`. Esto habría causado un `AttributeError` en tiempo de ejecución.

### Bug 2: Tipo incorrecto en delete

```python
# ❌ ANTES (delete espera un objeto CartItem, no un int)
for ci in cart_items:
    await self.cart_repo.delete(ci.id)

# ✅ DESPUÉS (se pasa el objeto completo)
for ci in cart_items:
    await self.cart_repo.delete(ci)
```

**¿Por qué pasó?** La función `delete(self, item: CartItem)` espera el objeto CartItem completo, pero se le pasaba `ci.id` (un entero). Esto habría causado un error porque SQLAlchemy espera el objeto para borrarlo de la sesión.

### Lección aprendida

Siempre revisar que los nombres de métodos y tipos de parámetros coincidan entre el llamado y la definición.

---

## 15. Resumen: Checklist OWASP final

### OWASP Top 10:2025

| # | Vulnerabilidad | Prevención | Estado |
|---|---|---|---|
| A01 | Broken Access Control | Carrito scoped por usuario, user_id del JWT | ✅ |
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
| Passwords mínimo 8 caracteres (registro) | ✅ `RegisterRequest.password_min_length` |
| Passwords mínimo 8 caracteres (edición) | ✅ `UserUpdate.password_min_length` |
| Passwords vacío no se actualiza | ✅ `"" → None` |
| Rate limiting en autenticación | ✅ 5/min register, 10/min login |
| JWT con HS256 (128+ bits entropy) | ✅ `python-jose` |
| Input validation en todos los parámetros | ✅ Pydantic schemas |
| Consultas parametrizadas | ✅ SQLAlchemy ORM |
| Fail-closed en auth | ✅ `get_current_user` retorna 401 |
| CORS restringido | ✅ Solo localhost:5173 |
| Secrets en variables de entorno | ✅ `.env` con pydantic-settings |
| No stack traces expuestas | ✅ FastAPI por defecto |
| user_id del token, no del cliente | ✅ JWT `sub` claim |
| Contraseñas hasheadas con bcrypt | ✅ `passlib[bcrypt]` |

### Bugs encontrados y corregidos durante revisión

| Bug | Archivo | Riesgo | Fix |
|---|---|---|---|
| Método `get_user_cart` no existe | `orders/services.py:35` | RuntimeError | Cambiado a `get_by_user` |
| `delete(ci.id)` vs `delete(ci)` | `orders/services.py:65` | RuntimeError | Pasado objeto CartItem |
| UserUpdate sin validación de password | `users/schemas.py` | Contraseña débil | +`field_validator` min 8 chars |

---

> **Conclusión:** El proyecto implementa las medidas de seguridad esenciales para una aplicación web moderna. Las áreas a mejorar serían: agregar MFA, tests de seguridad automatizados, y un sistema de detección de anomalías en producción.
