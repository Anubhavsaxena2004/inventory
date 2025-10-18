const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run(){
  const base = 'http://127.0.0.1:8000'
  console.log('Creating customer...')
  let res = await fetch(base + '/api/customers/add/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'E2E JS Customer', phone: '5550001111', email: 'e2ejs@example.com', type: 'cash' }) })
  let data = await res.text()
  console.log('Create customer status', res.status)
  try{ console.log(JSON.parse(data)) } catch(e){ console.log(data) }

  console.log('Listing customers...')
  res = await fetch(base + '/api/customers/view/')
  data = await res.json()
  console.log('Customers count', (data.customers||[]).length)
  const cust = (data.customers||[]).find(c=> c.name && c.name.includes('E2E JS')) || (data.customers||[])[0]
  console.log('Using customer:', cust && cust.id)

  console.log('Fetching products...')
  res = await fetch(base + '/api/settings/products/')
  data = await res.json()
  const prod = (data.products||[])[0]
  console.log('Using product:', prod && prod.id)

  if(!cust || !prod){
    console.log('Missing customer or product; aborting order create')
    return
  }

  console.log('Creating order...')
  const orderPayload = {
    customer: cust.id,
    order_type: 'cash',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    total_items: 1,
    total_bill: 10,
    net_bill: 10,
    tax: 0,
    discount: 0,
    received: 0,
    balance: 10,
    payment_method: 'cash',
    previous_balance: 0,
    remaining_balance: 10,
    items: [ { product: prod.id, product_category: prod.category||'', unit_price: prod.unit_price||10, quantity: 1 } ]
  }
  res = await fetch(base + '/api/orders/add/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(orderPayload) })
  data = await res.text()
  console.log('Create order status', res.status)
  try{ console.log(JSON.parse(data)) } catch(e){ console.log(data) }

  console.log('Listing orders...')
  res = await fetch(base + '/api/orders/view/')
  data = await res.json()
  console.log('Orders count', (data.orders||[]).length)

  console.log('Fetching suppliers...')
  res = await fetch(base + '/api/suppliers/view/')
  data = await res.json()
  console.log('Suppliers count', (data.suppliers||[]).length)

  console.log('Generating monthly reporting summary...')
  const params = new URLSearchParams({ type:'summary', from: '2025-01-01', to: '2025-12-31' })
  res = await fetch(base + '/api/reporting/monthly/?'+params.toString())
  data = await res.json()
  console.log('Reporting:', data.report ? 'ok' : JSON.stringify(data).slice(0,200))
}

run().catch(e=>{ console.error('E2E error', e); process.exit(1) })
