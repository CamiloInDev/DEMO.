from pydantic import BaseModel, ConfigDict
from datetime import datetime


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    total: float
    status: str
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    created_at: datetime
    items: list[OrderItemResponse] = []


class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_address: str
