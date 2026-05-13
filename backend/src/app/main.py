import logging
import structlog
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import FileResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select

from app.config import settings
from app.database import async_engine, sync_engine, async_session_maker
from app.models import Base
from app.features.products import router as products_router
from app.features.products.models import Product
from app.features.cart import router as cart_router
from app.features.cart.models import CartItem
from app.features.auth import router as auth_router
from app.features.users import router as users_router
from app.features.orders import router as orders_router
from app.features.users.models import User



@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        result = await session.execute(select(Product).limit(1))
        if not result.scalar_one_or_none():
            products = [
                # Audio (4)
                Product(name="Auriculares NoiseCancel Pro", description="Cancelación activa de ruido - 40h batería - Sonido 360°", price=249.99, original_price=349.99, image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", images='["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80","https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80","https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&q=80"]', category="Audio", rating=4.9, stock=12),
                Product(name="Parlante Bluetooth Portátil", description="30W - Resistente al agua - 12h batería - Conecta 2 a la vez", price=79.99, original_price=99.99, image="https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80", images='["https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80","https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80","https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80"]', category="Audio", rating=4.6, stock=25),
                Product(name="Micrófono Condenser USB", description="Plug & play - Patrón cardioide - Ideal streaming/podcast", price=129.99, image="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80", images='["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80","https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&q=80"]', category="Audio", rating=4.7, stock=8),
                Product(name="Earbuds Inalámbricos Pro", description="Cancelación ruido - 30h totales - IPX5 - Estuche carga inalámbrica", price=199.99, original_price=249.99, image="https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&q=80", images='["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&q=80","https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80"]', category="Audio", rating=4.8, stock=3),
                # Gaming (4)
                Product(name="Teclado Mecánico Full RGB", description="Switches Cherry MX - Retroiluminación RGB - Aluminio anodizado", price=179.99, image="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", images='["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80","https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80","https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80"]', category="Gaming", rating=4.8, stock=18),
                Product(name="Control Inalámbrico Pro", description="Compatibilidad PC/PS/Xbox - Batería 40h - Gatillos hápticos", price=69.99, original_price=89.99, image="https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=600&q=80", images='["https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=600&q=80","https://images.unsplash.com/photo-1600080972464-8e5f35f7d1cd?w=600&q=80"]', category="Gaming", rating=4.5, stock=2),
                Product(name="Silla Gaming Ergonómica", description="Soporte lumbar ajustable - Reposabrazos 4D - Base reforzada", price=399.99, original_price=499.99, image="https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=80", images='["https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=80","https://images.unsplash.com/photo-1586153294464-fda11f6c3dc5?w=600&q=80"]', category="Gaming", rating=4.7, stock=6),
                Product(name="Mousepad XXL RGB", description="900x400mm - Superficie speed - Iluminación direccionable - Antideslizante", price=39.99, image="https://images.unsplash.com/photo-1606610183011-b0d2c6e38c08?w=600&q=80", images='["https://images.unsplash.com/photo-1606610183011-b0d2c6e38c08?w=600&q=80","https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?w=600&q=80"]', category="Gaming", rating=4.4, stock=30),
                # Monitores (4)
                Product(name='Monitor UltraWide 34"', description="UWQHD 144Hz - Curvo 1500R - HDR400 - USB-C 65W", price=599.99, original_price=799.99, image="https://images.unsplash.com/photo-1527443224154-c4a3942d3ac0?w=600&q=80", images='["https://images.unsplash.com/photo-1527443224154-c4a3942d3ac0?w=600&q=80","https://images.unsplash.com/photo-1527443224154-c4a3942d3ac0?w=800&q=80","https://images.unsplash.com/photo-1527443224154-c4a3942d3ac0?w=400&q=80"]', category="Monitores", rating=4.9, stock=4),
                Product(name='Monitor 27" 4K IPS', description="4K UHD - 60Hz - HDR10 - Altavoces integrados - Ideal diseño", price=349.99, image="https://images.unsplash.com/photo-1585792180666-f7347c4908b1?w=600&q=80", images='["https://images.unsplash.com/photo-1585792180666-f7347c4908b1?w=600&q=80","https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&q=80"]', category="Monitores", rating=4.6, stock=10),
                Product(name='Monitor Portátil 15.6"', description="1080p IPS - USB-C - Peso 800g - Ideal laptop dual screen", price=199.99, original_price=249.99, image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", images='["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80","https://images.unsplash.com/photo-1531498860502-7c67cf2f6572?w=600&q=80"]', category="Monitores", rating=4.5, stock=15),
                Product(name="Soporte Monitor Dual", description="Brazo articulado 2 monitores - 4-13kg c/u - Gestión cables", price=89.99, image="https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=600&q=80", images='["https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=600&q=80","https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=800&q=80"]', category="Monitores", rating=4.3, stock=20),
                # Accesorios (4)
                Product(name="Mouse Ergonomic Pro", description="Sensor 16000 DPI - Batería 80h - Ultraligero 63g", price=89.99, original_price=129.99, image="https://images.unsplash.com/photo-1527864550417-7fd91db51d40?w=600&q=80", images='["https://images.unsplash.com/photo-1527864550417-7fd91db51d40?w=600&q=80","https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80","https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?w=600&q=80"]', category="Accesorios", rating=4.7, stock=7),
                Product(name="Hub USB-C 7 Puertos", description="HDMI 4K - SD/microSD - PD 100W - 10Gbps", price=59.99, image="https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80", images='["https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80","https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600&q=80"]', category="Accesorios", rating=4.5, stock=22),
                Product(name="Base Laptop Adjustable", description="Aluminio - 6 niveles altura - Ventilación integrada - Plegable", price=49.99, image="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80", images='["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"]', category="Accesorios", rating=4.4, stock=14),
                Product(name="Cable USB-C Trenzado 2m", description="Carga rápida 100W - Datos 10Gbps - Nylon trenzado - 5 unidades", price=19.99, image="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80", images='["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80","https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80"]', category="Accesorios", rating=4.2, stock=50),
                # Cámaras (4)
                Product(name="Webcam 4K Pro Stream", description="4K 30fps - Auto-focus - Micrófono dual - Plug & play", price=149.99, image="https://images.unsplash.com/photo-1587826080692-f439cd0b7a21?w=600&q=80", images='["https://images.unsplash.com/photo-1587826080692-f439cd0b7a21?w=600&q=80","https://images.unsplash.com/photo-1587826080692-f439cd0b7a21?w=800&q=80"]', category="Cámaras", rating=4.6, stock=9),
                Product(name="Cámara DSLR Starter", description="24.2MP - Lente 18-55mm - WiFi - 4K video - Ideal principiantes", price=499.99, image="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80", images='["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80","https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80","https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&q=80"]', category="Cámaras", rating=4.8, stock=5),
                Product(name="Gimbal Estabilizador 3 Ejes", description="Para smartphone/cámara acción - Bluetooth - 8h batería", price=89.99, original_price=119.99, image="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80", images='["https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80","https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80"]', category="Cámaras", rating=4.5, stock=1),
                Product(name="Micrófono Lavalier Inalámbrico", description="Plug & play - 50m alcance - 8h batería - Ideal entrevistas", price=39.99, image="https://images.unsplash.com/photo-1599658880436-0d0d9f2e0e4b?w=600&q=80", images='["https://images.unsplash.com/photo-1599658880436-0d0d9f2e0e4b?w=600&q=80","https://images.unsplash.com/photo-1599658880436-0d0d9f2e0e4b?w=800&q=80"]', category="Cámaras", rating=4.3, stock=35),
            ]
            session.add_all(products)
            await session.commit()

    yield
    await async_engine.dispose()


# Structured logging
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
logging.basicConfig(level=logging.INFO)

# Rate limiting
from app.core.rate_limit import limiter
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

logger.info("App started", app_name=settings.app_name)

# Admin panel (SQLAdmin)
from app.admin import setup_admin
try:
    setup_admin(app)
except Exception as e:
    print(f"Admin panel error: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)

app.include_router(products_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(orders_router, prefix="/api")


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
