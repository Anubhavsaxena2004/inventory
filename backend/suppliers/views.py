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
        supplier_id = request.GET.get('supplier_id')
        if not supplier_id:
            return Response({'error': 'supplier_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            supplier = Supplier.objects.get(pk=int(supplier_id))
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        # Implement ledger logic: fetch supplier-related transactions (e.g., expenses/payments)
        # Suppliers are not directly linked to orders, but may be involved in expenses or payments
        from orders.models import PaymentVoucher
        from expense.models import Expense
        ledger = []
        # Expenses related to supplier
        expenses = Expense.objects.filter(supplier=supplier).order_by('-date')[:50]
        for e in expenses:
            ledger.append({
                'date': e.date,
                'description': f'Expense: {e.type} - {e.description}',
                'debit': str(e.amount),
                'credit': '0',
                'balance': '0'  # Calculate cumulative if needed
            })
        # Payments to supplier
        payments = PaymentVoucher.objects.filter(supplier=supplier).order_by('-date')[:50]
        for p in payments:
            ledger.append({
                'date': p.date,
                'description': f'Payment {p.voucher_no} - {p.description}',
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
        data = request.data if hasattr(request, 'data') else request.POST
        s = Supplier.objects.create(name=data.get('name',''), phone=data.get('phone'), email=data.get('email'), address=data.get('address'))
        return Response({'id': s.id, 'name': s.name, 'phone': s.phone, 'email': s.email, 'address': s.address}, status=status.HTTP_201_CREATED)

    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data if hasattr(request, 'data') else request.POST
        supplier_id = data.get('id')
        try:
            s = Supplier.objects.get(pk=supplier_id)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        for f in ['name','phone','email','address']:
            if f in data:
                setattr(s, f, data.get(f))
        s.save()
        return Response({'id': s.id, 'name': s.name, 'phone': s.phone, 'email': s.email, 'address': s.address}, status=status.HTTP_200_OK)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        supplier_id = request.data.get('id') or request.GET.get('id')
        try:
            s = Supplier.objects.get(pk=supplier_id)
            s.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
