from typing import Any, Awaitable, Callable, Union

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject, User as TgUser

from bot.services.user_service import get_or_create_user


class AuthMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        tg_user: Union[TgUser, None] = data.get("event_from_user")
        if tg_user is None:
            return await handler(event, data)

        user = await get_or_create_user(
            telegram_id=tg_user.id,
            full_name=tg_user.full_name,
            username=tg_user.username,
        )

        if user.is_banned:
            from aiogram.types import Message as Msg
            from bot.utils.texts import BANNED_USER
            if isinstance(event, Message):
                await event.answer(BANNED_USER)
            return

        data["user"] = user
        return await handler(event, data)