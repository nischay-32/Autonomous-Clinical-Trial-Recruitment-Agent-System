from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Clinical Trial Recruitment Agent System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-in-production-use-vault-or-env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/trialrecruit"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
