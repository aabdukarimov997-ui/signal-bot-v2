from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func

from bot.database.session import get_session
from bot.models.contact_message import ContactMessage


async def create_contact_message(
    user_id: str,
    message_text: Optional[str] = None,
    photo_file_id: Optional[str] = None,
) -> ContactMessage:
    async with get_session() as session:
        msg = ContactMessage(
            user_id=user_id,
            message_text=message_text,
            photo_file_id=photo_file_id,
        )
        session.add(msg)
        return msg


async def get_unread_messages() -> list[ContactMessage]:
    async with get_session() as session:
        result = await session.execute(
            select(ContactMessage)
            .where(ContactMessage.is_read == False)
            .order_by(ContactMessage.created_at.desc())
        )
        return list(result.scalars().all())


async def get_all_messages(limit: int = 50) -> list[ContactMessage]:
    async with get_session() as session:
        result = await session.execute(
            select(ContactMessage)
            .order_by(ContactMessage.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())


async def get_message_by_id(message_id: str) -> Optional[ContactMessage]:
    async with get_session() as session:
        result = await session.execute(
            select(ContactMessage).where(ContactMessage.id == message_id)
        )
        return result.scalar_one_or_none()


async def mark_as_read(message_id: str, admin_id: str) -> None:
    async with get_session() as session:
        result = await session.execute(
            select(ContactMessage).where(ContactMessage.id == message_id)
        )
        msg = result.scalar_one_or_none()
        if msg:
            msg.is_read = True
            msg.read_by_admin_id = admin_id
            msg.read_at = datetime.now(timezone.utc)


async def get_unread_count() -> int:
    async with get_session() as session:
        result = await session.execute(
            select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False)
        )
        return result.scalar() or 0
