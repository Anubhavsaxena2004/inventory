import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function PaymentVoucher(){
  const [vouchers,setVouchers] = useState([])
  const [form,setForm] = useState({voucher_no:'', type:'receipt', payment_method:'cash', amount:'', description:'', date:''})
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    fetchWithAuth('/api/orders/payment-voucher/').then(r=>r.json()).then(d=>setVouchers(d.vouchers||[])).catch(()=>{})
  },[])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/orders/payment-voucher/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) })
      if (res.ok) {
        const newVoucher = await res.json()
        setVouchers([newVoucher, ...vouchers])
        setForm({voucher_no:'', type:'receipt', payment_method:'cash', amount:'', description:'', date:''})
      } else {
        alert('Error creating voucher')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <h3>Payment Voucher</h3>
      <form onSubmit={submit} className="form-row">
        <input placeholder="Voucher No" value={form.voucher_no} onChange={e=>setForm({...form,voucher_no:e.target.value})} required />
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
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Voucher'}</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Voucher No</th><th>Type</th><th>Payment Method</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
          <tbody>
            {vouchers.map((v,i)=> (
              <tr key={v.id}><td>{i+1}</td><td>{v.voucher_no || v.id}</td><td>{v.type}</td><td>{v.payment_method}</td><td>{v.amount}</td><td>{v.description}</td><td>{v.date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

