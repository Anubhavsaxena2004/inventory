# Inventory Management System for AN

A comprehensive inventory management system built with Django REST Framework backend and React frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ (for frontend)
- Git

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install Django==5.2.7 djangorestframework==3.15.0 django-cors-headers==4.0.0
   ```

2. **Run database migrations:**
   ```bash
   python backend/manage.py migrate
   ```

3. **Start the Django server:**
   ```bash
   python backend/manage.py runserver
   ```
   
   Or use the provided startup script:
   ```bash
   python start_server.py
   ```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_inventory_system.py
```

This will test:
- Add customer functionality
- View customers
- Database operations
- API endpoints

## 🔧 Fixed Issues

### Add Customer Error Resolution

The following issues have been identified and fixed:

1. **Phone Field Validation**
   - **Issue**: Backend model required phone field but frontend allowed empty values
   - **Fix**: Made phone field optional in the model (`blank=True, null=True`)

2. **Opening Balance Handling**
   - **Issue**: Frontend sent integer 0 but backend expected Decimal
   - **Fix**: Added proper DecimalField handling in serializer

3. **Error Handling**
   - **Issue**: Poor error messages and validation feedback
   - **Fix**: Enhanced error handling with field-specific error messages

4. **Form Validation**
   - **Issue**: Basic validation only checked name and phone length
   - **Fix**: Added email format validation and better error display

### Code Changes Made

#### Backend Changes

**`backend/customers/models.py`:**
```python
# Made phone field optional
phone = models.CharField(max_length=15, blank=True, null=True)
```

**`backend/customers/serializers.py`:**
```python
# Added proper DecimalField handling
opening_balance = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
```

#### Frontend Changes

**`frontend/src/components/AddCustomer.jsx`:**
- Enhanced validation with email format checking
- Improved error handling with field-specific error messages
- Better error display for all form fields
- Enhanced API response handling

## 📋 API Endpoints

### Customers
- `GET /api/customers/view/` - List all customers
- `POST /api/customers/add/` - Add new customer
- `PUT /api/customers/add/` - Update customer (admin only)
- `DELETE /api/customers/add/` - Delete customer (admin only)

### Other Endpoints
- `GET /api/dashboard/` - Dashboard data
- `GET /api/orders/view/` - List orders
- `GET /api/suppliers/view/` - List suppliers
- `GET /api/expense/view/` - List expenses

## 🗄️ Database Schema

### Customer Model
```python
class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='cash')
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)
```

## 🐛 Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'rest_framework'"**
   - Solution: Install Django REST Framework: `pip install djangorestframework==3.15.0`

2. **"Connection error - Django server not running"**
   - Solution: Start the Django server: `python backend/manage.py runserver`

3. **CORS errors in frontend**
   - Solution: Ensure Django CORS headers is installed and configured

4. **Database migration errors**
   - Solution: Run migrations: `python backend/manage.py migrate`

### Testing the Fix

To verify the add customer functionality is working:

1. Start the Django server
2. Run the test script: `python test_inventory_system.py`
3. Check that all customer-related tests pass

## 📁 Project Structure

```
inventory/
├── backend/
│   ├── customers/          # Customer management app
│   ├── orders/             # Order management app
│   ├── suppliers/          # Supplier management app
│   ├── expense/            # Expense management app
│   ├── quotation/          # Quotation management app
│   ├── dashboard/          # Dashboard app
│   ├── reporting/          # Reporting app
│   ├── settings_app/      # Settings app
│   ├── employees/          # Employee management app
│   ├── inventory_project/  # Main project settings
│   ├── manage.py           # Django management script
│   └── db.sqlite3         # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── auth/          # Authentication utilities
│   │   └── ...
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── test_inventory_system.py  # Comprehensive test suite
├── start_server.py        # Server startup script
└── README.md             # This file
```

## 🎯 Features

- ✅ Customer Management (Add, View, Update, Delete)
- ✅ Product Management
- ✅ Order Management
- ✅ Supplier Management
- ✅ Expense Tracking
- ✅ Quotation System
- ✅ Dashboard with Analytics
- ✅ Reporting System
- ✅ Employee Management
- ✅ Authentication System

## 🔄 Next Steps

1. **Install Node.js** for frontend development
2. **Run the test suite** to verify all functionality
3. **Start both servers** (Django backend + React frontend)
4. **Test the add customer functionality** through the web interface

The system is now ready for development and testing!
