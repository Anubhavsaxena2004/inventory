from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
from .models import Order, OrderItem, PaymentVoucher
from customers.models import Customer
from settings_app.models import Product
from .serializers import OrderSerializer, OrderItemSerializer, PaymentVoucherSerializer
from inventory_project.auth_utils import is_admin_request


class AddOrderView(APIView):
    def post(self, request):
        data = request.data
        try:
            customer_id = data.get('customer')
            customer = Customer.objects.get(pk=customer_id)
            from datetime import date
            # safe coercions with defaults
            def to_int(v, default=0):
                try:
                    return int(v)
                except Exception:
                    return default
            def to_decimal(v, default=0):
                try:
                    from decimal import Decimal
                    return Decimal(str(v))
                except Exception:
                    from decimal import Decimal
                    return Decimal(default)

            order_date = data.get('order_date') or date.today()

            order = Order.objects.create(
                order_type=data.get('order_type', 'cash'),
                customer=customer,
                customer_cell=data.get('customer_cell', customer.phone),
                order_date=order_date,
                status=data.get('status', 'pending'),
                total_items=to_int(data.get('total_items', 0)),
                total_bill=to_decimal(data.get('total_bill', 0)),
                net_bill=to_decimal(data.get('net_bill', 0)),
                tax=to_decimal(data.get('tax', 0)),
                discount=to_decimal(data.get('discount', 0)),
                received=to_decimal(data.get('received', 0)),
                balance=to_decimal(data.get('balance', 0)),
                payment_method=data.get('payment_method'),
                previous_balance=to_decimal(data.get('previous_balance', 0)),
                remaining_balance=to_decimal(data.get('remaining_balance', 0)),
            )

            items = data.get('items', [])
            for it in items:
                prod = Product.objects.get(pk=it.get('product'))
                OrderItem.objects.create(
                    order=order,
                    product_category=it.get('product_category', ''),
                    product=prod,
                    stock_quantity=it.get('stock_quantity', 0),
                    unit_price=it.get('unit_price', 0),
                    quantity=it.get('quantity', 1),
                )

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_400_BAD_REQUEST)


class ViewOrdersView(APIView):
    def get(self, request):
        orders_qs = Order.objects.all().order_by('-order_date')

        customer_name = request.GET.get('customer_name')
        status_param = request.GET.get('status')
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')

        if customer_name:
            orders_qs = orders_qs.filter(customer__name__icontains=customer_name)
        if status_param:
            orders_qs = orders_qs.filter(status=status_param)
        if from_date:
            orders_qs = orders_qs.filter(order_date__gte=from_date)
        if to_date:
            orders_qs = orders_qs.filter(order_date__lte=to_date)

        # pagination
        try:
            page = int(request.GET.get('page', '1'))
            page_size = int(request.GET.get('page_size', '20'))
        except ValueError:
            page, page_size = 1, 20
        start = (page-1)*page_size
        end = start + page_size
        total = orders_qs.count()

        if request.GET.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="orders.csv"'
            writer = csv.writer(response)
            writer.writerow(['Order ID','Customer','Status','Total Bill','Discount','Received','Balance','Date'])
            for o in orders_qs:
                writer.writerow([o.id, o.customer.name, o.status, o.total_bill, o.discount, o.received, o.balance, o.order_date])
            return response

        orders = orders_qs[start:end]
        serializer = OrderSerializer(orders, many=True)
        return Response({'orders': serializer.data, 'count': total, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)


class MarketCreditorsView(APIView):
    def get(self, request):
        # Aggregate balances per customer for credit orders with positive balance
        from django.db.models import Sum
        creditors_qs = Order.objects.filter(order_type='credit', balance__gt=0).values(
            'customer__name', 'customer__phone'
        ).annotate(
            balance=Sum('balance')
        ).filter(balance__gt=0).order_by('customer__name')
        creditors = [
            {
                'customer_name': c['customer__name'],
                'customer_cell': c['customer__phone'],
                'balance': str(c['balance'])
            }
            for c in creditors_qs
        ]
        return Response({'creditors': creditors}, status=status.HTTP_200_OK)


class PaymentVoucherView(APIView):
    def get(self, request):
        vouchers = PaymentVoucher.objects.all().order_by('-date')[:50]
        serializer = PaymentVoucherSerializer(vouchers, many=True)
        return Response({'vouchers': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        try:
            voucher = PaymentVoucher.objects.create(
                voucher_no=data.get('voucher_no'),
                type=data.get('type'),
                payment_method=data.get('payment_method'),
                amount=data.get('amount'),
                description=data.get('description'),
                date=data.get('date'),
            )
            serializer = PaymentVoucherSerializer(voucher)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateOrderView(APIView):
    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        order_id = request.data.get('id')
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        # Only allow certain fields to be updated inline
        allowed = {k: request.data.get(k) for k in ['status', 'payment_method', 'received'] if k in request.data}
        for k,v in allowed.items():
            setattr(order, k, v)
        if 'received' in allowed:
            try:
                order.balance = (order.net_bill - order.received)
                order.remaining_balance = (order.previous_balance + order.balance)
            except Exception:
                pass
        order.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class DeleteOrderView(APIView):
    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        order_id = request.data.get('id') or request.query_params.get('id')
        try:
            order = Order.objects.get(pk=order_id)
            order.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
