import React, {useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function ReportingCash(){
  const [date,setDate] = useState('')
  const [report,setReport] = useState(null)
  const [loading,setLoading] = useState(false)

  async function fetchReport(){
    if (!date) return
    setLoading(true)
    try {
      const r = await fetchWithAuth('/api/reporting/cash/?date='+encodeURIComponent(date))
      const d = await r.json()
      setReport(d.report||{})
    } catch (err) {
      alert('Error fetching report: ' + err.message)
    }
    setLoading(false)
  }

  const renderReport = () => {
    if (!report) return null
    return (
      <div>
        <h4>Cash Report for {date}</h4>
        <table>
          <tbody>
            <tr><td>Cash in Hand:</td><td>{report.cash_in_hand}</td></tr>
            <tr><td>Customer Amount:</td><td>{report.customer_amount}</td></tr>
            <tr><td>Supplier Amount:</td><td>{report.supplier_amount}</td></tr>
            <tr><td>Expense Amount:</td><td>{report.expense_amount}</td></tr>
          </tbody>
        </table>
        <h5>Transactions</h5>
        <table>
          <thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {report.transactions?.map((t,i)=> <tr key={i}><td>{t.type}</td><td>{t.description}</td><td>{t.amount}</td><td>{t.date}</td></tr>)}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Cash Report</h3>
      <div className="form-row">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button className="btn" onClick={fetchReport} disabled={loading || !date}>{loading ? 'Loading...' : 'Show'}</button>
      </div>
      {renderReport()}
    </div>
  )
}

