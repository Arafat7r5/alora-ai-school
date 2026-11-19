# Feature track

Update this file whenever a feature is added. Keep the list tied to working code so it is easy to know what to study next.

## Step 1 — working foundation (present)

| Feature | Where to follow it |
| --- | --- |
| React and Tailwind classroom UI | `frontend/src/components/`, `frontend/src/styles.css` |
| Register and sign in with email and password | `frontend/src/components/AuthScreen.jsx` → `backend/app/api/routes/auth.py` |
| Argon2 password hashes and expiring JWT bearer tokens | `backend/app/core/security.py` |
| Protected, user-owned conversation history | `backend/app/api/routes/conversations.py` → `backend/app/models/` |
| C teacher replies through one LangChain `ChatOpenAI` call | `backend/app/services/tutor.py` |
| Structured AI replies validated before storage | `backend/app/schemas/tutor.py` → `backend/app/services/tutor.py` |
| Optional LangSmith tracing for prompts, latency, and token usage | `.env.example` → `compose.yaml` → `backend/app/services/tutor.py` |
| Postgres storage and local Docker startup | `backend/app/db/session.py`, `compose.yaml` |

## Suggested next steps (not built yet)

1. **Prompt and model experiments:** compare teaching styles with small evaluations.
2. **RAG:** upload or seed trusted C learning material, retrieve relevant passages, and show citations.
3. **LangGraph:** add explicit teaching steps such as explain → quiz → assess, with persisted state.
4. **Tools and Deep Agents:** add bounded tools (for example a C code runner in a sandbox) and only then explore more autonomous workflows.

The order is intentional: each step should remain usable and readable before the next tool is introduced.
