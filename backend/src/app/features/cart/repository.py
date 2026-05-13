from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.cart.models import CartItem


class CartRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(self, user_id: int) -> list[CartItem]:
        result = await self.db.execute(select(CartItem).where(CartItem.user_id == user_id))
        return list(result.scalars().all())

    async def get_by_user_and_id(self, item_id: int, user_id: int) -> CartItem | None:
        result = await self.db.execute(
            select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> CartItem:
        item = CartItem(**data)
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def delete(self, item: CartItem) -> None:
        await self.db.delete(item)
        await self.db.flush()
