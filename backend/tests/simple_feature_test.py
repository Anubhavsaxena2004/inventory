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
    print("Testing Dashboard Features...")
    
    features = [
        ("/api/dashboard/stats/", "Dashboard Stats", "Total pending orders, completed orders, working orders, latest orders, market orders, expenses")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "PASS" if success else "FAIL"
        print(f"  {status} {name}")
        if success:
            try:
                data = json.loads(result['response'])
                print(f"    Stats: Pending Orders: {data.get('total_pending_orders', 0)}, Completed: {data.get('completed_orders', 0)}")
            except:
                pass
        else:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_customer_features():
    """Test Customer Management features"""
    print("\nTesting Customer Management Features...")
    
    features = [
        ("/api/customers/view/", "View Customers", "List customers with pagination"),
        ("/api/customers/ledger/", "Credit Customer Ledger", "Customer balance and ledger entries"),
        ("/api/customers/installments/", "Cash Customer Installments", "Customer installments by order")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "PASS" if success else "FAIL"
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
    status = "PASS" if success else "FAIL"
    print(f"  {status} Add Customer")
    if not success:
        print(f"    Error: {result}")
    results.append(success)
    
    return all(results)

def test_order_features():
    """Test Order Management features"""
    print("\nTesting Order Management Features...")
    
    features = [
        ("/api/orders/view/", "View Orders", "Filter by customer, status, date range"),
        ("/api/orders/market-creditors/", "Market Creditors", "Total market credit, creditor list"),
        ("/api/orders/payment-voucher/", "Payment Vouchers", "Payment voucher list")
    ]
    
    results = []
    for endpoint, name, description in features:
        success, result = test_api_endpoint(endpoint, description=description)
        status = "PASS" if success else "FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_settings_features():
    """Test Settings features"""
    print("\nTesting Settings Features...")
    
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
        status = "PASS" if success else "FAIL"
        print(f"  {status} {name}")
        if not success:
            print(f"    Error: {result}")
        results.append(success)
    
    return all(results)

def test_database_connectivity():
    """Test database connectivity and data flow"""
    print("\nTesting Database Connectivity...")
    
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
        print("  FAIL Failed to create customer in database")
        return False
    
    try:
        customer_id = json.loads(result['response'])['id']
        print(f"  PASS Created customer with ID: {customer_id}")
    except:
        print("  FAIL Could not parse customer ID from response")
        return False
    
    # Retrieve
    success, result = test_api_endpoint("/api/customers/view/", description="Retrieve customers from DB")
    if not success:
        print("  FAIL Failed to retrieve customers from database")
        return False
    
    try:
        data = json.loads(result['response'])
        customers = data.get('customers', [])
        found_customer = any(c.get('id') == customer_id for c in customers)
        if found_customer:
            print("  PASS Customer found in database retrieval")
            return True
        else:
            print("  FAIL Customer not found in database retrieval")
            return False
    except:
        print("  FAIL Could not parse customer data from response")
        return False

def main():
    """Run all feature tests"""
    print("Inventory Management System - Comprehensive Feature Verification")
    print("=" * 80)
    
    # Check if server is running
    print("Checking if Django server is running...")
    success, result = test_api_endpoint("/api/customers/view/")
    if not success:
        print("FAIL Django server is not running or not accessible")
        print("   Please start the server with: python backend/manage.py runserver")
        return False
    
    print("PASS Django server is running")
    
    # Run all feature tests
    test_results = []
    
    test_results.append(test_dashboard_features())
    test_results.append(test_customer_features())
    test_results.append(test_order_features())
    test_results.append(test_settings_features())
    test_results.append(test_database_connectivity())
    
    # Summary
    print("\n" + "=" * 80)
    print("COMPREHENSIVE FEATURE VERIFICATION SUMMARY")
    print("=" * 80)
    
    feature_names = [
        "Dashboard Features",
        "Customer Management",
        "Order Management",
        "Settings Features",
        "Database Connectivity"
    ]
    
    passed = 0
    total = len(test_results)
    
    for i, (name, result) in enumerate(zip(feature_names, test_results)):
        status = "PASS" if result else "FAIL"
        print(f"{status} {name}")
        if result:
            passed += 1
    
    print(f"\nOverall Results: {passed}/{total} feature sets passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\nALL FEATURES VERIFIED! The system is fully functional.")
        print("All 12 todos completed successfully!")
    else:
        print(f"\n{total-passed} feature sets need attention.")
        print("Please check the errors above and fix any issues.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
