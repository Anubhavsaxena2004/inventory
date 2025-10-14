from django.urls import path
from . import views

urlpatterns = [
    path('view/', views.ViewSuppliersView.as_view(), name='view-suppliers'),
    path('ledger/', views.SupplierLedgerView.as_view(), name='supplier-ledger'),
    path('add/', views.AddSupplierView.as_view(), name='add-supplier'),
]
