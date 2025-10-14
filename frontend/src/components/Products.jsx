import React, {useEffect, useMemo, useState} from 'react'
import Modal from './Modal'

export default function Products(){
  const [products,setProducts] = useState([])
  const [q,setQ] = useState('')
  const [msg,setMsg] = useState('')
  const [form,setForm] = useState({id:null,name:'',category:'',unit_price:'',quantity:'',min_quantity:''})
  const [errors,setErrors] = useState({})
  const [confirming,setConfirming] = useState(false)

  useEffect(()=>{
    fetch('/api/settings/products/').then(r=>r.json()).then(d=>setProducts(d.products||[])).catch(e=>setMsg(String(e)))
  },[])

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase()
    if(!s) return products
    return products.filter(p=> (p.name||'').toLowerCase().includes(s) || (p.category||'').toLowerCase().includes(s))
  },[q, products])

  return (
    <div className="card">
      <h3>Products</h3>
      <div className="form-row"><input placeholder="Search name or category" value={q} onChange={e=>setQ(e.target.value)} /></div>

      <form onSubmit={e=>{ e.preventDefault(); const eObj={}; if(!form.name) eObj.name='Name is required'; if(!form.category) eObj.category='Category is required'; setErrors(eObj); if(Object.keys(eObj).length) return; setConfirming(true) }}>
        <div className="form-row">
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
          <input type="number" placeholder="Unit Price" value={form.unit_price} onChange={e=>setForm({...form,unit_price:e.target.value})} />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} />
          <input type="number" placeholder="Min Qty" value={form.min_quantity} onChange={e=>setForm({...form,min_quantity:e.target.value})} />
          <button className="btn primary" type="submit">{form.id? 'Update':'Add'} Product</button>
        </div>
        <div className="error">{errors.name || errors.category}</div>
      </form>
      <div className="msg">{msg}</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Unit Price</th><th>Quantity</th><th>Min Qty</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p=> (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.unit_price}</td>
                <td>{p.quantity}</td>
                <td>{p.min_quantity}</td>
                <td>
                  <button className="btn small" onClick={()=>setForm({id:p.id,name:p.name,category:p.category,unit_price:p.unit_price,quantity:p.quantity,min_quantity:p.min_quantity})}>Edit</button>
                  <button className="btn small" onClick={async ()=>{ await fetch('/api/settings/products/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id:p.id}) }); const r = await fetch('/api/settings/products/'); const d = await r.json(); setProducts(d.products||[]) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirming && (
        <Modal title={form.id? 'Confirm Update Product':'Confirm Add Product'} onClose={()=>setConfirming(false)} onConfirm={async ()=>{
          setConfirming(false)
          const method = form.id? 'PUT':'POST'
          const r = await fetch('/api/settings/products/',{ method, headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({ id: form.id||undefined, name: form.name, category: form.category, unit_price: Number(form.unit_price||0), quantity: Number(form.quantity||0), min_quantity: Number(form.min_quantity||0) }) })
          const d = await r.json()
          if(r.ok){ const re = await fetch('/api/settings/products/'); const dx = await re.json(); setProducts(dx.products||[]); setForm({id:null,name:'',category:'',unit_price:'',quantity:'',min_quantity:''}); setErrors({}); setMsg('') }
          else { setMsg(JSON.stringify(d)) }
        }} confirmText={form.id? 'Update':'Create'}>
          <div>{form.id? 'Update':'Add'} product "{form.name}"?</div>
        </Modal>
      )}
    </div>
  )
}

