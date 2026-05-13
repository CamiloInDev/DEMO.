from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.orders.models import Order, OrderItem


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_orders(self, user_id: int) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_order_items(self, order_id: int) -> list[OrderItem]:
        result = await self.db.execute(
            select(OrderItem).where(OrderItem.order_id == order_id)
        )
        return list(result.scalars().all())

    async def create_order(self, data: dict) -> Order:
        order = Order(**data)
        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)
        return order

    async def create_order_item(self, data: dict) -> OrderItem:
        item = OrderItem(**data)
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item
