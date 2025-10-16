import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function ViewQuotation(){
  const [items,setItems] = useState([])
  const [msg,setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    fetchQuotations()
  },[])

  function fetchQuotations(){
    setLoading(true)
    fetchWithAuth('/api/quotation/view/').then(r=>r.json()).then(d=>setItems(d.quotations||[])).catch(()=>{setMsg('Error loading quotations')}).finally(()=>setLoading(false))
  }

  function deleteQuotation(id){
    if(!confirm('Delete this quotation?')) return
    fetchWithAuth('/api/quotation/add/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id}) }).then(r=>r.json()).then(d=>{ if(d.deleted) fetchQuotations(); else setMsg('Delete failed') }).catch(()=>{setMsg('Delete error')})
  }

  return (
    <div className="card">
      <h3>View Quotation</h3>
      {msg && <div className="msg">{msg}</div>}
      {loading && <div>Loading...</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Quotation No</th><th>Customer</th><th>Contact</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((q,i)=> (
              <tr key={q.id}><td>{i+1}</td><td>{q.id}</td><td>{q.customer_name}</td><td>{q.customer_cell}</td><td>{q.date}</td>
                <td>
                  <button className="btn small" onClick={()=>deleteQuotation(q.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

