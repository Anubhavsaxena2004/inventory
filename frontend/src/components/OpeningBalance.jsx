import React, {useEffect, useState} from 'react'

export default function OpeningBalance(){
  const [balance,setBalance] = useState(null)

  useEffect(()=>{
    fetch('/api/settings/opening-balance/').then(r=>r.json()).then(d=>setBalance(d.balance||null)).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>Opening Balance</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(balance,null,2)}</pre>
    </div>
  )
}

