from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
from django.db import models
from .models import Product, User, OpeningBalance
from .serializers import ProductSerializer, UserSerializer, OpeningBalanceSerializer

class OpeningBalanceView(APIView):
    def get(self, request):
        ob = OpeningBalance.objects.order_by('-date').first()
        serializer = OpeningBalanceSerializer(ob) if ob else None
        return Response({'balance': serializer.data if serializer else None}, status=status.HTTP_200_OK)

class ProductsView(APIView):
    def get(self, request):
        qs = Product.objects.all().order_by('name')
        if request.GET.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="products.csv"'
            writer = csv.writer(response)
            writer.writerow(['ID','Name','Category','Quantity','Min Qty','Unit Price'])
            for p in qs:
                writer.writerow([p.id, p.name, p.category, p.quantity, p.min_quantity, p.unit_price])
            return response

        try:
            page = int(request.GET.get('page','1'))
            page_size = int(request.GET.get('page_size','20'))
        except ValueError:
            page, page_size = 1, 20
        start = (page-1)*page_size
        end = start + page_size
        total = qs.count()
        products = qs[start:end]
        serializer = ProductSerializer(products, many=True)
        return Response({'products': serializer.data, 'count': total, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)

    def post(self, request):
        if request.headers.get('X-Admin') != 'true':
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        if request.headers.get('X-Admin') != 'true':
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        product_id = request.data.get('id')
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        if request.headers.get('X-Admin') != 'true':
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        product_id = request.data.get('id') or request.query_params.get('id')
        try:
            product = Product.objects.get(pk=product_id)
            product.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

class LowStockView(APIView):
    def get(self, request):
        low = Product.objects.filter(quantity__lte=models.F('min_quantity'))
        serializer = ProductSerializer(low, many=True)
        return Response({'low_stock': serializer.data}, status=status.HTTP_200_OK)

class UsersView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response({'users': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        if request.headers.get('X-Admin') != 'true':
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        name = request.data.get('name')
        email = request.data.get('email')
        if not name or not email:
            return Response({'name': 'required', 'email': 'required'}, status=status.HTTP_400_BAD_REQUEST)
        # Minimal create until password flow exists
        try:
            user = User.objects.create(name=name, email=email, password='changeme')
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomerProductsView(APIView):
    def get(self, request):
        # For now return all products as customer products
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response({'customer_products': serializer.data}, status=status.HTTP_200_OK)
