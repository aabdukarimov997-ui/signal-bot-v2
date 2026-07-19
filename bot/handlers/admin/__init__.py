from .dashboard import admin_router
from .payments import admin_payments_router
from .tariffs import admin_tariffs_router
from .users import admin_users_router
from .stats import admin_stats_router
from .social import admin_social_router
from .payment_methods import admin_payment_methods_router
from .settings import admin_settings_router
from .help import admin_help_router

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
]