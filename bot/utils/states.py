from aiogram.fsm.state import State, StatesGroup


class PaymentStates(StatesGroup):
    select_tariff = State()
    select_method = State()
    show_card = State()
    upload_receipt = State()
    waiting_approval = State()


class CoursePaymentStates(StatesGroup):
    upload_receipt = State()


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


class AdminEditTariffStates(StatesGroup):
    waiting_tariff_id = State()
    waiting_field = State()
    waiting_value = State()


class AdminSettingsStates(StatesGroup):
    waiting_setting_value = State()
    waiting_import_json = State()