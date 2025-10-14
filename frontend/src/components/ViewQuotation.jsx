import React, {useEffect, useState} from 'react'

export default function ViewQuotation(){
  const [items,setItems] = useState([])
  const [msg,setMsg] = useState('')

  useEffect(()=>{
    fetch('/api/quotation/view/').then(r=>r.json()).then(d=>setItems(d.quotations||[])).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>View Quotation</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Quotation No</th><th>Customer</th><th>Contact</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((q,i)=> (
              <tr key={q.id}><td>{i+1}</td><td>{q.id}</td><td>{q.customer_name}</td><td>{q.customer_cell}</td><td>{q.date}</td>
                <td>
                  <button className="btn small" onClick={async ()=>{ await fetch('/api/quotation/add/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id:q.id}) }); const r=await fetch('/api/quotation/view/'); const d=await r.json(); setItems(d.quotations||[]) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

