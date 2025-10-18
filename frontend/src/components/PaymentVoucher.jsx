import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'
import Modal from './Modal'

export default function PaymentVoucher(){
  const [vouchers,setVouchers] = useState([])
  const [filteredVouchers,setFilteredVouchers] = useState([])
  const [form,setForm] = useState({voucher_no:'', type:'receipt', payment_method:'cash', amount:'', description:'', date:''})
  const [loading,setLoading] = useState(false)
  const [editing,setEditing] = useState(null)
  const [deleting,setDeleting] = useState(null)
  const [search,setSearch] = useState('')
  const [page,setPage] = useState(1)
  const pageSize = 20

  useEffect(()=>{
    fetchVouchers()
  },[])

  useEffect(()=>{
    setFilteredVouchers(vouchers.filter(v=> !search || v.description.toLowerCase().includes(search.toLowerCase()) || (v.voucher_no && v.voucher_no.toLowerCase().includes(search.toLowerCase()))))
    setPage(1)
  },[vouchers,search])

  function fetchVouchers(){
    setLoading(true)
    fetchWithAuth('/api/orders/payment-voucher/').then(r=>r.json()).then(d=>setVouchers(d.vouchers||[])).catch(()=>{alert('Failed to load vouchers')}).finally(()=>setLoading(false))
  }

  const submit = async (e) => {
    e.preventDefault()
    if(!form.amount || !form.description || !form.date) return alert('All fields required')
    setLoading(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? {id:editing.id, ...form} : form
      const res = await fetchWithAuth('/api/orders/payment-voucher/', { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) })
      if (res.ok) {
        const updated = await res.json()
        if(editing){
          setVouchers(vouchers.map(v=>v.id===editing.id ? updated : v))
        }else{
          setVouchers([updated, ...vouchers])
        }
        setForm({voucher_no:'', type:'receipt', payment_method:'cash', amount:'', description:'', date:''})
        setEditing(null)
      } else {
        alert('Error saving voucher')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  function startEdit(v){
    setEditing(v)
    setForm({voucher_no:v.voucher_no||'', type:v.type, payment_method:v.payment_method, amount:v.amount, description:v.description, date:v.date})
  }

  async function deleteVoucher(){
    try{
      await fetchWithAuth('/api/orders/payment-voucher/', { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id:deleting.id}) })
      setVouchers(vouchers.filter(v=>v.id!==deleting.id))
      setDeleting(null)
    }catch(e){alert('Error deleting voucher')}
  }

  const paginated = filteredVouchers.slice((page-1)*pageSize, page*pageSize)

  return (
    <div className="card">
      <h3>Payment Voucher</h3>
      <form onSubmit={submit} className="form-row">
        <input placeholder="Voucher No" value={form.voucher_no} onChange={e=>setForm({...form,voucher_no:e.target.value})} />
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="receipt">Receipt</option>
          <option value="payment">Payment</option>
        </select>
        <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="cheque">Cheque</option>
        </select>
        <input type="number" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required />
        <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update Voucher' : 'Create Voucher'}</button>
        {editing && <button className="btn" type="button" onClick={()=>{setEditing(null); setForm({voucher_no:'', type:'receipt', payment_method:'cash', amount:'', description:'', date:''})}}>Cancel</button>}
      </form>
      <div className="form-row">
        <input placeholder="Search by Voucher No or Description" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading && <div>Loading...</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Voucher No</th><th>Type</th><th>Payment Method</th><th>Amount</th><th>Description</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {paginated.map((v,i)=> (
              <tr key={v.id}><td>{(page-1)*pageSize + i+1}</td><td>{v.voucher_no || v.id}</td><td>{v.type}</td><td>{v.payment_method}</td><td>{v.amount}</td><td>{v.description}</td><td>{v.date}</td>
                <td>
                  <button className="btn small" onClick={()=>startEdit(v)}>Edit</button>
                  <button className="btn small" onClick={()=>setDeleting(v)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row">
        <button className="btn" disabled={page<=1} onClick={()=>setPage(page-1)}>Prev</button>
        <span>Page {page} of {Math.ceil(filteredVouchers.length/pageSize)}</span>
        <button className="btn" disabled={page>=Math.ceil(filteredVouchers.length/pageSize)} onClick={()=>setPage(page+1)}>Next</button>
      </div>
      {deleting && (
        <Modal
          title="Confirm Delete"
          onClose={()=>setDeleting(null)}
          onConfirm={deleteVoucher}
          confirmText="Delete"
        >
          Delete voucher "{deleting.voucher_no || deleting.id}"?
        </Modal>
      )}
    </div>
  )
}

