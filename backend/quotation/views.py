from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Quotation, QuotationItem
from inventory_project.auth_utils import is_admin_request
from customers.models import Customer

class ViewQuotationView(APIView):
    def get(self, request):
        qs = Quotation.objects.all().order_by('-date')
        data = []
        for q in qs:
            data.append({'id': q.id, 'customer_name': q.customer.name, 'customer_cell': q.customer.phone, 'date': q.date})
        return Response({'quotations': data}, status=status.HTTP_200_OK)

class AddQuotationView(APIView):
    def post(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        try:
            customer = Customer.objects.get(pk=request.data.get('customer'))
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_400_BAD_REQUEST)
        q = Quotation.objects.create(customer=customer, customer_email=request.data.get('customer_email'), date=request.data.get('date'))
        for it in request.data.get('items', []):
            QuotationItem.objects.create(quotation=q, description=it.get('description',''), rate=it.get('rate',0), quantity=it.get('quantity',1))
        return Response({'id': q.id}, status=status.HTTP_201_CREATED)

    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        qid = request.data.get('id')
        try:
            q = Quotation.objects.get(pk=qid)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)
        if 'customer' in request.data:
            try:
                q.customer = Customer.objects.get(pk=request.data.get('customer'))
            except Customer.DoesNotExist:
                return Response({'error': 'Customer not found'}, status=status.HTTP_400_BAD_REQUEST)
        for f in ['customer_email','date']:
            if f in request.data:
                setattr(q, f, request.data.get(f))
        q.save()
        if 'items' in request.data:
            q.items.all().delete()
            for it in request.data.get('items', []):
                QuotationItem.objects.create(quotation=q, description=it.get('description',''), rate=it.get('rate',0), quantity=it.get('quantity',1))
        return Response({'id': q.id}, status=status.HTTP_200_OK)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        qid = request.data.get('id') or request.query_params.get('id')
        try:
            q = Quotation.objects.get(pk=qid)
            q.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)
