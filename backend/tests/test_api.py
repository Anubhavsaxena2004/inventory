import requests
import json

# Test the add customer API endpoint
def test_add_customer():
    url = "http://127.0.0.1:8000/api/customers/add/"
    
    # Test data
    customer_data = {
        "name": "Test Customer",
        "email": "test@example.com",
        "phone": "1234567890",
        "type": "cash",
        "opening_balance": 0
    }
    
    try:
        print("Testing add customer API...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(customer_data, indent=2)}")
        
        response = requests.post(url, json=customer_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 201:
            print("✅ Customer added successfully!")
            return True
        else:
            print("❌ Failed to add customer")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Django server might not be running")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_view_customers():
    url = "http://127.0.0.1:8000/api/customers/view/"
    
    try:
        print("\nTesting view customers API...")
        response = requests.get(url)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Customers retrieved successfully!")
            return True
        else:
            print("❌ Failed to retrieve customers")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=== Inventory Management API Test ===")
    
    # Test add customer
    add_success = test_add_customer()
    
    # Test view customers
    view_success = test_view_customers()
    
    print(f"\n=== Test Results ===")
    print(f"Add Customer: {'✅ PASS' if add_success else '❌ FAIL'}")
    print(f"View Customers: {'✅ PASS' if view_success else '❌ FAIL'}")
