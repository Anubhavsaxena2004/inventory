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

export default function Sidebar({ currentHash }){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.is_admin
  const [open,setOpen] = useState(true)
  // derive active from currentHash when provided
  const hashToTitle = {
    '#/': 'Dashboard',
    '#/reporting-monthly': 'Monthly Report',
    '#/reporting-cash': 'Cash Report',
    '#/add-order': 'Add Order',
    '#/view-orders': 'View Orders',
    '#/market-creditors': 'Market Creditors',
    '#/payment-voucher': 'Payment Voucher',
    '#/add-customer': 'Add Customer',
    '#/view-customers': 'View Customers',
    '#/suppliers': 'View Suppliers',
    '#/supplier-ledger': 'Supplier Ledger',
    '#/employee': 'Employee',
    '#/expenses': 'Expense',
    '#/view-quotation': 'View Quotation',
    '#/add-quotation': 'Add Quotation',
    '#/opening-balance': 'Opening Balance',
    '#/products': 'Products',
    '#/low-stock': 'Low Stock',
    '#/users': 'Users',
    '#/customer-products': 'Customer Products'
  }
  const [active,setActive] = useState(hashToTitle[currentHash || '#/'] || 'Dashboard')
  const [expanded,setExpanded] = useState({})

  // keep active synced when hash changes
  React.useEffect(()=>{
    if(currentHash){
      const t = hashToTitle[currentHash] || 'Dashboard'
      setActive(t)
      // expand parent section if it's a submenu
      const parentMap = {
        'Monthly Report':'Reporting', 'Cash Report':'Reporting',
        'Add Order':'Orders','View Orders':'Orders','Market Creditors':'Orders','Payment Voucher':'Orders',
        'Add Customer':'Customers','View Customers':'Customers',
        'View Suppliers':'Suppliers','Supplier Ledger':'Suppliers',
        'View Quotation':'Quotation','Add Quotation':'Quotation',
        'Opening Balance':'Settings','Products':'Settings','Low Stock':'Settings','Users':'Settings','Customer Products':'Settings'
      }
      const p = parentMap[t]
      if(p) setExpanded(prev=>({ ...prev, [p]: true }))
    }
  },[currentHash])

  function handleClick(title, children) {
    setActive(title)
    if (children) {
      setExpanded(p => ({ ...p, [title]: !p[title] }))
    } else {
      // Navigate to the page
      const hashMap = {
        'Dashboard': '#/',
        'Monthly Report': '#/reporting-monthly',
        'Cash Report': '#/reporting-cash',
        'Add Order': '#/add-order',
        'View Orders': '#/view-orders',
        'Market Creditors': '#/market-creditors',
        'Payment Voucher': '#/payment-voucher',
        'Add Customer': '#/add-customer',
        'View Customers': '#/view-customers',
        'View Suppliers': '#/suppliers',
        'Supplier Ledger': '#/supplier-ledger',
        'Employee': '#/employee',
        'Expense': '#/expenses',
        'View Quotation': '#/view-quotation',
        'Add Quotation': '#/add-quotation',
        'Opening Balance': '#/opening-balance',
        'Products': '#/products',
        'Low Stock': '#/low-stock',
        'Users': '#/users',
        'Customer Products': '#/customer-products'
      }
      window.location.hash = hashMap[title] || '#/'
    }
  }

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
            <div className="nav-item" onClick={() => handleClick(s.title, s.children)}>
              <span className="nav-icon">{s.icon}</span>
              <span className="nav-title">{s.title}</span>
              {s.children? <span className={`chev ${expanded[s.title]? 'open':''}`}>▾</span>:null}
            </div>

            {s.children && expanded[s.title] && (
              <div className="subitems">
                {s.children.map(c=> <div key={c} className={`subitem ${active===c? 'active':''}`} onClick={() => handleClick(c)}>{c}</div>)}
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
