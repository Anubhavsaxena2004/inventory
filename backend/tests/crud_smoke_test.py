import os
import sys
import django
import json
from django.conf import settings

# Ensure backend directory is on sys.path so we can import the project settings
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE not in sys.path:
    sys.path.insert(0, BASE)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_project.settings')
django.setup()

from django.test import Client


def pretty(resp):
    try:
        return json.dumps(resp.json(), indent=2)
    except Exception:
        return resp.content.decode('utf-8', errors='ignore')


def run():
    client = Client()
    print('Testing customers CRUD endpoints...')

    # 1) Create a customer
    cus_data = {
        'name': 'Smoke Test Customer',
        'type': 'retail',
        'phone': '9999999999',
        'email': 'smoke@test.local',
        'opening_balance': 0,
    }
    resp = client.post('/api/customers/add/', cus_data, content_type='application/json')
    print('POST /api/customers/add/ =>', resp.status_code)
    print(pretty(resp))
    if resp.status_code != 201:
        print('Create failed — aborting further CRUD checks')
        return
    created = resp.json()
    cid = created.get('id') or created.get('pk') or created.get('ID')
    print('Created customer id:', cid)

    # 2) Read (list)
    resp = client.get('/api/customers/view/?page=1&page_size=10')
    print('GET /api/customers/view/ =>', resp.status_code)
    print(pretty(resp))

    # 3) Update (PUT)
    update_data = {'id': cid, 'name': 'Smoke Test Customer Updated'}
    resp = client.put('/api/customers/add/', json.dumps(update_data), content_type='application/json')
    print('PUT /api/customers/add/ =>', resp.status_code)
    print(pretty(resp))

    # 4) Delete
    resp = client.delete(f'/api/customers/add/?id={cid}')
    print('DELETE /api/customers/add/?id= =>', resp.status_code)
    print(pretty(resp))


if __name__ == '__main__':
    run()
