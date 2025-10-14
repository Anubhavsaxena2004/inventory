from rest_framework import serializers
from .models import Order, OrderItem, PaymentVoucher

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_category', 'product', 'product_name', 'stock_quantity', 'unit_price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_type', 'customer', 'customer_name', 'customer_cell', 'order_date', 'status', 'total_items', 'total_bill', 'net_bill', 'tax', 'discount', 'received', 'balance', 'payment_method', 'previous_balance', 'remaining_balance', 'items']

class PaymentVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentVoucher
        fields = ['id', 'voucher_no', 'type', 'payment_method', 'amount', 'description', 'date']
