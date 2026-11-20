from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class ProjectSettings(BaseMixin, Base):
    __tablename__ = "project_settings"

    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(String(256), nullable=True)
