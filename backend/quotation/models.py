from django.db import models
from customers.models import Customer

class Quotation(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    customer_email = models.EmailField(blank=True, null=True)
    date = models.DateField()

class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    description = models.TextField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
