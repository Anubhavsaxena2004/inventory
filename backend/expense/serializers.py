from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    class Meta:
        model = Expense
        fields = ['id', 'type', 'amount', 'description', 'date', 'supplier', 'supplier_name', 'created_at']
