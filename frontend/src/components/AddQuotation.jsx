import React, {useEffect, useState} from 'react'
import Modal from './Modal'

export default function AddQuotation(){
  const [customers,setCustomers] = useState([])
  const [form,setForm] = useState({customer:'',customer_email:'',date:'',items:[]})
  const [errors,setErrors] = useState({})
  const [msg,setMsg] = useState('')
  const [confirming,setConfirming] = useState(false)

  useEffect(()=>{ fetch('/api/customers/view/').then(r=>r.json()).then(d=>setCustomers(d.customers||[])) },[])

  function addItem(){ setForm(f=>({...f,items:[...f.items,{description:'',rate:0,quantity:1,amount:0}]})) }

  function updateItem(idx,changes){
    const items=[...form.items]; items[idx]={...items[idx],...changes}; items[idx].amount=(Number(items[idx].rate||0)*Number(items[idx].quantity||0)).toFixed(2); setForm({...form,items})
  }

  function submit(e){
    e.preventDefault()
    const eObj={}; if(!form.customer) eObj.customer='Select a customer'; if(!form.date) eObj.date='Select a date'; if(form.items.length===0) eObj.items='Add at least one item'; if(Object.keys(eObj).length){ setErrors(eObj); return }
    setConfirming(true)
  }

  return (
    <div className="card">
      <h3>Add Quotation</h3>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>Customer</label>
          <select value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}>
            <option value="">Select</option>
            {customers.map(c=> (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <label>Email</label>
          <input value={form.customer_email} onChange={e=>setForm({...form,customer_email:e.target.value})} />
          <label>Date</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        </div>

        <div className="items-header"><strong>Quotation Items</strong> <button type="button" className="btn" onClick={addItem}>+ Add Item</button></div>
        <div className="items-list">
          {form.items.map((it,idx)=> (
            <div className="item-row" key={idx}>
              <input placeholder="Description" value={it.description} onChange={e=>updateItem(idx,{description:e.target.value})} />
              <input type="number" placeholder="Rate" value={it.rate} onChange={e=>updateItem(idx,{rate:Number(e.target.value)})} />
              <input type="number" placeholder="Qty" value={it.quantity} onChange={e=>updateItem(idx,{quantity:Number(e.target.value)})} />
              <div className="line-total">{it.amount||'0.00'}</div>
            </div>
          ))}
        </div>
        <div className="form-row"><button className="btn primary" type="submit">Create Quotation</button></div>
      </form>
      <div className="msg">{msg}</div>

      {confirming && (
        <Modal title="Confirm Create Quotation" onClose={()=>setConfirming(false)} onConfirm={async ()=>{ setConfirming(false); const r=await fetch('/api/quotation/add/',{ method:'POST', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify(form) }); const d=await r.json(); if(r.ok){ setForm({customer:'',customer_email:'',date:'',items:[]}); setErrors({}); setMsg('Created quotation #'+d.id) } else { setMsg(JSON.stringify(d)) } }} confirmText="Create">
          <div>Create quotation for selected customer?</div>
        </Modal>
      )}
    </div>
  )
}

