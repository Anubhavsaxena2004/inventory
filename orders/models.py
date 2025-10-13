from django.db import models
from decimal import Decimal
from customers.models import Customer
from settings_app.models import Product

class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('working', 'Working'),
        ('completed', 'Completed'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank', 'Bank'),
        ('cheque', 'Cheque'),
    ]

    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    customer_cell = models.CharField(max_length=15)
    order_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_items = models.IntegerField(default=0)
    total_bill = models.DecimalField(max_digits=10, decimal_places=2)
    net_bill = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    received = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    previous_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_category = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    stock_quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

class PaymentVoucher(models.Model):
    voucher_no = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=50)
    payment_method = models.CharField(max_length=10, choices=Order.PAYMENT_METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField()
