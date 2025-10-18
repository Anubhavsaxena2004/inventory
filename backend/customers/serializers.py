from rest_framework import serializers
from .models import Customer
from decimal import Decimal

class CustomerSerializer(serializers.ModelSerializer):
    opening_balance = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'type', 'opening_balance', 'balance', 'created_at']
