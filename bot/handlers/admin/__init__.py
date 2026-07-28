from .dashboard import admin_router
from .payments import admin_payments_router
from .tariffs import admin_tariffs_router
from .users import admin_users_router
from .stats import admin_stats_router
from .social import admin_social_router
from .payment_methods import admin_payment_methods_router
from .settings import admin_settings_router
from .help import admin_help_router
from .signal_content import admin_signal_content_router
from .course_content import admin_course_content_router
from .channel_announcement import admin_channel_announce_router
from .messages import admin_messages_router
from .diagnostic import admin_diagnostic_router

# Barcha admin routelarni bitta joyda yig'amiz
routers = [
    admin_router,
    admin_payments_router,
    admin_tariffs_router,
    admin_users_router,
    admin_stats_router,
    admin_social_router,
    admin_payment_methods_router,
    admin_settings_router,
    admin_help_router,
    admin_signal_content_router,
    admin_course_content_router,
    admin_channel_announce_router,
    admin_messages_router,
    admin_diagnostic_router,
]