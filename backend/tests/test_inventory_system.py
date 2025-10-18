#!/usr/bin/env python3
"""
Comprehensive test script for the Inventory Management System
Tests all major functionality including add customer, view customers, etc.
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_api_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test a single API endpoint"""
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
            'headers': dict(response.headers)
        }
    
    except requests.exceptions.ConnectionError:
        return False, "Connection error - Django server not running"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_add_customer():
    """Test adding a customer"""
    print("🧪 Testing Add Customer...")
    
    test_cases = [
        {
            'name': 'Valid Customer',
            'data': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'type': 'cash',
                'opening_balance': 0
            },
            'expected_status': 201
        },
        {
            'name': 'Customer without phone',
            'data': {
                'name': 'Jane Doe',
                'email': 'jane@example.com',
                'type': 'credit',
                'opening_balance': 100.50
            },
            'expected_status': 201
        },
        {
            'name': 'Customer without email',
            'data': {
                'name': 'Bob Smith',
                'phone': '9876543210',
                'type': 'cash',
                'opening_balance': 0
            },
            'expected_status': 201
        },
        {
            'name': 'Invalid Customer (no name)',
            'data': {
                'email': 'invalid@example.com',
                'phone': '1234567890',
                'type': 'cash'
            },
            'expected_status': 400
        }
    ]
    
    results = []
    for test_case in test_cases:
        success, result = test_api_endpoint(
            '/api/customers/add/', 
            'POST', 
            test_case['data'], 
            test_case['expected_status']
        )
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {test_case['name']}")
        
        if not success:
            print(f"    Error: {result}")
        elif test_case['expected_status'] == 201:
            try:
                response_data = json.loads(result['response'])
                if 'id' in response_data:
                    print(f"    Created customer ID: {response_data['id']}")
            except:
                pass
        
        results.append(success)
    
    return all(results)

def test_view_customers():
    """Test viewing customers"""
    print("\n🧪 Testing View Customers...")
    
    success, result = test_api_endpoint('/api/customers/view/')
    
    if success:
        try:
            response_data = json.loads(result['response'])
            customers = response_data.get('customers', [])
            print(f"  ✅ Retrieved {len(customers)} customers")
            
            if customers:
                print("  📋 Sample customer data:")
                for i, customer in enumerate(customers[:3]):  # Show first 3
                    print(f"    {i+1}. {customer.get('name', 'N/A')} ({customer.get('type', 'N/A')})")
        except Exception as e:
            print(f"  ⚠️  Response parsing error: {e}")
    else:
        print(f"  ❌ Failed: {result}")
    
    return success

def test_other_endpoints():
    """Test other API endpoints"""
    print("\n🧪 Testing Other Endpoints...")
    
    endpoints = [
        ('/api/dashboard/', 'Dashboard'),
        ('/api/orders/view/', 'Orders'),
        ('/api/suppliers/view/', 'Suppliers'),
        ('/api/expense/view/', 'Expenses'),
    ]
    
    results = []
    for endpoint, name in endpoints:
        success, result = test_api_endpoint(endpoint)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {name}")
        if not success and "Connection error" not in str(result):
            print(f"    Error: {result}")
        results.append(success)
    
    return results

def test_database_operations():
    """Test database operations"""
    print("\n🧪 Testing Database Operations...")
    
    # Test adding a customer and then retrieving it
    customer_data = {
        'name': f'Test Customer {datetime.now().strftime("%H%M%S")}',
        'email': f'test{datetime.now().strftime("%H%M%S")}@example.com',
        'phone': '5555555555',
        'type': 'cash',
        'opening_balance': 50.00
    }
    
    # Add customer
    success, result = test_api_endpoint('/api/customers/add/', 'POST', customer_data, 201)
    if not success:
        print(f"  ❌ Failed to add test customer: {result}")
        return False
    
    try:
        response_data = json.loads(result['response'])
        customer_id = response_data.get('id')
        print(f"  ✅ Added test customer with ID: {customer_id}")
        
        # Verify customer appears in list
        success, result = test_api_endpoint('/api/customers/view/')
        if success:
            response_data = json.loads(result['response'])
            customers = response_data.get('customers', [])
            found_customer = any(c.get('id') == customer_id for c in customers)
            if found_customer:
                print(f"  ✅ Customer {customer_id} found in customer list")
                return True
            else:
                print(f"  ❌ Customer {customer_id} not found in customer list")
                return False
        else:
            print(f"  ❌ Failed to retrieve customer list: {result}")
            return False
    
    except Exception as e:
        print(f"  ❌ Error processing test customer: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Inventory Management System Tests")
    print("=" * 50)
    
    # Check if server is running
    print("🔍 Checking if Django server is running...")
    success, result = test_api_endpoint('/api/customers/view/')
    if not success:
        print("❌ Django server is not running or not accessible")
        print("   Please start the server with: python backend/manage.py runserver")
        return False
    
    print("✅ Django server is running")
    
    # Run tests
    test_results = []
    
    # Test add customer functionality
    test_results.append(test_add_customer())
    
    # Test view customers
    test_results.append(test_view_customers())
    
    # Test other endpoints
    other_results = test_other_endpoints()
    test_results.extend(other_results)
    
    # Test database operations
    test_results.append(test_database_operations())
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(test_results)
    total = len(test_results)
    
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed! The system is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
