from django.db import models
from decimal import Decimal

class Customer(models.Model):
    TYPE_CHOICES = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='cash')
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)
