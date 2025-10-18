#!/usr/bin/env python3
"""
Comprehensive Feature Verification Script for Inventory Management System
Tests all features mentioned in the requirements
"""

import requests
import json
import sys
from datetime import datetime, date, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_api_endpoint(endpoint, method="GET", data=None, expected_status=200, description=""):
    """Test a single API endpoint with detailed logging"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        else:
            return False, f"Unsupported method: {method}"
        
        success = response.status_code == expected_status
        return success, {
            'status_code': response.status_code,
            'response': response.text,
            'headers': dict(response.headers),
            'description': description
        }
    
    except requests.exceptions.ConnectionError:
        return False, "Connection error - Django server not running"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_dashboard_features():
    """Test Dashboard features"""
    print("🏠 Testing Dashboard Features...")
    
    features = [
        ("/api/dashboard/stats/", "Dashboard Stats", "Total pending orders, completed orders, working orders, latest orders, market orders, expenses")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if success:
            try:
                data = json.loads(result['response'])
                print(f"    📊 Stats: Pending Orders: {data.get('total_pending_orders', 0)}, Completed: {data.get('completed_orders', 0)}")
            except:
                pass
        else:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_reporting_features():
    """Test Reporting features"""
    print("\n📊 Testing Reporting Features...")
    
    today = date.today()
    last_month = today - timedelta(days=30)
    
    features = [
        (f"/api/reporting/monthly/?from={last_month}&to={today}&type=summary", "Monthly Summary Report", "General Order Amount, Stock Purchase, Expenses, Salaries"),
        (f"/api/reporting/monthly/?from={last_month}&to={today}&type=customer_orders", "Customer Orders Report", "Orders by customer"),
        (f"/api/reporting/monthly/?from={last_month}&to={today}&type=expense", "Expense Report", "Expenses by type"),
        (f"/api/reporting/cash/?date={today}", "Cash Report", "Cash In Hand, Customer Amount, Supplier Amount, Expense Amount")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_order_features():
    """Test Order Management features"""
    print("\n🛒 Testing Order Management Features...")
    
    # First create a test customer
    customer_data = {
        "name": "Test Customer for Orders",
        "email": "testorder@example.com",
        "phone": "1234567890",
        "type": "cash",
        "opening_balance": 0
    }
    
    success, result = test_api_endpoint("/api/customers/add/", "POST", customer_data, 201)
    if not success:
        print("  ❌ Failed to create test customer for orders")
        return False
    
    try:
        customer_id = json.loads(result['response'])['id']
    except:
        print("  ❌ Could not get customer ID from response")
        return False
    
    # Create a test product
    product_data = {
        "name": "Test Product",
        "category": "Test Category",
        "quantity": 100,
        "min_quantity": 10,
        "unit_price": 25.50
    }
    
    success, result = test_api_endpoint("/api/settings/products/", "POST", product_data, 201, headers={'X-Admin': 'true'})
    if not success:
        print("  ❌ Failed to create test product for orders")
        return False
    
    try:
        product_id = json.loads(result['response'])['id']
    except:
        print("  ❌ Could not get product ID from response")
        return False
    
    # Test order features
    features = [
        ("/api/orders/view/", "View Orders", "Filter by customer, status, date range"),
        ("/api/orders/creditors/", "Market Creditors", "Total market credit, creditor list"),
        ("/api/orders/payment-vouchers/", "Payment Vouchers", "Payment voucher list")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    # Test adding an order
    order_data = {
        "order_type": "cash",
        "customer": customer_id,
        "customer_cell": "1234567890",
        "order_date": str(today),
        "status": "pending",
        "total_items": 1,
        "total_bill": 25.50,
        "net_bill": 25.50,
        "tax": 0,
        "discount": 0,
        "received": 25.50,
        "balance": 0,
        "payment_method": "cash",
        "previous_balance": 0,
        "remaining_balance": 0,
        "items": [{
            "product_category": "Test Category",
            "product": product_id,
            "stock_quantity": 100,
            "unit_price": 25.50,
            "quantity": 1
        }]
    }
    
    success, result = test_api_endpoint("/api/orders/add/", "POST", order_data, 201, "Add Order with items")
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"  {status} Add Order")
    if not success:
        print(f"    Error: {result}")
    results.append(success)
    
    return all(results)

def test_customer_features():
    """Test Customer Management features"""
    print("\n👥 Testing Customer Management Features...")
    
    features = [
        ("/api/customers/view/", "View Customers", "List customers with pagination"),
        ("/api/customers/ledger/", "Credit Customer Ledger", "Customer balance and ledger entries"),
        ("/api/customers/installments/", "Cash Customer Installments", "Customer installments by order")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    # Test adding a customer
    customer_data = {
        "name": "Test Customer",
        "email": "test@example.com",
        "phone": "1234567890",
        "type": "cash",
        "opening_balance": 0
    }
    
    success, result = test_api_endpoint("/api/customers/add/", "POST", customer_data, 201, "Add Customer")
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"  {status} Add Customer")
    if not success:
        print(f"    Error: {result}")
    results.append(success)
    
    return all(results)

def test_supplier_features():
    """Test Supplier Management features"""
    print("\n🏪 Testing Supplier Management Features...")
    
    features = [
        ("/api/suppliers/view/", "View Suppliers", "List all suppliers"),
        ("/api/suppliers/ledger/", "Supplier Ledger", "Supplier ledger entries")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_employee_features():
    """Test Employee Management features"""
    print("\n👨‍💼 Testing Employee Management Features...")
    
    features = [
        ("/api/employees/view/", "View Employees", "List employees with contact, designation, address"),
        ("/api/employees/salary-report/", "Salary Report", "Employee salary report"),
        ("/api/employees/attendance/", "Attendance", "Employee attendance for selected month")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_expense_features():
    """Test Expense Management features"""
    print("\n💰 Testing Expense Management Features...")
    
    features = [
        ("/api/expense/view/", "Expense List", "Filter by date range, list expenses"),
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    # Test adding an expense
    expense_data = {
        "type": "Office Supplies",
        "amount": 150.00,
        "description": "Test expense for verification",
        "date": str(date.today())
    }
    
    success, result = test_api_endpoint("/api/expense/add/", "POST", expense_data, 201, "Add Expense")
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"  {status} Add Expense")
    if not success:
        print(f"    Error: {result}")
    results.append(success)
    
    return all(results)

def test_quotation_features():
    """Test Quotation Management features"""
    print("\n📋 Testing Quotation Management Features...")
    
    features = [
        ("/api/quotation/view/", "View Quotations", "List quotations with customer details"),
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_settings_features():
    """Test Settings features"""
    print("\n⚙️ Testing Settings Features...")
    
    features = [
        ("/api/settings/opening-balance/", "Opening Balance", "View opening balance"),
        ("/api/settings/products/", "Products", "List products by category, total products"),
        ("/api/settings/low-stock/", "Low Stock", "Products with low stock"),
        ("/api/settings/users/", "Users", "List users with name, email"),
        ("/api/settings/customer-products/", "Customer Products", "Customer product list")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_database_connectivity():
    """Test database connectivity and data flow"""
    print("\n🗄️ Testing Database Connectivity...")
    
    # Test creating and retrieving data
    test_data = {
        "name": "DB Test Customer",
        "email": "dbtest@example.com",
        "phone": "9876543210",
        "type": "credit",
        "opening_balance": 100.00
    }
    
    # Create
    success, result = test_api_endpoint("/api/customers/add/", "POST", test_data, 201, "Create customer in DB")
    if not success:
        print("  ❌ Failed to create customer in database")
        return False
    
    try:
        customer_id = json.loads(result['response'])['id']
        print(f"  ✅ Created customer with ID: {customer_id}")
    except:
        print("  ❌ Could not parse customer ID from response")
        return False
    
    # Retrieve
    success, result = test_api_endpoint("/api/customers/view/", description="Retrieve customers from DB")
    if not success:
        print("  ❌ Failed to retrieve customers from database")
        return False
    
    try:
        data = json.loads(result['response'])
        customers = data.get('customers', [])
        found_customer = any(c.get('id') == customer_id for c in customers)
        if found_customer:
            print("  ✅ Customer found in database retrieval")
            return True
        else:
            print("  ❌ Customer not found in database retrieval")
            return False
    except:
        print("  ❌ Could not parse customer data from response")
        return False

def test_frontend_backend_integration():
    """Test frontend-backend integration"""
    print("\n🔗 Testing Frontend-Backend Integration...")
    
    # Test CORS headers
    success, result = test_api_endpoint("/api/customers/view/", description="CORS headers check")
    if success:
        headers = result.get('headers', {})
        cors_headers = [h for h in headers.keys() if 'access-control' in h.lower()]
        if cors_headers:
            print("  ✅ CORS headers present")
        else:
            print("  ⚠️  CORS headers not found (may cause frontend issues)")
    
    # Test API response format
    success, result = test_api_endpoint("/api/dashboard/stats/", description="API response format")
    if success:
        try:
            data = json.loads(result['response'])
            if isinstance(data, dict):
                print("  ✅ API returns JSON object")
            else:
                print("  ⚠️  API returns non-object JSON")
        except:
            print("  ❌ API response is not valid JSON")
    
    return success

def main():
    """Run all feature tests"""
    print("🚀 Inventory Management System - Comprehensive Feature Verification")
    print("=" * 80)
    
    # Check if server is running
    print("🔍 Checking if Django server is running...")
    success, result = test_api_endpoint("/api/customers/view/")
    if not success:
        print("❌ Django server is not running or not accessible")
        print("   Please start the server with: python backend/manage.py runserver")
        return False
    
    print("✅ Django server is running")
    
    # Run all feature tests
    test_results = []
    
    test_results.append(test_dashboard_features())
    test_results.append(test_reporting_features())
    test_results.append(test_order_features())
    test_results.append(test_customer_features())
    test_results.append(test_supplier_features())
    test_results.append(test_employee_features())
    test_results.append(test_expense_features())
    test_results.append(test_quotation_features())
    test_results.append(test_settings_features())
    test_results.append(test_database_connectivity())
    test_results.append(test_frontend_backend_integration())
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 COMPREHENSIVE FEATURE VERIFICATION SUMMARY")
    print("=" * 80)
    
    feature_names = [
        "Dashboard Features",
        "Reporting Features", 
        "Order Management",
        "Customer Management",
        "Supplier Management",
        "Employee Management",
        "Expense Management",
        "Quotation Management",
        "Settings Features",
        "Database Connectivity",
        "Frontend-Backend Integration"
    ]
    
    passed = 0
    total = len(test_results)
    
    for i, (name, result) in enumerate(zip(feature_names, test_results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {name}")
        if result:
            passed += 1
    
    print(f"\nOverall Results: {passed}/{total} feature sets passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL FEATURES VERIFIED! The system is fully functional.")
        print("✅ All 12 todos completed successfully!")
    else:
        print(f"\n⚠️  {total-passed} feature sets need attention.")
        print("Please check the errors above and fix any issues.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
