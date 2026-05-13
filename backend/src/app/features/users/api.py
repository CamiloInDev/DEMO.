from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.features.users.repository import UserRepository
from app.features.users.schemas import UserResponse, UserUpdate
from app.core.security import decode_access_token, hash_password
from fastapi import HTTPException, status
from fastapi import Header

router = APIRouter(prefix="/users", tags=["users"])


async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    repo = UserRepository(db)
    user = await repo.get_by_id(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
    user = await repo.update(user, update_data)
    return user
