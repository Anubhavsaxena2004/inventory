from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ExpenseListView(APIView):
    def get(self, request):
        # Logic to get expense list
        return Response({'expenses': []}, status=status.HTTP_200_OK)

class NewExpenseView(APIView):
    def post(self, request):
        # Logic to add new expense
        return Response({'message': 'Expense added'}, status=status.HTTP_201_CREATED)
