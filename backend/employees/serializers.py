from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'id',
            'name',
            'phone',
            'email',
            'designation',
            'address',
            'blood_group',
            'salary',
            'created_at',
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',
            'employee_name',
            'date',
            'check_in',
            'check_out',
            'working_days',
        ]

