"""
📝 BLOG POST — Web sayt blogiga post yozish.

Admin Telegram orqali post yozadi:
  • Sarlavha
  • Qisqacha tavsif (ixtiyoriy)
  • To'liq matn
  • Tasdiqlash → website."BlogPost" jadvaliga yoziladi

Post to'g'ridan-to'g'ri sayt bazasiga yoziladi (bot va sayt bitta
PostgreSQL'ni ishlatadi), shuning uchun post sayt blogida darhol chiqadi.
"""

import html
import re
import uuid
from datetime import datetime, timezone

from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import text

from bot.database.session import get_session
from bot.services.settings_service import get_admin_ids
from bot.utils.helpers import safe_edit
from bot.utils.states import AdminBlogPostStates

admin_blog_router = Router()

BLOG_TABLE = '"website"."BlogPost"'
USER_TABLE = '"website"."User"'

# Sayt blog manzili — bot sozlamalaridagi website_url dan olinadi
def _site_url() -> str:
    from bot.config import settings
    return settings.SOCIAL_WEBSITE or "https://website-production-8ecf.up.railway.app"


# ─────────────────────────────────────────────────────────
# 🎛 KEYBOARDS
# ─────────────────────────────────────────────────────────

def blog_skip_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➡️ O'tkazib yuborish", callback_data="blog_skip_excerpt")],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="blog_cancel")],
    ])


def blog_confirm_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Blogga joylash", callback_data="blog_publish")],
        [InlineKeyboardButton(text="🔄 Qayta yozish", callback_data="blog_redo")],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="blog_cancel")],
    ])


def blog_cancel_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Admin panel", callback_data="admin_back")],
    ])


