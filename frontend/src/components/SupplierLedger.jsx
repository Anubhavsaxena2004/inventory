import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function SupplierLedger(){
  const [ledger,setLedger] = useState([])
  const [supplier,setSupplier] = useState(null)
  const [suppliers,setSuppliers] = useState([])
  const [selectedSupplier,setSelectedSupplier] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    fetchSuppliers()
  },[])

  function fetchSuppliers(){
    fetchWithAuth('/api/suppliers/view/').then(r=>r.json()).then(d=>setSuppliers(d.suppliers||[])).catch(()=>{})
  }

  function fetchLedger(){
    if(!selectedSupplier) return
    setLoading(true)
    fetchWithAuth(`/api/suppliers/ledger/?supplier_id=${selectedSupplier}`).then(r=>r.json()).then(d=>{
      setLedger(d.ledger||[])
      setSupplier(d.supplier)
    }).catch(()=>{setLedger([]); setSupplier(null)}).finally(()=>setLoading(false))
  }

  return (
    <div className="card">
      <h3>Supplier Ledger</h3>
      <div className="form-row">
        <label>Supplier</label>
        <select value={selectedSupplier} onChange={e=>{setSelectedSupplier(e.target.value); fetchLedger()}}>
          <option value="">Select Supplier</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {supplier && <div className="form-row"><strong>Ledger for: {supplier.name}</strong></div>}
      {loading && <div>Loading...</div>}
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

