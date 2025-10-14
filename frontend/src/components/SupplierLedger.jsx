import React, {useEffect, useState} from 'react'

export default function SupplierLedger(){
  const [ledger,setLedger] = useState([])

  useEffect(()=>{
    fetch('/api/suppliers/ledger/').then(r=>r.json()).then(d=>setLedger(d.ledger||[])).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>Supplier Ledger</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
          <tbody>
            {ledger.map((row,i)=> (<tr key={i}><td>{i+1}</td><td>{row.date}</td><td>{row.description}</td><td>{row.debit}</td><td>{row.credit}</td><td>{row.balance}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

