from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.rate_limit import limiter
from app.features.cart.schemas import CartItemCreate, CartItemResponse
from app.features.cart.services import CartService
from app.features.users.api import get_current_user
from app.features.users.models import User

router = APIRouter(prefix="/cart", tags=["cart"])


def get_service(db: AsyncSession = Depends(get_db)) -> CartService:
    return CartService(db)


@router.get("", response_model=list[CartItemResponse])
async def list_cart(
    service: CartService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.list_items(user.id)


@router.post("", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def add_to_cart(
    request: Request,
    item_in: CartItemCreate,
    service: CartService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.add_item(item_in, user.id)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def remove_from_cart(
    request: Request,
    item_id: int,
    service: CartService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    deleted = await service.remove_item(item_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
