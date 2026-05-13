from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.rate_limit import limiter
from app.features.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.features.auth.services import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, req: RegisterRequest, service: AuthService = Depends(get_service)):
    return await service.register(req)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, req: LoginRequest, service: AuthService = Depends(get_service)):
    return await service.login(req.email, req.password)
