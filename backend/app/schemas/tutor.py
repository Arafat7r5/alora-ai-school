from pydantic import BaseModel, ConfigDict, Field, field_validator


class TutorReply(BaseModel):
    """The required shape of a C tutor response from the AI model."""

    answer: str = Field(description="A concise explanation, with a fenced C example when useful.")
    follow_up_question: str = Field(description="One question that helps the student continue learning C.")

    model_config = ConfigDict(extra="forbid", revalidate_instances="always")

    @field_validator("answer", "follow_up_question")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Tutor reply fields cannot be blank")
        return value

    @field_validator("answer")
    @classmethod
    def limit_answer(cls, value: str) -> str:
        if len(value) > 8000:
            raise ValueError("Tutor answer is too long")
        return value

    @field_validator("follow_up_question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        if len(value) > 500 or not value.endswith("?"):
            raise ValueError("Tutor follow-up must be a short question")
        return value
