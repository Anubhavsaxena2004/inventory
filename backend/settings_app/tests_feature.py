from django.test import TestCase
from django.urls import reverse
from .models import Product, OpeningBalance
from datetime import date, timedelta
from inventory_project.auth_utils import generate_jwt
from django.conf import settings
from customers.models import Customer
from .models import CustomerProduct
import json


class SettingsFeatureTests(TestCase):
    def setUp(self):
        # Create products
        Product.objects.create(name="Widget A", category="Gadgets", quantity=5, min_quantity=10, unit_price=10)
        Product.objects.create(name="Widget B", category="Gadgets", quantity=20, min_quantity=5, unit_price=15)

        # Create opening balances (older and newer)
        OpeningBalance.objects.create(date=date.today() - timedelta(days=10), amount=100.00, description="Initial")
        OpeningBalance.objects.create(date=date.today(), amount=250.50, description="Adjustment")

    def test_low_stock_endpoint(self):
        url = reverse('low-stock')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('low_stock', data)
        # Only Widget A is low (quantity 5 <= min_quantity 10)
        names = [p['name'] for p in data['low_stock']]
        self.assertIn('Widget A', names)
        self.assertNotIn('Widget B', names)

    def test_customer_products_endpoint(self):
        url = reverse('customer-products')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('customer_products', data)
        self.assertGreaterEqual(len(data['customer_products']), 2)

    def test_opening_balance_endpoint(self):
        url = reverse('opening-balance')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Should include 'balance' (latest) and 'history'
        self.assertIn('balance', data)
        self.assertIn('history', data)
        self.assertIsNotNone(data['balance'])
        # Latest amount should match the most recent OpeningBalance
        self.assertAlmostEqual(float(data['balance']['amount']), 250.50, places=2)

    def test_opening_balance_admin_crud_and_permissions(self):
        url = reverse('opening-balance')
        # Run with DEBUG=False to simulate production where admin checks are enforced
        with self.settings(DEBUG=False):
            # Without auth, POST should be forbidden
            resp = self.client.post(url, data={'date': str(date.today()), 'amount': '10.00', 'description': 'test'})
            self.assertEqual(resp.status_code, 403)

            # With auth token, should succeed
            token = generate_jwt({'sub': 'testadmin', 'is_admin': True})
            resp = self.client.post(url, data=json.dumps({'date': str(date.today()), 'amount': '99.99', 'description': 'admin create'}), content_type='application/json', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
            self.assertEqual(resp.status_code, 201)
            created = resp.json()
            created_id = created.get('id')
            self.assertIsNotNone(created_id)

            # Update (PUT) the created opening balance
            resp = self.client.put(url, data=json.dumps({'id': created_id, 'amount': '123.45'}), content_type='application/json', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
            self.assertEqual(resp.status_code, 200)
            updated = resp.json()
            self.assertAlmostEqual(float(updated.get('amount')), 123.45, places=2)

            # Delete it
            resp = self.client.delete(url, data=json.dumps({'id': created_id}), content_type='application/json', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
            self.assertEqual(resp.status_code, 200)

    def test_customer_product_assignments(self):
        # Create a customer
        cust = Customer.objects.create(name='ACustomer', email='a@a.com')
        prod = Product.objects.first()
        url = reverse('customer-products')

        # Assign without auth should be forbidden when DEBUG=False
        with self.settings(DEBUG=False):
            resp = self.client.post(url, data=json.dumps({'customer_id': cust.id, 'product_id': prod.id}), content_type='application/json')
            self.assertEqual(resp.status_code, 403)

        # Assign with auth
        token = generate_jwt({'sub': 'testadmin2', 'is_admin': True})
        resp = self.client.post(url, data=json.dumps({'customer_id': cust.id, 'product_id': prod.id}), content_type='application/json', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
        if resp.status_code != 201:
            print('DEBUG: assign response', resp.status_code, resp.content)
        self.assertEqual(resp.status_code, 201)
        assigned = resp.json()
        self.assertIn('id', assigned)

        # Retrieve by customer
        resp = self.client.get(f"{url}?customer_id={cust.id}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        names = [p['name'] for p in data.get('customer_products', [])]
        self.assertIn(prod.name, names)

        # Unassign with auth
        cp_id = assigned.get('id')
        resp = self.client.delete(url, data=json.dumps({'id': cp_id}), content_type='application/json', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
        self.assertEqual(resp.status_code, 200)
