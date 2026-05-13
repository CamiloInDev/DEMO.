from sqlalchemy.ext.asyncio import AsyncSession
from app.features.cart.repository import CartRepository
from app.features.cart.models import CartItem
from app.features.cart.schemas import CartItemCreate


class CartService:
    def __init__(self, db: AsyncSession):
        self.repo = CartRepository(db)

    async def list_items(self, user_id: int) -> list[CartItem]:
        return await self.repo.get_by_user(user_id)

    async def add_item(self, item_in: CartItemCreate, user_id: int) -> CartItem:
        data = item_in.model_dump()
        data["user_id"] = user_id
        return await self.repo.create(data)

    async def remove_item(self, item_id: int, user_id: int) -> bool:
        item = await self.repo.get_by_user_and_id(item_id, user_id)
        if not item:
            return False
        await self.repo.delete(item)
        return True
