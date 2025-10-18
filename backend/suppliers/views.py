from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Supplier
from inventory_project.auth_utils import is_admin_request

class ViewSuppliersView(APIView):
    def get(self, request):
        suppliers = Supplier.objects.all().order_by('name')
        data = [ {'id':s.id,'name':s.name,'phone':s.phone,'email':s.email,'address':s.address} for s in suppliers ]
        return Response({'suppliers': data}, status=status.HTTP_200_OK)

class SupplierLedgerView(APIView):
    def get(self, request):
        supplier_id = request.query_params.get('supplier_id')
        if not supplier_id:
            return Response({'error': 'supplier_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            supplier = Supplier.objects.get(pk=int(supplier_id))
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        # Implement ledger logic: fetch supplier-related transactions (e.g., orders/payments)
        # Assuming suppliers are linked to orders via some field, e.g., supplier in Order model
        # For now, placeholder - need to adjust based on actual model relations
        from orders.models import Order, PaymentVoucher
        ledger = []
        # Example: orders where supplier is involved (adjust field as per model)
        orders = Order.objects.filter(customer__name__icontains=supplier.name).order_by('-order_date')[:50]  # Placeholder filter
        for o in orders:
            ledger.append({
                'date': o.order_date,
                'description': f'Order {o.id}',
                'debit': str(o.total_bill),
                'credit': str(o.received),
                'balance': str(o.balance)
            })
        # Payments related to supplier (if any)
        payments = PaymentVoucher.objects.filter(description__icontains=supplier.name).order_by('-date')[:50]
        for p in payments:
            ledger.append({
                'date': p.date,
                'description': f'Payment {p.voucher_no}',
                'debit': '0',
                'credit': str(p.amount),
                'balance': '0'  # Calculate cumulative if needed
            })
        # Sort ledger by date
        ledger.sort(key=lambda x: x['date'], reverse=True)
        return Response({'ledger': ledger, 'supplier': {'id': supplier.id, 'name': supplier.name}}, status=status.HTTP_200_OK)

class AddSupplierView(APIView):
    def post(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        s = Supplier.objects.create(name=request.data.get('name',''), phone=request.data.get('phone'), email=request.data.get('email'), address=request.data.get('address'))
        return Response({'id': s.id, 'name': s.name, 'phone': s.phone, 'email': s.email, 'address': s.address}, status=status.HTTP_201_CREATED)

    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        supplier_id = request.data.get('id')
        try:
            s = Supplier.objects.get(pk=supplier_id)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        for f in ['name','phone','email','address']:
            if f in request.data:
                setattr(s, f, request.data.get(f))
        s.save()
        return Response({'id': s.id, 'name': s.name, 'phone': s.phone, 'email': s.email, 'address': s.address}, status=status.HTTP_200_OK)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        supplier_id = request.data.get('id') or request.query_params.get('id')
        try:
            s = Supplier.objects.get(pk=supplier_id)
            s.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
