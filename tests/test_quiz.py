import pytest

from bot.services import quiz_service


@pytest.mark.asyncio
async def test_quiz_disabled_by_default():
    assert await quiz_service.is_quiz_enabled() is False


@pytest.mark.asyncio
async def test_quiz_toggle():
    from bot.services.settings_service import set_setting

    await set_setting("quiz_enabled", "true")
    assert await quiz_service.is_quiz_enabled() is True
    await set_setting("quiz_enabled", "false")
    assert await quiz_service.is_quiz_enabled() is False


@pytest.mark.asyncio
async def test_default_questions_valid():
    questions = await quiz_service.get_questions()
    assert len(questions) >= 5
    for q in questions:
        assert q["q"]
        assert len(q["options"]) >= 2
        assert 0 <= q["correct"] < len(q["options"])


@pytest.mark.asyncio
async def test_custom_questions_from_setting():
    import json

    from bot.services.settings_service import set_setting

    custom = [
        {"q": "1+1?", "options": ["1", "2", "3"], "correct": 1},
        {"q": "2+2?", "options": ["3", "4"], "correct": 1},
    ]
    await set_setting("quiz_questions", json.dumps(custom))
    questions = await quiz_service.get_questions()
    assert len(questions) == 2
    assert questions[0]["q"] == "1+1?"


@pytest.mark.asyncio
async def test_invalid_questions_json_falls_back():
    from bot.services.settings_service import set_setting

    await set_setting("quiz_questions", "{not valid json")
    questions = await quiz_service.get_questions()
    assert len(questions) == len(quiz_service.DEFAULT_QUESTIONS)


@pytest.mark.asyncio
async def test_pass_percent_clamped():
    from bot.services.settings_service import set_setting

    await set_setting("quiz_pass_percent", "0")
    assert await quiz_service.get_pass_percent() == 1
    await set_setting("quiz_pass_percent", "500")
    assert await quiz_service.get_pass_percent() == 100
    await set_setting("quiz_pass_percent", "abc")
    assert await quiz_service.get_pass_percent() == quiz_service.DEFAULT_PASS_PERCENT


@pytest.mark.asyncio
async def test_save_result_passed(sample_user):
    from bot.services.settings_service import set_setting

    await set_setting("quiz_pass_percent", "70")
    result = await quiz_service.save_result(
        user_id=sample_user.id,
        telegram_id=sample_user.telegram_id,
        full_name=sample_user.full_name,
        score=8,
        total=10,
        promo_code="SAVE10",
    )
    assert result.percent == 80
    assert result.passed is True
    assert result.promo_code == "SAVE10"


@pytest.mark.asyncio
async def test_save_result_failed_clears_promo(sample_user):
    from bot.services.settings_service import set_setting

    await set_setting("quiz_pass_percent", "70")
    result = await quiz_service.save_result(
        user_id=sample_user.id,
        telegram_id=sample_user.telegram_id,
        full_name=sample_user.full_name,
        score=3,
        total=10,
        promo_code="SAVE10",
    )
    assert result.percent == 30
    assert result.passed is False
    assert result.promo_code is None


@pytest.mark.asyncio
async def test_user_results_and_stats(sample_user):
    await quiz_service.save_result(sample_user.id, sample_user.telegram_id, sample_user.full_name, 9, 10)
    await quiz_service.save_result(sample_user.id, sample_user.telegram_id, sample_user.full_name, 4, 10)

    results = await quiz_service.get_user_results(sample_user.id)
    assert len(results) == 2
    assert sorted(r.score for r in results) == [4, 9]

    stats = await quiz_service.get_quiz_stats()
    assert stats["total"] == 2
    assert stats["passed"] == 1


@pytest.mark.asyncio
async def test_main_menu_quiz_button():
    from bot.utils.keyboards import main_menu_kb

    off = main_menu_kb(is_admin=False, quiz_enabled=False)
    labels_off = [b.text for row in off.keyboard for b in row]
    assert "🎯 Viktorina" not in labels_off

    on = main_menu_kb(is_admin=False, quiz_enabled=True)
    labels_on = [b.text for row in on.keyboard for b in row]
    assert "🎯 Viktorina" in labels_on
