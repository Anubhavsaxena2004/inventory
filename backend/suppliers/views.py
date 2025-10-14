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
        # Logic to get supplier ledger
        return Response({'ledger': []}, status=status.HTTP_200_OK)

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
