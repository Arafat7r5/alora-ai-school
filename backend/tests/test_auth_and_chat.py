import os
from contextlib import asynccontextmanager

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-with-at-least-thirty-two-characters")
os.environ.setdefault("DATABASE_URL", "sqlite://")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401
from app.api.routes import conversations
from app.db.base import Base
from app.db.session import get_db
from app.main import app


def test_register_login_and_conversation_ownership(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, class_=Session)

    def test_db():
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    monkeypatch.setattr(conversations, "answer_question", lambda history, question: "A C variable stores a value.")

    @asynccontextmanager
    async def no_lifespan(_app):
        yield

    monkeypatch.setattr(app.router, "lifespan_context", no_lifespan)

    try:
        with TestClient(app) as client:
            alice = client.post("/api/auth/register", json={"email": "alice@example.com", "password": "correct-horse-1"})
            assert alice.status_code == 201
            assert client.post("/api/auth/register", json={"email": "alice@example.com", "password": "correct-horse-1"}).status_code == 409
            assert client.post("/api/auth/login", json={"email": "alice@example.com", "password": "wrong-password"}).status_code == 401
            login = client.post("/api/auth/login", json={"email": "alice@example.com", "password": "correct-horse-1"})
            assert login.status_code == 200
            alice_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

            assert client.get("/api/conversations").status_code == 401
            created = client.post("/api/conversations", headers=alice_headers)
            assert created.status_code == 201
            conversation_id = created.json()["id"]
            reply = client.post(
                f"/api/conversations/{conversation_id}/messages",
                headers=alice_headers,
                json={"content": "What is a variable?"},
            )
            assert reply.status_code == 201
            assert reply.json()["answer"]["content"] == "A C variable stores a value."
            assert len(client.get(f"/api/conversations/{conversation_id}", headers=alice_headers).json()["messages"]) == 2

            bob = client.post("/api/auth/register", json={"email": "bob@example.com", "password": "correct-horse-2"})
            bob_headers = {"Authorization": f"Bearer {bob.json()['access_token']}"}
            assert client.get(f"/api/conversations/{conversation_id}", headers=bob_headers).status_code == 404
            assert client.post(f"/api/conversations/{conversation_id}/messages", headers=bob_headers, json={"content": "Hi"}).status_code == 404
            assert client.get("/api/conversations", headers=bob_headers).json() == []
    finally:
        app.dependency_overrides.clear()
        engine.dispose()
