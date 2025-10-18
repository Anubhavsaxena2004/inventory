from django.db import models
from decimal import Decimal

class Employee(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    designation = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField(blank=True, null=True)
    check_out = models.TimeField(blank=True, null=True)
    working_days = models.IntegerField(default=1)
