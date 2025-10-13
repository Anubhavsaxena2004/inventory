from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from orders.models import Order
from customers.models import Customer
from expense.models import Expense

class DashboardStatsView(APIView):
    def get(self, request):
        # Total pending orders
        pending_orders = Order.objects.filter(status='pending').count()

        # Pending bills
        pending_bills = Order.objects.filter(status='pending').aggregate(total=Sum('total_bill'))['total'] or 0

        # Completed orders
        completed_orders = Order.objects.filter(status='completed').count()

        # Working orders
        working_orders = Order.objects.filter(status='working').count()

        # Latest pending orders
        latest_pending = Order.objects.filter(status='pending').order_by('-date')[:5].values('id', 'customer__name', 'total_bill', 'date')

        # Latest completed orders
        latest_completed = Order.objects.filter(status='completed').order_by('-date')[:5].values('id', 'customer__name', 'total_bill', 'date')

        # New Market Orders (creditors)
        market_orders = Customer.objects.filter(type='credit').order_by('-created_at')[:5].values('name', 'balance', 'created_at')

        # Latest Expense
        latest_expenses = Expense.objects.order_by('-date')[:5].values('type', 'amount', 'date')

        data = {
            'total_pending_orders': pending_orders,
            'pending_bills': pending_bills,
            'completed_orders': completed_orders,
            'working_orders': working_orders,
            'latest_pending_orders': list(latest_pending),
            'latest_completed_orders': list(latest_completed),
            'new_market_orders': list(market_orders),
            'latest_expenses': list(latest_expenses),
        }

        return Response(data, status=status.HTTP_200_OK)
