import React, {useEffect, useState} from 'react'

export default function ViewCustomers(){
  const [customers,setCustomers] = useState([])
  const [meta,setMeta] = useState({count:0,page:1,page_size:20})
  const [q,setQ] = useState('')
  const [edit,setEdit] = useState(null)
  const [errors,setErrors] = useState({})

  useEffect(()=>{ refresh() },[])

  function refresh(){
    const params = new URLSearchParams({ page: meta.page, page_size: meta.page_size })
    fetch('/api/customers/view/?'+params.toString()).then(r=>r.json()).then(d=>{ setCustomers(d.customers||[]); if(d.count!==undefined) setMeta({count:d.count,page:d.page,page_size:d.page_size}) }).catch(()=>{})
  }

  const filtered = customers.filter(c=> (c.name||'').toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="card">
      <h3>View Customers</h3>
      <div className="form-row">
        <input placeholder="Search name" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn" onClick={()=> window.open('/api/customers/view/?format=csv','_blank')}>Export CSV</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Name</th><th>Type</th><th>Contact</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((c,i)=> (
              <tr key={c.id}>
                <td>{i+1}</td><td>{c.name}</td><td>{c.type}</td><td>{c.phone}</td><td>{c.email}</td>
                <td>
                  <button className="btn small" onClick={()=>setEdit(c)}>Edit</button>
                  <button className="btn small" onClick={async ()=>{ await fetch('/api/customers/add/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id:c.id}) }); refresh() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="card" style={{marginTop:12}}>
          <h4>Edit Customer</h4>
          <div className="form-row"><input placeholder="Name" value={edit.name||''} onChange={e=>setEdit({...edit,name:e.target.value})} /></div>
          <div className="form-row"><input placeholder="Phone" value={edit.phone||''} onChange={e=>setEdit({...edit,phone:e.target.value})} /></div>
          <div className="form-row"><input placeholder="Email" value={edit.email||''} onChange={e=>setEdit({...edit,email:e.target.value})} /></div>
          <div className="form-row"><select value={edit.type||'cash'} onChange={e=>setEdit({...edit,type:e.target.value})}><option value="cash">Cash</option><option value="credit">Credit</option></select></div>
          <div className="form-row">
            <button className="btn primary" onClick={async ()=>{ const r=await fetch('/api/customers/add/',{ method:'PUT', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify(edit) }); const d=await r.json(); if(r.ok){ setEdit(null); refresh() } else { setErrors(d) } }}>Save</button>
            <button className="btn" onClick={()=>setEdit(null)}>Cancel</button>
          </div>
          <div className="error">{errors && JSON.stringify(errors)}</div>
        </div>
      )}
      <div className="form-row">
        <button className="btn" disabled={meta.page<=1} onClick={()=>{ setMeta({...meta,page:meta.page-1}); setTimeout(refresh,0) }}>Prev</button>
        <div>Page {meta.page} of {Math.max(1, Math.ceil((meta.count||0)/(meta.page_size||20)))}</div>
        <button className="btn" disabled={meta.page>=Math.ceil((meta.count||0)/(meta.page_size||20))} onClick={()=>{ setMeta({...meta,page:meta.page+1}); setTimeout(refresh,0) }}>Next</button>
      </div>
    </div>
  )
}

