import React, {useEffect, useState} from 'react'

export default function ReportingMonthly(){
  const [q,setQ] = useState({from:'',to:'',type:'summary'})
  const [report,setReport] = useState(null)

  useEffect(()=>{ /* wait for user input */ },[])

  async function fetchReport(){
    const params = new URLSearchParams(q).toString()
    const r = await fetch('/api/reporting/monthly/?'+params)
    const d = await r.json()
    setReport(d.report||{})
  }

  return (
    <div className="card">
      <h3>Monthly Report</h3>
      <div className="form-row">
        <input type="date" value={q.from} onChange={e=>setQ({...q,from:e.target.value})} />
        <input type="date" value={q.to} onChange={e=>setQ({...q,to:e.target.value})} />
        <select value={q.type} onChange={e=>setQ({...q,type:e.target.value})}>
          <option value="summary">Summary</option>
          <option value="customer_orders">Customer Orders</option>
          <option value="stock_purchase">Stock Purchase</option>
          <option value="expense">Expense</option>
          <option value="salary">Employee Salary</option>
        </select>
        <button className="btn" onClick={fetchReport}>Generate</button>
      </div>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(report,null,2)}</pre>
    </div>
  )
}

