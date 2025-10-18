#!/usr/bin/env python3
"""
Frontend-Backend Connectivity Test Script
Tests the connection between React frontend (localhost:5173) and Django backend (localhost:8000)
"""

import requests
import json
import time
from datetime import datetime

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://127.0.0.1:8000"

def test_server_availability(url, name):
    """Test if a server is running"""
    try:
        response = requests.get(url, timeout=5)
        return True, f"{name} is running (Status: {response.status_code})"
    except requests.exceptions.ConnectionError:
        return False, f"{name} is not running or not accessible"
    except requests.exceptions.Timeout:
        return False, f"{name} timeout - server may be slow"
    except Exception as e:
        return False, f"{name} error: {str(e)}"

def test_cors_headers():
    """Test CORS configuration"""
    print("\n🔗 Testing CORS Configuration...")
    
    try:
        # Test preflight request
        headers = {
            'Origin': FRONTEND_URL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{BACKEND_URL}/api/customers/add/", headers=headers)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print(f"  CORS Headers: {cors_headers}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("  ✅ CORS properly configured")
            return True
        else:
            print("  ❌ CORS not properly configured")
            return False
            
    except Exception as e:
        print(f"  ❌ CORS test failed: {e}")
        return False

def test_api_from_frontend_perspective():
    """Test API endpoints as if called from frontend"""
    print("\n🌐 Testing API Endpoints from Frontend Perspective...")
    
    # Test with frontend origin header
    headers = {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
    }
    
    endpoints = [
        ("/api/customers/view/", "GET", None, "View Customers"),
        ("/api/dashboard/stats/", "GET", None, "Dashboard Stats"),
        ("/api/settings/products/", "GET", None, "Products List"),
        ("/api/orders/view/", "GET", None, "Orders List"),
    ]
    
    results = []
    for endpoint, method, data, name in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers)
            elif method == "POST":
                response = requests.post(f"{BACKEND_URL}{endpoint}", json=data, headers=headers)
            
            success = response.status_code in [200, 201]
            status = "PASS" if success else "FAIL"
            print(f"  {status} {name} (Status: {response.status_code})")
            
            if success:
                try:
                    json_data = response.json()
                    print(f"    Response contains {len(json_data)} items" if isinstance(json_data, dict) else f"    Response received")
                except:
                    print(f"    Response received (non-JSON)")
            
            results.append(success)
            
        except Exception as e:
            print(f"  FAIL {name} - Error: {e}")
            results.append(False)
    
    return all(results)

def test_frontend_backend_integration():
    """Test complete frontend-backend integration"""
    print("\n🔄 Testing Complete Frontend-Backend Integration...")
    
    # Test adding a customer (simulating frontend form submission)
    customer_data = {
        "name": f"Frontend Test Customer {datetime.now().strftime('%H%M%S')}",
        "email": f"frontend-test-{datetime.now().strftime('%H%M%S')}@example.com",
        "phone": "5555555555",
        "type": "cash",
        "opening_balance": 0
    }
    
    headers = {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
    }
    
    try:
        # Add customer
        response = requests.post(f"{BACKEND_URL}/api/customers/add/", json=customer_data, headers=headers)
        
        if response.status_code == 201:
            print("  ✅ Customer added successfully from frontend")
            customer_id = response.json().get('id')
            
            # Verify customer appears in list
            list_response = requests.get(f"{BACKEND_URL}/api/customers/view/", headers=headers)
            
            if list_response.status_code == 200:
                customers = list_response.json().get('customers', [])
                found_customer = any(c.get('id') == customer_id for c in customers)
                
                if found_customer:
                    print("  ✅ Customer found in customer list")
                    print("  ✅ Frontend-Backend integration working correctly")
                    return True
                else:
                    print("  ❌ Customer not found in customer list")
                    return False
            else:
                print("  ❌ Failed to retrieve customer list")
                return False
        else:
            print(f"  ❌ Failed to add customer (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"  ❌ Integration test failed: {e}")
        return False

def test_frontend_components():
    """Test if frontend components can load backend data"""
    print("\n⚛️ Testing Frontend Component Data Loading...")
    
    # Test dashboard data loading
    try:
        response = requests.get(f"{BACKEND_URL}/api/dashboard/stats/")
        if response.status_code == 200:
            data = response.json()
            print("  ✅ Dashboard data available:")
            print(f"    - Pending Orders: {data.get('total_pending_orders', 0)}")
            print(f"    - Completed Orders: {data.get('completed_orders', 0)}")
            print(f"    - Working Orders: {data.get('working_orders', 0)}")
            print("  ✅ Frontend can load dashboard data")
        else:
            print("  ❌ Dashboard data not available")
            return False
    except Exception as e:
        print(f"  ❌ Dashboard data test failed: {e}")
        return False
    
    # Test customer data loading
    try:
        response = requests.get(f"{BACKEND_URL}/api/customers/view/")
        if response.status_code == 200:
            data = response.json()
            customers = data.get('customers', [])
            print(f"  ✅ Customer data available: {len(customers)} customers")
            print("  ✅ Frontend can load customer data")
        else:
            print("  ❌ Customer data not available")
            return False
    except Exception as e:
        print(f"  ❌ Customer data test failed: {e}")
        return False
    
    return True

def main():
    """Run all frontend-backend connectivity tests"""
    print("🚀 Frontend-Backend Connectivity Test")
    print("=" * 60)
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    # Test server availability
    print("\n🔍 Testing Server Availability...")
    
    frontend_available, frontend_msg = test_server_availability(FRONTEND_URL, "Frontend")
    backend_available, backend_msg = test_server_availability(BACKEND_URL, "Backend")
    
    print(f"  {frontend_msg}")
    print(f"  {backend_msg}")
    
    if not backend_available:
        print("\n❌ Backend server is not running!")
        print("   Please start the Django server with: python backend/manage.py runserver")
        return False
    
    if not frontend_available:
        print("\n⚠️ Frontend server is not running!")
        print("   Please start the frontend server with: cd frontend && npm run dev")
        print("   Continuing with backend-only tests...")
    
    # Run connectivity tests
    test_results = []
    
    # Test CORS
    test_results.append(test_cors_headers())
    
    # Test API endpoints
    test_results.append(test_api_from_frontend_perspective())
    
    # Test integration
    test_results.append(test_frontend_backend_integration())
    
    # Test frontend components
    test_results.append(test_frontend_components())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FRONTEND-BACKEND CONNECTIVITY SUMMARY")
    print("=" * 60)
    
    test_names = [
        "CORS Configuration",
        "API Endpoints from Frontend",
        "Frontend-Backend Integration",
        "Frontend Component Data Loading"
    ]
    
    passed = 0
    total = len(test_results)
    
    for i, (name, result) in enumerate(zip(test_names, test_results)):
        status = "PASS" if result else "FAIL"
        print(f"{status} {name}")
        if result:
            passed += 1
    
    print(f"\nOverall Results: {passed}/{total} tests passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 FRONTEND-BACKEND CONNECTIVITY VERIFIED!")
        print("✅ All connectivity tests passed!")
        print("✅ Frontend (localhost:5173) can successfully communicate with Backend (localhost:8000)")
        print("✅ The system is ready for full-stack development!")
    else:
        print(f"\n⚠️ {total-passed} connectivity tests failed.")
        print("Please check the errors above and ensure both servers are running.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
