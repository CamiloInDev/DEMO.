from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.features.orders.schemas import OrderResponse, CheckoutRequest
from app.features.orders.services import OrderService
from app.features.users.api import get_current_user
from app.features.users.models import User

router = APIRouter(prefix="/orders", tags=["orders"])


def get_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(db)


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    service: OrderService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.list_orders(user.id)


@router.post("/checkout", response_model=OrderResponse)
async def checkout(
    req: CheckoutRequest,
    service: OrderService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.checkout(user.id, req)
