from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ViewSuppliersView(APIView):
    def get(self, request):
        # Logic to view suppliers
        return Response({'suppliers': []}, status=status.HTTP_200_OK)

class SupplierLedgerView(APIView):
    def get(self, request):
        # Logic to get supplier ledger
        return Response({'ledger': []}, status=status.HTTP_200_OK)

class AddSupplierView(APIView):
    def post(self, request):
        # Logic to add supplier
        return Response({'message': 'Supplier added'}, status=status.HTTP_201_CREATED)
