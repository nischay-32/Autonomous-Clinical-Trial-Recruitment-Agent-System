from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from .core.config import settings
from .api.router import api_router, resolve_token
try:
    from .db.database import init_db
except ImportError:
    async def init_db():
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

_PUBLIC = {
    "/",
    f"{settings.API_V1_STR}/health",
    f"{settings.API_V1_STR}/auth/login",
    f"{settings.API_V1_STR}/auth/register",
    f"{settings.API_V1_STR}/docs",
    f"{settings.API_V1_STR}/openapi.json",
}


@app.middleware("http")
async def require_session(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    path = request.url.path
    if path in _PUBLIC or path.startswith(f"{settings.API_V1_STR}/docs"):
        return await call_next(request)
    if path.startswith(f"{settings.API_V1_STR}/"):
        if not resolve_token(request.headers.get("authorization")):
            resp = JSONResponse({"detail": "Sign in required."}, status_code=401)
            resp.headers["Access-Control-Allow-Origin"] = "*"
            resp.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            return resp
    return await call_next(request)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
