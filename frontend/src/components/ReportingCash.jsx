import React, {useState} from 'react'

export default function ReportingCash(){
  const [date,setDate] = useState('')
  const [report,setReport] = useState(null)

  async function fetchReport(){
    const r = await fetch('/api/reporting/cash/?date='+encodeURIComponent(date))
    const d = await r.json()
    setReport(d.report||{})
  }

  return (
    <div className="card">
      <h3>Cash Report</h3>
      <div className="form-row">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button className="btn" onClick={fetchReport}>Show</button>
      </div>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(report,null,2)}</pre>
    </div>
  )
}

