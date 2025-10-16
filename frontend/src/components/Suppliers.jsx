import React, {useEffect, useState} from 'react'
import Modal from './Modal'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function Suppliers(){
  const [suppliers,setSuppliers] = useState([])
  const [form,setForm] = useState({name:'',phone:'',email:'',address:''})
  const [errors,setErrors] = useState({})
  const [msg,setMsg] = useState('')
  const [confirming,setConfirming] = useState(false)
  const [editing,setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ refresh() },[])

  function refresh(){
    setLoading(true)
    fetchWithAuth('/api/suppliers/view/').then(r=>r.json()).then(d=>setSuppliers(d.suppliers||[])).catch(e=>setMsg(String(e))).finally(()=>setLoading(false))
  }

  function validate(){
    const e={}
    if(!form.name) e.name='Name is required'
    return e
  }

  function submit(e){
    e.preventDefault()
    const eObj = validate(); setErrors(eObj); if(Object.keys(eObj).length) return
    setConfirming(true)
  }

  return (
    <div className="card">
      <h3>Suppliers</h3>
      <form onSubmit={submit}>
        <div className="form-row"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><div className="error">{errors.name}</div></div>
        <div className="form-row"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
        <div className="form-row"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
        <div className="form-row"><label>Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
        <div className="form-row"><button className="btn primary" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Supplier'}</button></div>
      </form>
      <div className="msg">{msg}</div>

      {loading && <div>Loading...</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead>
          <tbody>
            {suppliers.map(s=> (
              <tr key={s.id||s.name}><td>{s.name}</td><td>{s.phone}</td><td>{s.email}</td><td>{s.address}</td>
                <td>
                  <button className="btn small" onClick={()=>{ setEditing(s.id); setForm({name:s.name||'',phone:s.phone||'',email:s.email||'',address:s.address||''}) }}>Edit</button>
                  <button className="btn small" onClick={async ()=>{ await fetchWithAuth('/api/suppliers/add/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id:s.id}) }); refresh() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirming && (
        <Modal
          title={editing? 'Confirm Update Supplier':'Confirm Add Supplier'}
          onClose={()=>setConfirming(false)}
          onConfirm={async ()=>{
            setConfirming(false)
            setLoading(true)
            try{
              const method = editing? 'PUT':'POST'
              const body = editing? { id: editing, ...form } : form
              const r = await fetchWithAuth('/api/suppliers/add/',{ method, headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify(body) })
              const d = await r.json()
              if(r.ok){ setMsg(''); setForm({name:'',phone:'',email:'',address:''}); setErrors({}); setEditing(null); refresh() }
              else { if(d && typeof d==='object') setErrors(d); else setMsg(String(d)) }
            }catch(err){ setMsg(String(err)) }
            setLoading(false)
          }}
          confirmText={editing? 'Update':'Create'}
        >
          <div>{editing? 'Update':'Create'} supplier "{form.name}"?</div>
        </Modal>
      )}
    </div>
  )
}

