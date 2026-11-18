# Alora: learn AI application tools by building a C tutor

This repository is a growing classroom project. Each step adds one working feature, and [`FEATURES.md`](FEATURES.md) records what exists and what comes next. Start learning from [`docs/step-01-follow-the-code.md`](docs/step-01-follow-the-code.md).

## Run the app

1. If `.env` is absent, copy `.env.example` to `.env` at the repository root.
2. Replace `JWT_SECRET_KEY` with a random secret of at least 32 characters.
3. Add an `OPENAI_API_KEY` to enable tutor replies. Registration and sign in work without it, but sending a message will show a setup error.
4. Run `docker compose up --build`.
5. Open [http://localhost:5173](http://localhost:5173). The API docs are at [http://localhost:8000/docs](http://localhost:8000/docs).

The OpenAI API call uses the model set by `OPENAI_MODEL` (default: `gpt-4.1-mini`). Provider usage may have a cost. Keep `.env` private.

## Follow one question through the code

```text
frontend/src/components/ChatScreen.jsx  form and conversation UI
  → frontend/src/api.js             HTTP request with bearer token
  → backend/app/chat.py              ownership check and message persistence
  → backend/app/tutor.py             C teacher prompt and LangChain model call
  → backend/app/models.py            Postgres rows
```

For authentication, follow `AuthScreen.jsx` → `api.js` → `backend/app/auth.py` → `backend/app/security.py`.

## Project map

```text
backend/app/
  main.py       FastAPI app and route registration
  config.py     environment settings
  database.py   database connection and request session
  models.py     User, Conversation, Message tables
  auth.py       register, sign in, current user routes
  security.py   password hashing and JWT validation
  chat.py       conversation and message routes
  tutor.py      the one LangChain call and C teaching prompt
frontend/src/
  App.jsx                    session entry point
  api.js                     all HTTP calls
  components/AuthScreen.jsx  registration and sign in
  components/ChatScreen.jsx  conversation UI
  styles.css                 Tailwind and small custom styles
```

## Current boundaries

This first step uses one model call. It has no agent, graph, tool calling, retrieval, or file upload yet. Database tables are created automatically on API startup to keep this lesson small; a later step should introduce migrations before changing the schema. JWTs live in browser session storage and expire after 24 hours. This is a learning starter, not a production authentication design.

The tutor receives the latest 12 messages in a conversation. A failed AI call stores neither the question nor an answer, so you can retry it.
