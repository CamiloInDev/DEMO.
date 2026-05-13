from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None = None
    product_id: int
    quantity: int
    created_at: datetime
