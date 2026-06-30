from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class ProjectSettings(BaseMixin, Base):
    __tablename__ = "project_settings"

    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
