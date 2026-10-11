import os

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Autonomous Clinical Trial Recruitment Agent System")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production-use-vault-or-env")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/trialrecruit")

settings = Settings()
