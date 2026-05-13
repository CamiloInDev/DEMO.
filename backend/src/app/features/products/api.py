from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import random

from app.database import get_db
from app.features.products.schemas import ProductResponse, CategoryResponse
from app.features.products.services import ProductService

router = APIRouter(prefix="/products", tags=["products"])

RECENT_PURCHASES = [
    {"name": "María G.", "product": "Auriculares NoiseCancel Pro", "time": "hace 5 min", "city": "Madrid"},
    {"name": "Carlos L.", "product": "Monitor UltraWide 34\"", "time": "hace 12 min", "city": "Barcelona"},
    {"name": "Ana R.", "product": "Teclado Mecánico Full RGB", "time": "hace 18 min", "city": "Valencia"},
    {"name": "Pedro M.", "product": "Earbuds Inalámbricos Pro", "time": "hace 25 min", "city": "Sevilla"},
    {"name": "Laura S.", "product": "Webcam 4K Pro Stream", "time": "hace 30 min", "city": "Bilbao"},
    {"name": "Jorge A.", "product": "Control Inalámbrico Pro", "time": "hace 40 min", "city": "Alicante"},
    {"name": "Sofía D.", "product": "Cámara DSLR Starter", "time": "hace 1h", "city": "Málaga"},
    {"name": "Diego P.", "product": "Silla Gaming Ergonómica", "time": "hace 1h", "city": "Zaragoza"},
    {"name": "Elena V.", "product": "Mouse Ergonomic Pro", "time": "hace 2h", "city": "Murcia"},
    {"name": "Raúl H.", "product": "Gimbal Estabilizador 3 Ejes", "time": "hace 2h", "city": "Granada"},
    {"name": "Marta C.", "product": "Parlante Bluetooth Portátil", "time": "hace 3h", "city": "Palma"},
    {"name": "Álvaro N.", "product": "Hub USB-C 7 Puertos", "time": "hace 3h", "city": "San Sebastián"},
]


def get_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(db)


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(service: ProductService = Depends(get_service)):
    return await service.list_categories()


@router.get("/recent-purchases/list", response_model=list[dict])
async def recent_purchases():
    return random.sample(RECENT_PURCHASES, min(5, len(RECENT_PURCHASES)))


@router.get("", response_model=list[ProductResponse])
async def list_products(
    category: str | None = Query(None),
    service: ProductService = Depends(get_service),
):
    if category:
        return await service.list_products_by_category(category)
    return await service.list_products()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, service: ProductService = Depends(get_service)):
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product
