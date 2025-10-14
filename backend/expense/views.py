from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
from .models import Expense
from inventory_project.auth_utils import is_admin_request
from .serializers import ExpenseSerializer

class ExpenseListView(APIView):
    def get(self, request):
        qs = Expense.objects.all().order_by('-date')

        if request.GET.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="expenses.csv"'
            writer = csv.writer(response)
            writer.writerow(['ID','Type','Amount','Description','Date'])
            for ex in qs:
                writer.writerow([ex.id, ex.type, ex.amount, ex.description, ex.date])
            return response

        try:
            page = int(request.GET.get('page','1'))
            page_size = int(request.GET.get('page_size','20'))
        except ValueError:
            page, page_size = 1, 20
        start = (page-1)*page_size
        end = start + page_size
        total = qs.count()
        expenses = qs[start:end]
        serializer = ExpenseSerializer(expenses, many=True)
        return Response({'expenses': serializer.data, 'count': total, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)

class NewExpenseView(APIView):
    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        expense_id = request.data.get('id')
        try:
            expense = Expense.objects.get(pk=expense_id)
        except Expense.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        expense_id = request.data.get('id') or request.query_params.get('id')
        try:
            expense = Expense.objects.get(pk=expense_id)
            expense.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Expense.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)