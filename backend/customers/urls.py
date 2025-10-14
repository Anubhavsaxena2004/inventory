from django.urls import path
from . import views

urlpatterns = [
    path('ledger/', views.CreditCustomerLedgerView.as_view(), name='credit-customer-ledger'),
    path('installments/', views.CashCustomerInstallmentsView.as_view(), name='cash-customer-installments'),
    path('view/', views.ViewCustomerView.as_view(), name='view-customer'),
    path('add/', views.AddCustomerView.as_view(), name='add-customer'),
]
