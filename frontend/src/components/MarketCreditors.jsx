import React, {useEffect, useState} from 'react'

export default function MarketCreditors(){
  const [creditors,setCreditors] = useState([])

  useEffect(()=>{
    fetch('/api/orders/market-creditors/').then(r=>r.json()).then(d=>setCreditors(d.creditors||[])).catch(()=>{})
  },[])

  const total = creditors.reduce((s,c)=> s + Number(c.balance||0), 0)

  return (
    <div className="card">
      <h3>Market Creditors</h3>
      <div style={{marginBottom:8}}>Total Market Credit: <strong>{total}</strong></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Customer</th><th>Contact</th><th>Balance</th></tr></thead>
          <tbody>
            {creditors.map((c,i)=> (
              <tr key={c.id}><td>{i+1}</td><td>{c.customer_name}</td><td>{c.customer_cell}</td><td>{c.balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

