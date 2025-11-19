from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count, Q
from django.http import HttpResponse
from django.utils.dateparse import parse_date
from calendar import monthrange
from datetime import date as date_cls
import csv
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer
from inventory_project.auth_utils import is_admin_request


class ViewEmployeeView(APIView):
    def get(self, request):
        qs = Employee.objects.all().order_by('name')
        search = request.GET.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
                | Q(designation__icontains=search)
            )

        if request.GET.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="employees.csv"'
            writer = csv.writer(response)
            writer.writerow(['Name', 'Phone', 'Email', 'Designation', 'Salary'])
            for emp in qs:
                writer.writerow(
                    [emp.name, emp.phone or '', emp.email or '', emp.designation, emp.salary]
                )
            return response

        try:
            page = int(request.GET.get('page', '1'))
            page_size = int(request.GET.get('page_size', '20'))
        except ValueError:
            page, page_size = 1, 20
        start = (page - 1) * page_size
        end = start + page_size
        total = qs.count()
        serializer = EmployeeSerializer(qs[start:end], many=True)
        return Response(
            {
                'employees': serializer.data,
                'count': total,
                'page': page,
                'page_size': page_size,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        emp_id = request.data.get('id') or request.query_params.get('id')
        if not emp_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            emp = Employee.objects.get(pk=int(emp_id))
            emp.delete()
            return Response({'deleted': True}, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)


class EditEmployeeView(APIView):
    def put(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        emp_id = request.data.get('id') or request.query_params.get('id')
        if not emp_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            emp = Employee.objects.get(pk=int(emp_id))
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmployeeSerializer(emp, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalaryReportView(APIView):
    def get(self, request):
        month_str = request.GET.get('month')
        if not month_str:
            month_str = date_cls.today().strftime('%Y-%m')

        try:
            year, month = [int(x) for x in month_str.split('-', 1)]
            last_day = monthrange(year, month)[1]
            start_date = date_cls(year, month, 1)
            end_date = date_cls(year, month, last_day)
        except Exception:
            return Response({'error': 'Invalid month format. Use YYYY-MM.'}, status=status.HTTP_400_BAD_REQUEST)

        employees = Employee.objects.all()
        totals = employees.aggregate(total=Sum('salary'), avg=Avg('salary'))
        highest = employees.order_by('-salary').first()

        attendance_summary = (
            Attendance.objects.filter(date__range=(start_date, end_date))
            .values('employee_id', 'employee__name')
            .annotate(
                entries=Count('id'),
                total_working_days=Sum('working_days'),
            )
            .order_by('employee__name')
        )

        report = {
            'month': month_str,
            'total_employees': employees.count(),
            'total_salary': str(totals.get('total') or 0),
            'average_salary': str(totals.get('avg') or 0),
            'highest_salary_employee': {
                'id': highest.id,
                'name': highest.name,
                'salary': str(highest.salary),
            }
            if highest
            else None,
            'attendance_summary': [
                {
                    'employee_id': row['employee_id'],
                    'employee_name': row['employee__name'],
                    'entries': row['entries'],
                    'total_working_days': row['total_working_days'] or 0,
                }
                for row in attendance_summary
            ],
        }
        return Response({'report': report}, status=status.HTTP_200_OK)


class AttendanceView(APIView):
    def get(self, request):
        qs = Attendance.objects.select_related('employee').order_by('-date')
        month_str = request.GET.get('month')
        employee_id = request.GET.get('employee')
        if month_str:
            parsed = parse_date(f"{month_str}-01") if len(month_str) == 7 else parse_date(month_str)
            if parsed:
                qs = qs.filter(date__year=parsed.year, date__month=parsed.month)
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        serializer = AttendanceSerializer(qs, many=True)
        return Response({'attendance': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        if not is_admin_request(request):
            return Response({'error': 'Admin required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
