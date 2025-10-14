import React, {useState, useContext} from 'react'
import './Sidebar.css'
import { AuthContext } from '../auth/AuthProvider'

const sections = [
  { title: 'Dashboard', icon: '📊' },
  { title: 'Reporting', icon: '📈', children: ['Monthly Report', 'Cash Report'] },
  { title: 'Orders', icon: '🧾', children: ['Add Order', 'View Orders', 'Market Creditors', 'Payment Voucher'] },
  { title: 'Customers', icon: '👥', children: ['Add Customer', 'View Customers'] },
  { title: 'Suppliers', icon: '📦', children: ['View Suppliers', 'Supplier Ledger'] },
  { title: 'Employee', icon: '🧑‍💼' },
  { title: 'Expense', icon: '💸' },
  { title: 'Quotation', icon: '✉️', children: ['View Quotation', 'Add Quotation'] },
  { title: 'Settings', icon: '⚙️', children: ['Opening Balance', 'Products', 'Low Stock', 'Users', 'Customer Products'] },
]

export default function Sidebar(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.is_admin
  const [active,setActive] = useState('Dashboard')
  const [open,setOpen] = useState(true)
  const [expanded,setExpanded] = useState({})

  return (
    <aside className={`sidebar ${open? 'open':'closed'}`}>
      <div className="brand">
        <div className="logo">IP</div>
        <div className="brand-text">
          <h1>Inventory</h1>
          <div className="brand-sub">Admin Panel</div>
        </div>
        <button className="mobile-toggle" onClick={()=>setOpen(!open)}>{open? '✖':'☰'}</button>
      </div>

      <nav className="nav-list">
        {sections.filter(s=> {
          // hide Settings and Users for non-admins
          if(!isAdmin && s.title === 'Settings') return false
          return true
        }).map(s=> (
          <div key={s.title} className={`nav-section ${active===s.title? 'active':''}`}>
            <div className="nav-item" onClick={()=>{ setActive(s.title); if(s.children) setExpanded(p=>({...p,[s.title]:!p[s.title]})) }}>
              <span className="nav-icon">{s.icon}</span>
              <span className="nav-title">{s.title}</span>
              {s.children? <span className={`chev ${expanded[s.title]? 'open':''}`}>▾</span>:null}
            </div>

            {s.children && expanded[s.title] && (
              <div className="subitems">
                {s.children.map(c=> <div key={c} className={`subitem ${active===c? 'active':''}`} onClick={()=>setActive(c)}>{c}</div>)}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{user ? user.name : 'Guest'}</div>
      </div>

    </aside>
  )
}
