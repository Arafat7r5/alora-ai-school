from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import get_settings
from app.models import Message


SYSTEM_PROMPT = """You are a patient teacher of the C programming language.
Teach through short explanations, small C examples, and one useful follow-up question.
Adapt to the student's question and prior messages. Correct misconceptions kindly.
When code is relevant, use fenced C code blocks. Explain unsafe C behavior and memory mistakes clearly.
Stay focused on learning C; briefly redirect unrelated requests back to C."""


class TutorUnavailableError(Exception):
    pass


def answer_question(history: list[Message], question: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        raise TutorUnavailableError("Set OPENAI_API_KEY in .env to enable the C tutor.")

    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for item in history[-12:]:
        message_type = HumanMessage if item.role == "user" else AIMessage
        messages.append(message_type(content=item.content))
    messages.append(HumanMessage(content=question))

    model = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.3)
    response = model.invoke(messages)
    if not isinstance(response.content, str) or not response.content.strip():
        raise TutorUnavailableError("The tutor returned an empty answer. Please try again.")
    return response.content.strip()
