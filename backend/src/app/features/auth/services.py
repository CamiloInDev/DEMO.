from sqlalchemy.ext.asyncio import AsyncSession
from app.features.users.repository import UserRepository
from app.features.users.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.features.auth.schemas import RegisterRequest, TokenResponse
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def register(self, req: RegisterRequest) -> TokenResponse:
        existing = await self.repo.get_by_email(req.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email ya registrado")

        user = await self.repo.create({
            "email": req.email,
            "hashed_password": hash_password(req.password),
            "full_name": req.full_name,
        })

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            address=user.address,
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            address=user.address,
        )
