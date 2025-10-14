from django.urls import path
from . import views

urlpatterns = [
    path('monthly/', views.MonthlyReportView.as_view(), name='monthly-report'),
    path('cash/', views.CashReportView.as_view(), name='cash-report'),
]
