from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.ExpenseListView.as_view(), name='expense-list'),
    path('new/', views.NewExpenseView.as_view(), name='new-expense'),
]
