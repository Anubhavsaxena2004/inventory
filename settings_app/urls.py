from django.urls import path
from . import views

urlpatterns = [
    path('opening-balance/', views.OpeningBalanceView.as_view(), name='opening-balance'),
    path('products/', views.ProductsView.as_view(), name='products'),
    path('low-stock/', views.LowStockView.as_view(), name='low-stock'),
    path('users/', views.UsersView.as_view(), name='users'),
    path('customer-products/', views.CustomerProductsView.as_view(), name='customer-products'),
]
