import React, {useEffect, useState} from 'react'

export default function CustomerProducts(){
  const [items,setItems] = useState([])

  useEffect(()=>{
    fetch('/api/settings/customer-products/').then(r=>r.json()).then(d=>setItems(d.customer_products||[])).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>Customer Products</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sr.No</th><th>Product Name</th></tr></thead>
          <tbody>
            {items.map((p,i)=> (<tr key={p.id}><td>{i+1}</td><td>{p.name}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

