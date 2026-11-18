# Step 1: follow one C question through the app

Run the app using the root [`README.md`](../README.md), register a user, and ask: **What does `int age = 10;` mean?**

Then follow the exact path your question took:

1. In `frontend/src/components/ChatScreen.jsx`, find `send`. It creates a conversation if needed, shows your question immediately, and waits for a reply.
2. In `frontend/src/api.js`, find `sendMessage`. The browser sends JSON and includes the JWT in the `Authorization` header.
3. In `backend/app/security.py`, find `get_current_user`. It validates the token and loads the user.
4. In `backend/app/chat.py`, find `send_message`. It checks that the conversation belongs to that user, loads recent messages, and saves the question and answer.
5. In `backend/app/tutor.py`, find `answer_question`. This is the first LangChain feature: a system instruction and conversation messages passed to `ChatOpenAI.invoke`.
6. In `backend/app/models.py`, find `Message`. That is the row you see again when you reload the conversation.

Try one change: edit the teaching style in `SYSTEM_PROMPT` in `backend/app/tutor.py`, rebuild the API with `docker compose up --build -d api`, and ask the same question in a new conversation. That gives you a direct prompt experiment before adding more tools.

If `OPENAI_API_KEY` is blank, the app will explain how to enable tutor replies; registration and saved conversation creation still work.
