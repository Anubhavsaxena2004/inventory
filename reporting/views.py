from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class MonthlyReportView(APIView):
    def get(self, request):
        # Logic to get monthly report
        return Response({'report': {}}, status=status.HTTP_200_OK)

class CashReportView(APIView):
    def get(self, request):
        # Logic to get cash report
        return Response({'report': {}}, status=status.HTTP_200_OK)
