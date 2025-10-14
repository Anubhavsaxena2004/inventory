import React, {useState, useEffect, useMemo} from 'react'
import Modal from './Modal'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function AddOrder({customers: customersProp=[]}){
  const [form,setForm] = useState({
    customer:'',
    order_type:'cash',
    customer_cell:'',
    order_date:'',
    status:'pending',
    total_items:0,
    total_bill:0,
    net_bill:0,
    tax:0,
    discount:0,
    received:0,
    balance:0,
    payment_method:'cash',
    previous_balance:0,
    remaining_balance:0,
    items:[]
  })
  const [products,setProducts] = useState([])
  const [msg,setMsg] = useState('')
  const [errors,setErrors] = useState({})
  const [showSuccess,setShowSuccess] = useState(false)

  useEffect(()=>{
    fetch('/api/settings/products/').then(r=>r.json()).then(d=>setProducts(d.products || []))
  },[])

  function addItem(){ setForm(f=>({...f,items:[...f.items,{product:'',product_category:'',unit_price:0,quantity:1,line_total:0}]})) }

  function updateItem(idx,changes){
    const items = [...form.items]
    items[idx] = {...items[idx], ...changes}
    // recalc line total
    items[idx].line_total = (Number(items[idx].unit_price||0) * Number(items[idx].quantity||0)).toFixed(2)
    const total = items.reduce((s,it)=> s + Number(it.line_total||0),0)
    const net = Math.max(0, total + Number(form.tax||0) - Number(form.discount||0))
    const balance = Math.max(0, net - Number(form.received||0))
    setForm({...form, items, total_items: items.length, total_bill: total.toFixed(2), net_bill: net.toFixed(2), balance: balance.toFixed(2), remaining_balance: (Number(form.previous_balance||0)+balance).toFixed(2)})
  }

  function removeItem(idx){ const items = [...form.items]; items.splice(idx,1); const total = items.reduce((s,it)=> s + Number(it.line_total||0),0); setForm({...form,items,total_bill:total.toFixed(2)}) }

  function submit(e){
    e.preventDefault()
    const eObj = {}
    if(!form.customer) eObj.customer = 'Select a customer'
    if(form.items.length===0) eObj.items = 'Add at least one item'
    if(form.items.some(it=>!it.product)) eObj.product = 'Each item must have a product'
    if(Object.keys(eObj).length){ setErrors(eObj); setMsg(''); return }

    // send minimal payload matching backend expectation
    const payload = {...form, items: form.items.map(it=>({ product: it.product, product_category: it.product_category, stock_quantity: it.stock_quantity||0, unit_price: it.unit_price, quantity: it.quantity }))}

    fetchWithAuth('/api/orders/add/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(async r=>{
        const d = await r.json()
        if(r.ok){ setMsg('Order added: '+ (d.id||'')); setErrors({}); setForm({...form, items:[], total_items:0, total_bill:0, net_bill:0, tax:0, discount:0, received:0, balance:0, remaining_balance:0}) }
        else { setMsg(''); setErrors(typeof d==='object'? d : {form:String(d)}) }
      }).catch(err=>setMsg(String(err)))
  }

  return (
    <div className="card form-card">
      <h3>Add Order</h3>
      <form onSubmit={submit} className="order-form">
        <div className="form-row">
          <label>Customer</label>
          <select value={form.customer} onChange={e=>{ setForm({...form,customer:e.target.value}); setErrors(p=>({...p,customer:''})) }}>
            <option value="">Select</option>
            {customersProp.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="error">{errors.customer}</div>
          <label>Customer Cell</label>
          <input value={form.customer_cell} onChange={e=>setForm({...form,customer_cell:e.target.value})} />
          <label>Order Date</label>
          <input type="date" value={form.order_date} onChange={e=>setForm({...form,order_date:e.target.value})} />
        </div>

        <div className="form-row">
          <label>Order Type</label>
          <select value={form.order_type} onChange={e=>setForm({...form,order_type:e.target.value})}><option value="cash">Cash</option><option value="credit">Credit</option></select>
          <label>Status</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="pending">Pending</option><option value="working">Working</option><option value="completed">Completed</option></select>
          <label>Payment Method</label>
          <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option value="cash">Cash</option><option value="bank">Bank</option><option value="cheque">Cheque</option></select>
        </div>

        <div className="items-header"><strong>Items</strong> <button type="button" className="btn" onClick={addItem}>+ Add Item</button></div>
        <div className="error">{errors.items}</div>
        <div className="items-list">
          {form.items.map((it,idx)=> (
            <div className="item-row" key={idx}>
              <ProductAutocomplete
                products={products}
                value={it.product}
                onSelect={(prod)=>{
                  updateItem(idx,{ product: String(prod?.id||''), unit_price: prod? prod.unit_price : 0, product_category: prod? prod.category:'' })
                  setErrors(p=>({...p,product:''}))
                }}
              />
              <div className="error">{errors.product}</div>
              <input type="number" min="0" placeholder="Stock Qty" value={it.stock_quantity||0} onChange={e=>updateItem(idx,{ stock_quantity: Number(e.target.value) })} />
              <input type="number" min="1" value={it.quantity} onChange={e=>updateItem(idx,{ quantity: Number(e.target.value) })} />
              <input type="number" value={it.unit_price} onChange={e=>updateItem(idx,{ unit_price: Number(e.target.value) })} />
              <div className="line-total">{it.line_total||'0.00'}</div>
              <button type="button" className="btn small" onClick={()=>removeItem(idx)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="form-row total-row">
          <div className="totals">
            <div>Total Items: {form.total_items}</div>
            <div>Tax: <input type="number" value={form.tax} onChange={e=>{ const tax=Number(e.target.value||0); const net=Math.max(0, Number(form.total_bill||0)+tax-Number(form.discount||0)); const balance=Math.max(0, net-Number(form.received||0)); setForm({...form,tax, net_bill: net.toFixed(2), balance: balance.toFixed(2), remaining_balance: (Number(form.previous_balance||0)+balance).toFixed(2)}) }} /></div>
            <div>Discount: <input type="number" value={form.discount} onChange={e=>{ const discount=Number(e.target.value||0); const net=Math.max(0, Number(form.total_bill||0)+Number(form.tax||0)-discount); const balance=Math.max(0, net-Number(form.received||0)); setForm({...form,discount, net_bill: net.toFixed(2), balance: balance.toFixed(2), remaining_balance: (Number(form.previous_balance||0)+balance).toFixed(2)}) }} /></div>
            <div>Received: <input type="number" value={form.received} onChange={e=>{ const received=Number(e.target.value||0); const balance=Math.max(0, Number(form.net_bill||0)-received); setForm({...form,received, balance: balance.toFixed(2), remaining_balance: (Number(form.previous_balance||0)+balance).toFixed(2)}) }} /></div>
            <div>Previous Balance: <input type="number" value={form.previous_balance} onChange={e=>{ const prev=Number(e.target.value||0); setForm({...form,previous_balance: prev, remaining_balance: (prev+Number(form.balance||0)).toFixed(2)}) }} /></div>
          </div>
          <div className="grand">Total: <strong>{form.total_bill}</strong> Net: <strong>{form.net_bill}</strong> Balance: <strong>{form.balance}</strong> Remaining: <strong>{form.remaining_balance}</strong></div>
        </div>

        <div className="form-row"><button type="submit" className="btn primary">Submit Order</button></div>
      </form>
      <div className="msg">{msg}</div>
    </div>
  )
}

function ProductAutocomplete({products, value, onSelect}){
  const [query,setQuery] = useState('')
  const [open,setOpen] = useState(false)
  const selected = useMemo(()=> products.find(p=> String(p.id)===String(value)), [products, value])
  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(!q) return products.slice(0,20)
    return products.filter(p=> (p.name||'').toLowerCase().includes(q) || String(p.id).includes(q)).slice(0,20)
  },[products, query])

  useEffect(()=>{ if(selected){ setQuery(selected.name) } },[selected])

  return (
    <div className="autocomplete">
      <input
        value={query}
        onChange={e=>{ setQuery(e.target.value); setOpen(true) }}
        onFocus={()=>setOpen(true)}
        placeholder="Search product name..."
      />
      {open && (
        <div className="autocomplete-list">
          {filtered.map(p=> (
            <div key={p.id} className="autocomplete-item" onMouseDown={()=>{ onSelect(p); setOpen(false) }}>
              <div className="autocomplete-name">{p.name}</div>
              <div className="autocomplete-meta">{p.category} · {p.unit_price}</div>
            </div>
          ))}
          {filtered.length===0 && <div className="autocomplete-empty">No products</div>}
        </div>
      )}
    </div>
  )
}
