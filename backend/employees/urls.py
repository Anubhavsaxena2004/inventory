from django.urls import path
from . import views

urlpatterns = [
    path('view/', views.ViewEmployeeView.as_view(), name='view-employee'),
    path('edit/', views.EditEmployeeView.as_view(), name='edit-employee'),
    path('salary-report/', views.SalaryReportView.as_view(), name='salary-report'),
    path('attendance/', views.AttendanceView.as_view(), name='attendance'),
]
