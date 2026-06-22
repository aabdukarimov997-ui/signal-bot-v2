from aiogram.fsm.state import State, StatesGroup


class PaymentStates(StatesGroup):
    select_tariff = State()
    select_method = State()
    show_card = State()
    upload_receipt = State()
    waiting_approval = State()


class AdminSocialStates(StatesGroup):
    waiting_instagram = State()
    waiting_twitter = State()
    waiting_youtube = State()
    waiting_website = State()
    waiting_free_channel = State()


class AdminAddTariffStates(StatesGroup):
    waiting_name = State()
    waiting_duration = State()
    waiting_price = State()