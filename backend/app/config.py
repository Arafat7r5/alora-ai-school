from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://alora:alora_local_only@localhost:5432/alora"
    jwt_secret_key: str
    jwt_expires_minutes: int = 60 * 24
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
