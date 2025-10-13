from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class OpeningBalanceView(APIView):
    def get(self, request):
        # Logic to get opening balance
        return Response({'balance': 0}, status=status.HTTP_200_OK)

class ProductsView(APIView):
    def get(self, request):
        # Logic to get products
        return Response({'products': []}, status=status.HTTP_200_OK)

class LowStockView(APIView):
    def get(self, request):
        # Logic to get low stock products
        return Response({'low_stock': []}, status=status.HTTP_200_OK)

class UsersView(APIView):
    def get(self, request):
        # Logic to get users
        return Response({'users': []}, status=status.HTTP_200_OK)

class CustomerProductsView(APIView):
    def get(self, request):
        # Logic to get customer products
        return Response({'customer_products': []}, status=status.HTTP_200_OK)
