from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ViewQuotationView(APIView):
    def get(self, request):
        # Logic to view quotations
        return Response({'quotations': []}, status=status.HTTP_200_OK)

class AddQuotationView(APIView):
    def post(self, request):
        # Logic to add quotation
        return Response({'message': 'Quotation added'}, status=status.HTTP_201_CREATED)
