import os
from types import SimpleNamespace

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite://")

from app.services import tutor
from app.schemas.tutor import TutorReply


def stub_model(monkeypatch, result):
    calls = {}

    class StructuredModel:
        def invoke(self, messages, config):
            calls["messages"] = messages
            calls["config"] = config
            return result

    class ChatModel:
        def __init__(self, **kwargs):
            calls["model_options"] = kwargs

        def with_structured_output(self, schema, method):
            calls["schema"] = schema
            calls["method"] = method
            return StructuredModel()

    monkeypatch.setattr(tutor, "get_settings", lambda: SimpleNamespace(openai_api_key="test-key", openai_model="gpt-4.1-mini"))
    monkeypatch.setattr(tutor, "ChatOpenAI", ChatModel)
    return calls


def test_tutor_validates_and_formats_structured_reply(monkeypatch):
    calls = stub_model(
        monkeypatch,
        {"answer": "  A pointer stores an address.  ", "follow_up_question": "  What does *p read?  "},
    )

    assert tutor.answer_question([], "What is a pointer?") == "A pointer stores an address.\n\nWhat does *p read?"
    assert calls["schema"] is TutorReply
    assert calls["method"] == "json_schema"
    assert calls["config"] == {"run_name": "c_tutor_reply", "tags": ["c-tutor"]}
    assert calls["messages"][-1].content == "What is a pointer?"


@pytest.mark.parametrize(
    "reply",
    [
        {"answer": "   ", "follow_up_question": "What is a pointer?"},
        {"answer": "A pointer stores an address.", "follow_up_question": "   "},
        {"answer": "A pointer stores an address.", "follow_up_question": "Try a pointer"},
        {"answer": "A pointer stores an address."},
        {"answer": "A pointer stores an address.", "follow_up_question": "What is *p?", "extra": "unexpected"},
    ],
)
def test_tutor_rejects_invalid_model_replies(monkeypatch, reply):
    stub_model(monkeypatch, reply)

    with pytest.raises(tutor.InvalidTutorResponseError):
        tutor.answer_question([], "What is a pointer?")
