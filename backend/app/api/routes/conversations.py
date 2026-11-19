from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Conversation, Message, User
from app.schemas.conversation import (
    ConversationDetail,
    ConversationResponse,
    MessageResponse,
    NewMessage,
    ReplyResponse,
)
from app.services.tutor import TutorUnavailableError, answer_question


router = APIRouter(prefix="/conversations", tags=["conversations"])


def owned_conversation(db: Session, conversation_id: int, user_id: int) -> Conversation:
    conversation = db.scalar(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.owner_id == user_id)
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("", response_model=list[ConversationResponse])
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Conversation]:
    return list(db.scalars(select(Conversation).where(Conversation.owner_id == user.id).order_by(Conversation.id.desc())))


@router.post("", response_model=ConversationResponse, status_code=201)
def create_conversation(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Conversation:
    conversation = Conversation(owner_id=user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Conversation:
    return owned_conversation(db, conversation_id, user.id)


@router.post("/{conversation_id}/messages", response_model=ReplyResponse, status_code=201)
def send_message(
    conversation_id: int,
    data: NewMessage,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReplyResponse:
    question = data.content.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Message cannot be blank")
    conversation = owned_conversation(db, conversation_id, user.id)
    history = list(db.scalars(select(Message).where(Message.conversation_id == conversation_id).order_by(Message.id.desc()).limit(12)))
    history.reverse()
    try:
        answer = answer_question(history, question)
    except TutorUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="The AI provider could not answer. Please try again.") from exc

    user_message = Message(conversation_id=conversation_id, role="user", content=question)
    assistant_message = Message(conversation_id=conversation_id, role="assistant", content=answer)
    db.add_all([user_message, assistant_message])
    if conversation.title == "New conversation":
        conversation.title = question[:100]
    db.commit()
    db.refresh(user_message)
    db.refresh(assistant_message)
    return ReplyResponse(
        question=MessageResponse.model_validate(user_message),
        answer=MessageResponse.model_validate(assistant_message),
    )
