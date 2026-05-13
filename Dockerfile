# Stage 1: Build frontend
FROM node:20-alpine AS frontend

WORKDIR /build
COPY mi-tienda-frontend/ .
RUN npm install && npm run build

# Stage 2: Python backend + serve frontend
FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    fastapi>=0.115.0 \
    uvicorn[standard]>=0.32.0 \
    sqlalchemy[asyncio]>=2.0.0 \
    aiosqlite>=0.20.0 \
    asyncpg>=0.30.0 \
    pydantic>=2.10.0 \
    pydantic-settings>=2.6.0 \
    python-dotenv>=1.0.0 \
    passlib[bcrypt] \
    python-jose[cryptography] \
    bcrypt==4.0.1 \
    structlog \
    slowapi \
    sqladmin \
    python-multipart \
    itsdangerous

COPY backend/ .

COPY --from=frontend /build/dist /app/static

ENV PYTHONPATH=/app/src

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
