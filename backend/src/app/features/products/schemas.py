from pydantic import BaseModel, ConfigDict, field_validator, field_serializer
import json


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    price: float
    original_price: float | None = None
    image: str
    images: list[str] = []
    category: str
    rating: float
    stock: int = 0

    @field_serializer("images")
    def serialize_images(self, v):
        if isinstance(v, str) and v:
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return [img.strip() for img in v.split(",") if img.strip()]
        return v if isinstance(v, list) else []

    @field_validator("name", "description", "image")
    @classmethod
    def no_empty_strings(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Este campo no puede estar vacío")
        if len(v) > 500:
            raise ValueError("Este campo es demasiado largo (máx 500 caracteres)")
        return v

    @field_validator("price", "rating")
    @classmethod
    def no_negatives(cls, v: float) -> float:
        if v < 0:
            raise ValueError("El valor no puede ser negativo")
        return v


class CategoryResponse(BaseModel):
    name: str
    count: int
