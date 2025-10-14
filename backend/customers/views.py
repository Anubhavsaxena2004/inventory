from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
from .models import Customer
from inventory_project.auth_utils import is_admin_request
from .serializers import CustomerSerializer

class CreditCustomerLedgerView(APIView):
    def get(self, request):
        # Logic to get credit customer ledger
        return Response({'ledger': []}, status=status.HTTP_200_OK)

class CashCustomerInstallmentsView(APIView):
    def get(self, request):
        # Logic to get cash customer installments
        return Response({'installments': []}, status=status.HTTP_200_OK)

class ViewCustomerView(APIView):
    def get(self, request):
        qs = Customer.objects.all().order_by('-created_at')

        if request.GET.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="customers.csv"'
            writer = csv.writer(response)
            writer.writerow(['ID','Name','Type','Phone','Email','Opening Balance','Balance','Created'])
            for c in qs:
                writer.writerow([c.id, c.name, c.type, c.phone, c.email, c.opening_balance, c.balance, c.created_at])
            return response

        try:
            page = int(request.GET.get('page','1'))
            page_size = int(request.GET.get('page_size','20'))
        except ValueError:
            page, page_size = 1, 20
        start = (page-1)*page_size
        end = start + page_size
        total = qs.count()
        customers = qs[start:end]
        serializer = CustomerSerializer(customers, many=True)
        return Response({'customers': serializer.data, 'count': total, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)

class AddCustomerView(APIView):
    def post(self, request):
        data = request.data
        serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        customer_id = request.data.get('id') or request.query_params.get('id')
        if not customer_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = Customer.objects.get(pk=int(customer_id))
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        customer_id = request.data.get('id') or request.query_params.get('id')
        if not customer_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = Customer.objects.get(pk=int(customer_id))
            customer.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)