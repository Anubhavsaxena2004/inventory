import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function ReportingMonthly(){
  const [q,setQ] = useState({from:'',to:'',type:'summary'})
  const [report,setReport] = useState(null)
  const [loading,setLoading] = useState(false)

  useEffect(()=>{ /* wait for user input */ },[])

  async function fetchReport(){
    setLoading(true)
    try {
      const params = new URLSearchParams(q).toString()
      const r = await fetchWithAuth('/api/reporting/monthly/?'+params)
      const d = await r.json()
      setReport(d.report||{})
    } catch (err) {
      alert('Error fetching report: ' + err.message)
    }
    setLoading(false)
  }

  const renderReport = () => {
    if (!report) return null
    if (q.type === 'summary') {
      return (
        <div>
          <h4>Summary Report</h4>
          <table>
            <tbody>
              <tr><td>General Order Amount:</td><td>{report.general_order_amount}</td></tr>
              <tr><td>General Order Amount Received:</td><td>{report.general_order_amount_received}</td></tr>
              <tr><td>Stock Purchase Amount:</td><td>{report.stock_purchase_amount}</td></tr>
              <tr><td>Stock Purchase Amount Paid:</td><td>{report.stock_purchase_amount_paid}</td></tr>
              <tr><td>Total Expense:</td><td>{report.total_expense}</td></tr>
              <tr><td>Salaries:</td><td>{report.salaries}</td></tr>
            </tbody>
          </table>
        </div>
      )
    } else if (q.type === 'customer_orders') {
      return (
        <div>
          <h4>Customer Orders</h4>
          <table>
            <thead><tr><th>Customer</th><th>Total</th></tr></thead>
            <tbody>
              {report.map((item,i)=> <tr key={i}><td>{item.customer__name}</td><td>{item.total}</td></tr>)}
            </tbody>
          </table>
        </div>
      )
    } else if (q.type === 'expense') {
      return (
        <div>
          <h4>Expenses</h4>
          <table>
            <thead><tr><th>Type</th><th>Total</th></tr></thead>
            <tbody>
              {report.map((item,i)=> <tr key={i}><td>{item.type}</td><td>{item.total}</td></tr>)}
            </tbody>
          </table>
        </div>
      )
    } else {
      return <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(report,null,2)}</pre>
    }
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
        <button className="btn" onClick={fetchReport} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
      </div>
      {renderReport()}
    </div>
  )
}

