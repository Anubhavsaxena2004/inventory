"""
URL configuration for inventory_project project.
"""

import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from . import views as root_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/suppliers/', include('suppliers.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/expense/', include('expense.urls')),
    path('api/quotation/', include('quotation.urls')),
    path('api/settings/', include('settings_app.urls')),
    path('api/reporting/', include('reporting.urls')),
    path('api/auth/login/', root_views.login_view),
    path('api/auth/me/', root_views.me_view),
    path('healthz/', root_views.health_check),
]

# -----------------------------
# Serve /static/
# -----------------------------
# STATIC_URL files (collected by collectstatic or in STATICFILES_DIRS)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# -----------------------------
# Catch-all for React frontend
# Exclude API and /static/ requests
# -----------------------------
urlpatterns += [
    re_path(
        r'^(?!api/|static/).*$',  # Negative lookahead to prevent hijacking
        root_views.FrontendAppView.as_view(),
        name='frontend'
    ),
]
