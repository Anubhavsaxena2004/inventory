import React, {useEffect, useState} from 'react'
import Modal from './Modal'

export default function Users(){
  const [users,setUsers] = useState([])
  const [form,setForm] = useState({name:'',email:''})
  const [errors,setErrors] = useState({})
  const [msg,setMsg] = useState('')
  const [confirming,setConfirming] = useState(false)

  useEffect(()=>{ refresh() },[])

  function refresh(){
    fetch('/api/settings/users/').then(r=>r.json()).then(d=>setUsers(d.users||[])).catch(()=>{})
  }

  function validate(){ const e={}; if(!form.name) e.name='Name is required'; if(!form.email) e.email='Email is required'; return e }

  function submit(e){ e.preventDefault(); const eObj=validate(); setErrors(eObj); if(Object.keys(eObj).length) return; setConfirming(true) }

  return (
    <div className="card">
      <h3>Users</h3>
      <form onSubmit={submit}>
        <div className="form-row"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><div className="error">{errors.name}</div></div>
        <div className="form-row"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><div className="error">{errors.email}</div></div>
        <div className="form-row"><button className="btn primary" type="submit">Add User</button></div>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Name</th><th>Email</th></tr></thead>
          <tbody>
            {users.map((u,i)=> (<tr key={u.id}><td>{i+1}</td><td>{u.name}</td><td>{u.email}</td></tr>))}
          </tbody>
        </table>
      </div>

      {confirming && (
        <Modal title="Confirm Add User" onClose={()=>setConfirming(false)} onConfirm={async ()=>{ setConfirming(false); const r = await fetch('/api/settings/users/',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); const d = await r.json(); if(r.ok){ setForm({name:'',email:''}); setErrors({}); const rr=await fetch('/api/settings/users/'); const dd=await rr.json(); setUsers(dd.users||[]) } else { setMsg(JSON.stringify(d)) } }} confirmText="Create">
          <div>Add user "{form.name}"?</div>
        </Modal>
      )}
    </div>
  )
}

