import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function MarketCreditors(){
  const [creditors,setCreditors] = useState([])
  const [filteredCreditors,setFilteredCreditors] = useState([])
  const [search,setSearch] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [page,setPage] = useState(1)
  const pageSize = 20

  useEffect(()=>{
    fetchCreditors()
  },[])

  useEffect(()=>{
    setFilteredCreditors(creditors.filter(c=> !search || c.customer_name.toLowerCase().includes(search.toLowerCase())))
    setPage(1)
  },[creditors,search])

  function fetchCreditors(){
    setLoading(true)
    setError('')
    fetchWithAuth('/api/orders/market-creditors/').then(r=>r.json()).then(d=>{
      setCreditors(d.creditors||[])
    }).catch(e=>{setError('Failed to load creditors')}).finally(()=>setLoading(false))
  }

  const paginated = filteredCreditors.slice((page-1)*pageSize, page*pageSize)
  const total = creditors.reduce((s,c)=> s + Number(c.balance||0), 0)

  return (
    <div className="card">
      <h3>Market Creditors</h3>
      <div style={{marginBottom:8}}>Total Market Credit: <strong>{total}</strong></div>
      <div className="form-row">
        <input placeholder="Search by Customer Name" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Customer</th><th>Contact</th><th>Balance</th></tr></thead>
          <tbody>
            {paginated.map((c,i)=> (
              <tr key={c.id}><td>{(page-1)*pageSize + i+1}</td><td>{c.customer_name}</td><td>{c.customer_cell}</td><td>{c.balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row">
        <button className="btn" disabled={page<=1} onClick={()=>setPage(page-1)}>Prev</button>
        <span>Page {page} of {Math.ceil(filteredCreditors.length/pageSize)}</span>
        <button className="btn" disabled={page>=Math.ceil(filteredCreditors.length/pageSize)} onClick={()=>setPage(page+1)}>Next</button>
      </div>
    </div>
  )
}

