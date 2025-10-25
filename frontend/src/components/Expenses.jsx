import React, {useEffect, useState} from 'react'
import Modal from './Modal'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function Expenses(){
  const [expenses,setExpenses] = useState([])
  const [suppliers,setSuppliers] = useState([])
  const [form,setForm] = useState({type:'Misc', amount:'', description:'', date:'', supplier:''})
  const [errors,setErrors] = useState({})
  const [msg,setMsg] = useState('')
  const [confirming,setConfirming] = useState(false)
  const [editingId,setEditingId] = useState(null)

  useEffect(()=>{ refresh(); fetchSuppliers() },[])

  function refresh(){
    fetchWithAuth('/api/expense/list/').then(r=>r.json()).then(d=>setExpenses(d.expenses||[])).catch(e=>setMsg(String(e)))
  }

  function fetchSuppliers(){
    fetchWithAuth('/api/suppliers/view/').then(r=>r.json()).then(d=>setSuppliers(d.suppliers||[])).catch(()=>{})
  }

  function validate(){
    const e={}
    if(!form.amount || Number(form.amount)<=0) e.amount='Enter a valid amount'
    if(!form.date) e.date='Select a date'
    return e
  }

  function submit(e){
    e.preventDefault()
    const eObj = validate(); setErrors(eObj); if(Object.keys(eObj).length) return
    setConfirming(true)
  }

  return (
    <div className="card">
      <h3>Expenses</h3>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>Type</label>
          <input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} />
        </div>
        <div className="form-row">
          <label>Amount</label>
          <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} />
          <div className="error">{errors.amount}</div>
        </div>
        <div className="form-row">
          <label>Description</label>
          <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        </div>
        <div className="form-row">
          <label>Supplier</label>
          <select value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})}>
            <option value="">Select Supplier (optional)</option>
            {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Date</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
          <div className="error">{errors.date}</div>
        </div>
        <div className="form-row"><button className="btn primary" type="submit">Add Expense</button></div>
      </form>
      <div className="msg">{msg}</div>

      <div className="form-row"><button className="btn" onClick={()=> window.open('/api/expense/list/?format=csv','_blank')}>Export CSV</button></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead>
          <tbody>
            {expenses.map(ex=> (
              <tr key={ex.id}><td>{ex.date}</td><td>{ex.type}</td><td>{ex.amount}</td><td>{ex.description}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirming && (
        <Modal
          title={editingId? 'Confirm Update Expense':'Confirm Add Expense'}
          onClose={()=>setConfirming(false)}
          onConfirm={async ()=>{
            setConfirming(false)
            try{
              const method = editingId? 'PUT':'POST'
              const body = editingId? { id: editingId, ...form, amount: Number(form.amount), supplier: form.supplier || null} : { ...form, amount: Number(form.amount), supplier: form.supplier || null}
              const r = await fetch('/api/expense/new/',{ method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
              const d = await r.json()
              if(r.ok){ setMsg(''); setForm({type:'Misc', amount:'', description:'', date:'', supplier:''}); setErrors({}); setEditingId(null); refresh() }
              else { if(d && typeof d==='object') setErrors(d); else setMsg(String(d)) }
            }catch(err){ setMsg(String(err)) }
          }}
          confirmText={editingId? 'Update':'Create'}
        >
          <div>{editingId? 'Update':'Add'} expense of {form.amount} for {form.type} on {form.date}?</div>
        </Modal>
      )}
      <div style={{marginTop:8}}>
        {expenses.map(ex=> (
          <button key={'edit-'+ex.id} className="btn small" onClick={()=>{ setEditingId(ex.id); setForm({type: ex.type, amount: ex.amount, description: ex.description||'', date: ex.date}) }}>Edit #{ex.id}</button>
        ))}
      </div>
    </div>
  )
}

