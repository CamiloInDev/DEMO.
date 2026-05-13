from pydantic import BaseModel, ConfigDict, field_validator


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    phone: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    password: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str | None) -> str | None:
        if v is not None and v != "" and len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v if v else None
