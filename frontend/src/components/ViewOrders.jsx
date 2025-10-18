import React, {useEffect, useState} from 'react'
import fetchWithAuth from '../auth/fetchWithAuth'

export default function ViewOrders(){
  const [orders,setOrders] = useState([])
  const [meta,setMeta] = useState({count:0,page:1,page_size:20})
  const [q,setQ] = useState({customer:'',status:'',from:'',to:''})
  const [updating,setUpdating] = useState(null)
  const [editForm,setEditForm] = useState({status:'',received:''})
  const [loading,setLoading] = useState(false)

  useEffect(()=>{ refresh() },[])

  function refresh(){
    setLoading(true)
    const params = new URLSearchParams({
      customer_name: q.customer || '',
      status: q.status || '',
      from: q.from || '',
      to: q.to || '',
      page: q.page || 1,
      page_size: q.page_size || 20
    })
    fetchWithAuth('/api/orders/view/?'+params.toString()).then(r=>r.json()).then(d=>{ setOrders(d.orders||[]); if(d.count!==undefined) setMeta({count:d.count,page:d.page,page_size:d.page_size}) }).catch(()=>{setOrders([])}).finally(()=>setLoading(false))
  }

  const filtered = orders.filter(o=> (
    (!q.customer || (o.customer_name||'').toLowerCase().includes(q.customer.toLowerCase())) &&
    (!q.status || o.status===q.status) &&
    (!q.from || (o.order_date && o.order_date >= q.from)) &&
    (!q.to || (o.order_date && o.order_date <= q.to))
  ))

  function startEdit(order){
    setUpdating(order.id)
    setEditForm({status:order.status, received:order.received})
  }

  async function saveEdit(){
    try{
      await fetchWithAuth('/api/orders/update/',{ method:'PUT', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id:updating, status:editForm.status, received:editForm.received}) })
      refresh()
      setUpdating(null)
    }catch(e){ alert('Error updating order') }
  }

  async function deleteOrder(id){
    if(!confirm('Delete this order?')) return
    try{
      await fetchWithAuth('/api/orders/delete/',{ method:'DELETE', headers:{'Content-Type':'application/json','X-Admin':'true'}, body: JSON.stringify({id}) })
      refresh()
    }catch(e){ alert('Error deleting order') }
  }

  // quick debug so you can see this file updated in the editor and the UI
  useEffect(()=>{ console.log('ViewOrders mounted, orders count:', meta.count) },[meta.count])

  return (
    <div className="card">
      <h3>View Orders</h3>
      <div className="sub">Orders in system: <strong>{meta.count}</strong></div>
      <div className="form-row">
        <input placeholder="Customer Name" value={q.customer} onChange={e=>setQ({...q,customer:e.target.value})} />
        <select value={q.status} onChange={e=>setQ({...q,status:e.target.value})}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="working">Working</option>
          <option value="completed">Completed</option>
        </select>
        <input type="date" value={q.from} onChange={e=>setQ({...q,from:e.target.value})} />
        <input type="date" value={q.to} onChange={e=>setQ({...q,to:e.target.value})} />
        <button className="btn" onClick={refresh} disabled={loading}>{loading?'Filtering...':'Filter'}</button>
        <button className="btn" onClick={()=>{ window.open('/api/orders/view/?'+new URLSearchParams({...q, format:'csv'}).toString(), '_blank') }}>Export CSV</button>
      </div>
      {loading && <div>Loading...</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order No.</th><th>Customer</th><th>Status</th><th>Total Bill</th><th>Discount</th><th>Received</th><th>Balance</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(o=> (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>
                  {updating===o.id ? (
                    <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="working">Working</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : o.status}
                </td>
                <td>{o.total_bill}</td>
                <td>{o.discount}</td>
                <td>
                  {updating===o.id ? (
                    <input type="number" value={editForm.received} onChange={e=>setEditForm({...editForm,received:e.target.value})} />
                  ) : o.received}
                </td>
                <td>{o.balance}</td>
                <td>{o.order_date}</td>
                <td>
                  {updating===o.id ? (
                    <>
                      <button className="btn small" onClick={saveEdit}>Save</button>
                      <button className="btn small" onClick={()=>setUpdating(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn small" onClick={()=>startEdit(o)}>Edit</button>
                      <button className="btn small" onClick={()=>deleteOrder(o.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row">
        <button className="btn" disabled={meta.page<=1 || loading} onClick={()=>{ setQ({...q,page:(q.page||1)-1}); setTimeout(refresh,0) }}>Prev</button>
        <div>Page {meta.page} of {Math.max(1, Math.ceil((meta.count||0)/(meta.page_size||20)))}</div>
        <button className="btn" disabled={meta.page>=Math.ceil((meta.count||0)/(meta.page_size||20)) || loading} onClick={()=>{ setQ({...q,page:(q.page||1)+1}); setTimeout(refresh,0) }}>Next</button>
      </div>
    </div>
  )
}

