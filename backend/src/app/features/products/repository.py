from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.products.models import Product


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Product]:
        result = await self.db.execute(select(Product))
        return list(result.scalars().all())

    async def get_by_category(self, category: str) -> list[Product]:
        result = await self.db.execute(select(Product).where(Product.category == category))
        return list(result.scalars().all())

    async def get(self, product_id: int) -> Product | None:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def get_categories(self) -> list[tuple[str, int]]:
        result = await self.db.execute(
            select(Product.category, func.count(Product.id)).group_by(Product.category)
        )
        return [(row[0], row[1]) for row in result.all()]