def blog_flow_cancel_kb() -> InlineKeyboardMarkup:
    """Flow davomida ko'rsatiladigan tugma — state'ni tozalaydi (admin_back emas)."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="blog_cancel")],
    ])


# ─────────────────────────────────────────────────────────
# 🛠 YORDAMCHI FUNKSIYALAR
# ─────────────────────────────────────────────────────────

def generate_slug(title: str) -> str:
    """Sayt admin panelidagi slug generatoriga mos (generateSlug)."""
    slug = title.lower()
    # [^a-z0-9\u0621-\u064A] → '-'
    slug = re.sub(r"[^a-z0-9\u0621-\u064a]+", "-", slug)
    slug = slug.strip("-")
    return slug or f"post-{int(datetime.now(timezone.utc).timestamp())}"


async def make_unique_slug(title: str) -> str:
    """Slug unikal bo'lishini ta'minlaydi: post, post-2, post-3..."""
    base = generate_slug(title)
    slug = base
    i = 2
    async with get_session() as session:
        while True:
            result = await session.execute(
                text(f'SELECT 1 FROM {BLOG_TABLE} WHERE "slug" = :slug'),
                {"slug": slug},
            )
            if not result.first():
                return slug
            slug = f"{base}-{i}"
            i += 1


async def resolve_author_id() -> str:
    """
    website."User" dan muallif id topadi:
      1) role='ADMIN' foydalanuvchi
      2) har qanday foydalanuvchi
      3) hech kim yo'q bo'lsa — 'admin' (admin panel ishlatadigan id) bilan
         foydalanuvchi yaratadi
    """
    async with get_session() as session:
        # 1) ADMIN role
        result = await session.execute(
            text(f'SELECT "id" FROM {USER_TABLE} WHERE "role" = :role LIMIT 1'),
            {"role": "ADMIN"},
        )
        row = result.first()
        if row:
            return row[0]

        # 2) istalgan foydalanuvchi
        result = await session.execute(text(f'SELECT "id" FROM {USER_TABLE} LIMIT 1'))
        row = result.first()
        if row:
            return row[0]

        # 3) fallback — 'admin' id bilan user yaratish (admin panel ham shu id ishlatadi)
        now = datetime.now(timezone.utc)
        admin_id = "admin"
        try:
            await session.execute(
                text(
                    f'INSERT INTO {USER_TABLE} '
                    '("id", "email", "name", "role", "createdAt", "updatedAt") '
                    'VALUES (:id, :email, :name, :role, :now, :now) '
                    'ON CONFLICT DO NOTHING'
                ),
                {
                    "id": admin_id,
                    "email": "admin@aaa-trading.academy",
                    "name": "ABDULLOH",
                    "role": "ADMIN",
                    "now": now,
                },
            )
        except Exception:
            pass

        # Yaratilgan user mavjudligini tekshiramiz — aks holda boshqa user qidiramiz
        result = await session.execute(
            text(f'SELECT "id" FROM {USER_TABLE} WHERE "id" = :id LIMIT 1'),
            {"id": admin_id},
        )
        if result.first():
            return admin_id
        result = await session.execute(text(f'SELECT "id" FROM {USER_TABLE} LIMIT 1'))
        row = result.first()
        return row[0] if row else admin_id


# ─────────────────────────────────────────────────────────
# 🚀 ENTRY: Admin panel → "📝 Blog post"
# ─────────────────────────────────────────────────────────

@admin_blog_router.callback_query(F.data == "admin_blog_post")
async def blog_start_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminBlogPostStates.waiting_title)
    await safe_edit(
        callback.message,
        "📝 <b>Yangi blog post yozish</b>\n\n"
        "1/3 — <b>Sarlavha</b> kiriting:\n\n"
        "💡 Post sayt blogida nashr etilgan holda chiqadi.\n"
        "❌ Bekor qilish: /cancel",
        reply_markup=blog_flow_cancel_kb(),
    )
    await callback.answer()


@admin_blog_router.message(AdminBlogPostStates.waiting_title)
async def blog_title_handler(message: Message, state: FSMContext) -> None:
    if not message.text or not message.text.strip():
        await message.answer("❌ Iltimos, sarlavha yuboring.")
        return

    title = message.text.strip()
    await state.update_data(title=title)
    await state.set_state(AdminBlogPostStates.waiting_excerpt)

    await message.answer(
        f"📌 <b>Sarlavha:</b> {html.escape(title)}\n\n"
        "2/3 — <b>Qisqacha tavsif</b> kiriting (ixtiyoriy):\n\n"
        "💡 O'tkazib yuborish mumkin.",
        reply_markup=blog_skip_kb(),
    )


@admin_blog_router.callback_query(F.data == "blog_skip_excerpt", AdminBlogPostStates.waiting_excerpt)
async def blog_skip_excerpt_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.update_data(excerpt="")
    await state.set_state(AdminBlogPostStates.waiting_content)
    await safe_edit(
        callback.message,
        "3/3 — <b>To'liq matn</b>ni yuboring:\n\n"
        "💡 Post matni (bir nechta xabar birlashtirilmaydi, bitta xabar sifatida).\n"
        "❌ Bekor qilish: /cancel",
        reply_markup=blog_flow_cancel_kb(),
    )
    await callback.answer()


@admin_blog_router.message(AdminBlogPostStates.waiting_excerpt)
async def blog_excerpt_handler(message: Message, state: FSMContext) -> None:
    excerpt = (message.text or message.caption or "").strip()
    await state.update_data(excerpt=excerpt)
    await state.set_state(AdminBlogPostStates.waiting_content)
    await message.answer(
        "3/3 — <b>To'liq matn</b>ni yuboring:\n\n"
        "💡 Post matni (bitta xabar sifatida).\n"
        "❌ Bekor qilish: /cancel",
        reply_markup=blog_flow_cancel_kb(),
    )


@admin_blog_router.message(AdminBlogPostStates.waiting_content)
async def blog_content_handler(message: Message, state: FSMContext) -> None:
    if not message.text or not message.text.strip():
        await message.answer("❌ Iltimos, post matnini yuboring.")
        return

    content = message.text.strip()
    if len(content) > 4000:
        await message.answer("❌ Matn juda uzun (4000 belgidan oshmasligi kerak).")
        return

    data = await state.get_data()
    await state.update_data(content=content)
    await state.set_state(AdminBlogPostStates.confirm)

    title_escaped = html.escape(data.get('title', ''))
    excerpt_short = (data.get('excerpt') or '').strip()[:100]
    excerpt_display = html.escape(excerpt_short) if excerpt_short else "<i>(yo'q)</i>"
    content_preview = html.escape(content[:400])

    preview = (
        "👁 <b>Post ko'rinishi</b>\n\n"
        f"📌 <b>Sarlavha:</b> {title_escaped}\n"
        f"📝 <b>Qisqacha:</b> {excerpt_display}\n"
        f"📄 <b>Matn:</b>\n"
        f"─────\n{content_preview}{'...' if len(content) > 400 else ''}\n"
        f"─────\n\n"
        f"✅ Hamma narsa to'g'ri bo'lsa, «Blogga joylash» tugmasini bosing."
    )
    await message.answer(preview, reply_markup=blog_confirm_kb())


# ─────────────────────────────────────────────────────────
# ✅ CONFIRM → Blogga yozish
# ─────────────────────────────────────────────────────────

@admin_blog_router.callback_query(F.data == "blog_publish", AdminBlogPostStates.confirm)
async def blog_publish_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    data = await state.get_data()
    title = (data.get("title") or "").strip()
    excerpt = (data.get("excerpt") or "").strip()
    content = (data.get("content") or "").strip()

    if not title or not content:
        await callback.answer("❌ Sarlavha yoki matn topilmadi. Qaytadan boshlang.", show_alert=True)
        await state.clear()
        return

    await state.clear()

    try:
        slug = await make_unique_slug(title)
        author_id = await resolve_author_id()
        now = datetime.now(timezone.utc)
        post_id = str(uuid.uuid4())

        async with get_session() as session:
            await session.execute(
                text(
                    f'INSERT INTO {BLOG_TABLE} '
                    '("id", "title", "slug", "content", "excerpt", "coverImage", '
                    '"published", "authorId", "createdAt", "updatedAt") '
                    'VALUES (:id, :title, :slug, :content, :excerpt, :cover, '
                    'TRUE, :author, :now, :now)'
                ),
                {
                    "id": post_id,
                    "title": title,
                    "slug": slug,
                    "content": content,
                    "excerpt": excerpt,
                    "cover": "",
                    "author": author_id,
                    "now": now,
                },
            )

        site = _site_url()
        await safe_edit(
            callback.message,
            f"✅ <b>Post blogga joylandi!</b>\n\n"
            f"📌 <b>Sarlavha:</b> {html.escape(title)}\n"
            f"🔗 <b>Slug:</b> <code>{slug}</code>\n"
            f"🌐 <b>Manzil:</b> {site}\n\n"
            f"📝 Yana post yozish uchun admin panelda «📝 Blog post» tugmasini bosing.",
            reply_markup=blog_cancel_kb(),
        )

    except Exception as e:
        await safe_edit(
            callback.message,
            "❌ <b>Xatolik yuz berdi!</b>\n\n"
            f"<code>{html.escape(str(e)[:300])}</code>\n\n"
            "💡 Tekshiring:\n"
            "• Bot va sayt bir xil bazaga ulanganmi?\n"
            "• Bazada website sxemasi mavjudmi?",
            reply_markup=blog_cancel_kb(),
        )

    await callback.answer()


# ─────────────────────────────────────────────────────────
# 🔄 REDO / ❌ CANCEL
# ─────────────────────────────────────────────────────────

@admin_blog_router.callback_query(F.data == "blog_redo", AdminBlogPostStates.confirm)
async def blog_redo_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.set_state(AdminBlogPostStates.waiting_title)
    await safe_edit(
        callback.message,
        "🔄 <b>Qayta yozish</b>\n\n"
        "1/3 — <b>Sarlavha</b> kiriting:\n\n"
        "❌ Bekor qilish: /cancel",
        reply_markup=blog_flow_cancel_kb(),
    )
    await callback.answer()


@admin_blog_router.callback_query(F.data == "blog_cancel")
async def blog_cancel_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await safe_edit(
        callback.message,
        "❌ Post yozish bekor qilindi.",
        reply_markup=blog_cancel_kb(),
    )
    await callback.answer()


@admin_blog_router.message(F.text == "/cancel", AdminBlogPostStates.waiting_title)
@admin_blog_router.message(F.text == "/cancel", AdminBlogPostStates.waiting_excerpt)
@admin_blog_router.message(F.text == "/cancel", AdminBlogPostStates.waiting_content)
@admin_blog_router.message(F.text == "/cancel", AdminBlogPostStates.confirm)
async def blog_cancel_text_handler(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("❌ Post yozish bekor qilindi.", reply_markup=blog_cancel_kb())
