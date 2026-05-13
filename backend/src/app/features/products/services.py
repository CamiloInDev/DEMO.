from sqlalchemy.ext.asyncio import AsyncSession
from app.features.products.repository import ProductRepository
from app.features.products.models import Product
from app.features.products.schemas import CategoryResponse


class ProductService:
    def __init__(self, db: AsyncSession):
        self.repo = ProductRepository(db)

    async def list_products(self) -> list[Product]:
        return await self.repo.get_all()

    async def list_products_by_category(self, category: str) -> list[Product]:
        return await self.repo.get_by_category(category)

    async def get_product(self, product_id: int) -> Product | None:
        return await self.repo.get(product_id)

    async def list_categories(self) -> list[CategoryResponse]:
        cats = await self.repo.get_categories()
        return [CategoryResponse(name=name, count=count) for name, count in cats]
