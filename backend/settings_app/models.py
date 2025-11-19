from django.db import models
from decimal import Decimal

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # In production, use hashed passwords
    created_at = models.DateTimeField(auto_now_add=True)

class OpeningBalance(models.Model):
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)


class CustomerProduct(models.Model):
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE)
    product = models.ForeignKey('settings_app.Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'product')
