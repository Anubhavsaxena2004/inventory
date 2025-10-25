import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function SupplierLedger(){
  const [suppliers,setSuppliers] = useState([])
  const [selectedSupplier,setSelectedSupplier] = useState('')
  const [ledger,setLedger] = useState([])
  const [supplierInfo,setSupplierInfo] = useState(null)
  const [loading,setLoading] = useState(false)

  useEffect(()=>{ fetchSuppliers() },[])

  function fetchSuppliers(){
    fetchWithAuth('/api/suppliers/view/').then(r=>r.json()).then(d=>setSuppliers(d.suppliers||[])).catch(()=>{})
  }

  function fetchLedger(){
    if(!selectedSupplier) return
    setLoading(true)
    fetchWithAuth(`/api/suppliers/ledger/?supplier_id=${selectedSupplier}`).then(r=>r.json()).then(d=>{
      setLedger(d.ledger||[])
      setSupplierInfo(d.supplier)
    }).catch(e=>alert('Error: '+e.message)).finally(()=>setLoading(false))
  }

  return (
    <div className="card">
      <h3>Supplier Ledger</h3>
      <div className="form-row">
        <select value={selectedSupplier} onChange={e=>{setSelectedSupplier(e.target.value); setLedger([]); setSupplierInfo(null)}}>
          <option value="">Select Supplier</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn" onClick={fetchLedger} disabled={!selectedSupplier || loading}>Fetch Ledger</button>
      </div>
      {loading && <div>Loading...</div>}
      {supplierInfo && (
        <div>
          <h4>Supplier: {supplierInfo.name}</h4>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sr.No</th><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {ledger.map((entry,i)=> (
                  <tr key={i}>
                    <td>{i+1}</td>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td>{entry.debit}</td>
                    <td>{entry.credit}</td>
                    <td>{entry.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
