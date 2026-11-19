from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.exceptions import OutputParserException
from langchain_openai import ChatOpenAI
from pydantic import ValidationError

from app.core.config import get_settings
from app.models import Message
from app.schemas.tutor import TutorReply


SYSTEM_PROMPT = """You are a patient teacher of the C programming language.
Teach through short explanations and small C examples.
Adapt to the student's question and prior messages. Correct misconceptions kindly.
When code is relevant, use fenced C code blocks. Explain unsafe C behavior and memory mistakes clearly.
Stay focused on learning C; briefly redirect unrelated requests back to C.
Put the explanation in answer and one useful C learning question in follow_up_question."""


class TutorUnavailableError(Exception):
    pass


class InvalidTutorResponseError(Exception):
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
    structured_model = model.with_structured_output(TutorReply, method="json_schema")
    try:
        response = structured_model.invoke(messages, config={"run_name": "c_tutor_reply", "tags": ["c-tutor"]})
        reply = TutorReply.model_validate(response)
    except (OutputParserException, ValidationError, TypeError) as exc:
        raise InvalidTutorResponseError("The tutor returned an invalid answer. Please try again.") from exc
    return f"{reply.answer}\n\n{reply.follow_up_question}"
