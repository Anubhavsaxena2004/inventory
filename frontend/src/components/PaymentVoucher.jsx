import React, {useEffect, useState} from 'react'

export default function PaymentVoucher(){
  const [vouchers,setVouchers] = useState([])

  useEffect(()=>{
    fetch('/api/orders/payment-voucher/').then(r=>r.json()).then(d=>setVouchers(d.vouchers||[])).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>Payment Voucher</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Voucher No</th><th>Type</th><th>Payment Method</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
          <tbody>
            {vouchers.map((v,i)=> (
              <tr key={v.id}><td>{i+1}</td><td>{v.id}</td><td>{v.type}</td><td>{v.payment_method}</td><td>{v.amount}</td><td>{v.description}</td><td>{v.date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

