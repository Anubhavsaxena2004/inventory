import React, {useEffect, useState} from 'react'

export default function LowStock(){
  const [items,setItems] = useState([])

  useEffect(()=>{
    fetch('/api/settings/low-stock/').then(r=>r.json()).then(d=>setItems(d.low_stock||[])).catch(()=>{})
  },[])

  return (
    <div className="card">
      <h3>Low Stock</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Quantity</th><th>Min Qty</th></tr></thead>
          <tbody>
            {items.map(p=> (
              <tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td>{p.quantity}</td><td>{p.min_quantity}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

