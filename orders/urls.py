from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.AddOrderView.as_view(), name='add-order'),
    path('view/', views.ViewOrdersView.as_view(), name='view-orders'),
    path('market-creditors/', views.MarketCreditorsView.as_view(), name='market-creditors'),
    path('payment-voucher/', views.PaymentVoucherView.as_view(), name='payment-voucher'),
]
