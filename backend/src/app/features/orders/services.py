from sqlalchemy.ext.asyncio import AsyncSession
from app.features.orders.repository import OrderRepository
from app.features.cart.repository import CartRepository
from app.features.products.repository import ProductRepository
from app.features.orders.schemas import OrderResponse, OrderItemResponse, CheckoutRequest
from fastapi import HTTPException


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OrderRepository(db)
        self.cart_repo = CartRepository(db)
        self.product_repo = ProductRepository(db)

    async def list_orders(self, user_id: int) -> list[OrderResponse]:
        orders = await self.repo.get_user_orders(user_id)
        result = []
        for order in orders:
            items = await self.repo.get_order_items(order.id)
            result.append(OrderResponse(
                id=order.id,
                user_id=order.user_id,
                total=order.total,
                status=order.status,
                shipping_name=order.shipping_name,
                shipping_phone=order.shipping_phone,
                shipping_address=order.shipping_address,
                created_at=order.created_at,
                items=[OrderItemResponse.model_validate(i) for i in items],
            ))
        return result

    async def checkout(self, user_id: int, req: CheckoutRequest) -> OrderResponse:
        cart_items = await self.cart_repo.get_by_user(user_id)
        if not cart_items:
            raise HTTPException(status_code=400, detail="El carrito está vacío")

        total = 0.0
        items_data = []
        for ci in cart_items:
            product = await self.product_repo.get(ci.product_id)
            price = product.price if product else 0
            total += price * ci.quantity
            items_data.append({
                "product_id": ci.product_id,
                "product_name": product.name if product else "Producto",
                "quantity": ci.quantity,
                "price": price,
            })

        order = await self.repo.create_order({
            "user_id": user_id,
            "total": total,
            "status": "confirmado",
            "shipping_name": req.shipping_name,
            "shipping_phone": req.shipping_phone,
            "shipping_address": req.shipping_address,
        })

        for item in items_data:
            item["order_id"] = order.id
            await self.repo.create_order_item(item)

        for ci in cart_items:
            await self.cart_repo.delete(ci)

        items_resp = [OrderItemResponse(**i) for i in items_data]
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            total=order.total,
            status=order.status,
            shipping_name=order.shipping_name,
            shipping_phone=order.shipping_phone,
            shipping_address=order.shipping_address,
            created_at=order.created_at,
            items=items_resp,
        )
