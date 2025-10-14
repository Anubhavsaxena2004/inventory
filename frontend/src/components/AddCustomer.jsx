import React, {useState} from 'react'
import Modal from './Modal'

export default function AddCustomer({setCustomers}){
  const [form, setForm] = useState({name:'',email:'',phone:'',type:'cash',opening_balance:0})
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function validate(){
    const e = {}
    if(!form.name) e.name = 'Name is required'
    if(form.phone && form.phone.length < 6) e.phone = 'Phone seems short'
    return e
  }

  function submit(e){
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if(Object.keys(validationErrors).length) return
    setConfirming(true)
  }

  return (
    <div className="card">
      <h3>Add Customer</h3>
      <form onSubmit={submit}>
        <div className="form-row"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><div className="error">{errors.name}</div></div>
        <div className="form-row"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /><div className="error">{errors.phone}</div></div>
        <div className="form-row"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
        <div className="form-row"><label>Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="cash">Cash</option><option value="credit">Credit</option></select></div>
        <div className="form-row"><button type="submit" className="btn primary">Add Customer</button></div>
      </form>
      <div className="msg">{msg}</div>

      {showSuccess && (
        <Modal title="Customer added" onClose={()=>setShowSuccess(false)} onConfirm={()=>setShowSuccess(false)}>
          <div>Customer was created successfully.</div>
        </Modal>
      )}

      {confirming && (
        <Modal
          title="Confirm Create Customer"
          onClose={()=>setConfirming(false)}
          onConfirm={async ()=>{
            setConfirming(false)
            try{
              const r = await fetch('/api/customers/add/',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
              const d = await r.json()
              if(r.ok && d.id){
                setMsg('')
                setShowSuccess(true)
                const newCust = {id: d.id, name: form.name, phone: form.phone}
                if(typeof setCustomers === 'function') setCustomers(prev=>[newCust, ...prev])
                setForm({name:'',email:'',phone:'',type:'cash',opening_balance:0})
                setErrors({})
              } else {
                if(d && typeof d === 'object') setErrors(d)
                else setMsg(String(d))
              }
            }catch(err){ setMsg(String(err)) }
          }}
          confirmText="Create"
        >
          <div>Are you sure you want to create customer "{form.name}"?</div>
        </Modal>
      )}
    </div>
  )
}
