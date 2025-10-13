from django.urls import path
from . import views

urlpatterns = [
    path('view/', views.ViewQuotationView.as_view(), name='view-quotation'),
    path('add/', views.AddQuotationView.as_view(), name='add-quotation'),
]
