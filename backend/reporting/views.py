from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.utils.dateparse import parse_date
from orders.models import Order
from expense.models import Expense

class MonthlyReportView(APIView):
    def get(self, request):
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        report_type = request.GET.get('type', 'summary')

        order_qs = Order.objects.all()
        expense_qs = Expense.objects.all()
        if from_date:
            order_qs = order_qs.filter(order_date__gte=from_date)
            expense_qs = expense_qs.filter(date__gte=from_date)
        if to_date:
            order_qs = order_qs.filter(order_date__lte=to_date)
            expense_qs = expense_qs.filter(date__lte=to_date)

        if report_type == 'summary':
            general_order_amount = order_qs.aggregate(v=Sum('total_bill'))['v'] or 0
            general_order_received = order_qs.aggregate(v=Sum('received'))['v'] or 0
            total_expense = expense_qs.aggregate(v=Sum('amount'))['v'] or 0
            # placeholders for stock purchase and salaries without models
            data = {
                'general_order_amount': general_order_amount,
                'general_order_amount_received': general_order_received,
                'stock_purchase_amount': 0,
                'stock_purchase_amount_paid': 0,
                'total_expense': total_expense,
                'salaries': 0,
            }
        elif report_type == 'customer_orders':
            data = list(order_qs.values('customer__name').annotate(total=Sum('total_bill')).order_by('-total'))
        elif report_type == 'expense':
            data = list(expense_qs.values('type').annotate(total=Sum('amount')).order_by('-total'))
        else:
            data = []

        return Response({'report': data}, status=status.HTTP_200_OK)

class CashReportView(APIView):
    def get(self, request):
        date_str = request.GET.get('date')
        if not date_str:
            return Response({'report': {}}, status=status.HTTP_200_OK)
        date = parse_date(date_str)
        if not date:
            return Response({'error': 'Invalid date'}, status=status.HTTP_400_BAD_REQUEST)

        orders_on_day = Order.objects.filter(order_date=date)
        expenses_on_day = Expense.objects.filter(date=date)

        cash_in_hand = (orders_on_day.aggregate(v=Sum('received'))['v'] or 0) - (expenses_on_day.aggregate(v=Sum('amount'))['v'] or 0)
        customer_amount = orders_on_day.aggregate(v=Sum('balance'))['v'] or 0
        supplier_amount = 0
        expense_amount = expenses_on_day.aggregate(v=Sum('amount'))['v'] or 0

        transactions = []
        for o in orders_on_day:
            transactions.append({'type':'Order', 'description': f"Order #{o.id}", 'amount': float(o.received), 'date': str(o.order_date)})
        for ex in expenses_on_day:
            transactions.append({'type':'Expense', 'description': ex.description, 'amount': float(ex.amount), 'date': str(ex.date)})

        return Response({'report': { 'cash_in_hand': cash_in_hand, 'customer_amount': customer_amount, 'supplier_amount': supplier_amount, 'expense_amount': expense_amount, 'transactions': transactions }}, status=status.HTTP_200_OK)
