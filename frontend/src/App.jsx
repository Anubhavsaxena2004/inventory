// src/App.jsx
import React, { useEffect, useState, useContext } from 'react'
import Sidebar from './components/Sidebar'
import './App.css'
import './styles/unified.css' // if you import before build; in production you are serving cs.css

import AddCustomer from './components/AddCustomer'
import AddOrder from './components/AddOrder'
import Login from './components/Login'
import AdminLogin from './components/AdminLogin'
import { AuthContext } from './auth/AuthProvider'
import Products from './components/Products'
import Suppliers from './components/Suppliers'
import Expenses from './components/Expenses'
import ViewOrders from './components/ViewOrders'
import MarketCreditors from './components/MarketCreditors'
import PaymentVoucher from './components/PaymentVoucher'
import ReportingMonthly from './components/ReportingMonthly'
import ReportingCash from './components/ReportingCash'
import OpeningBalance from './components/OpeningBalance'
import LowStock from './components/LowStock'
import Users from './components/Users'
import CustomerProducts from './components/CustomerProducts'
import ViewCustomers from './components/ViewCustomers'
import SupplierLedger from './components/SupplierLedger'
import ViewQuotation from './components/ViewQuotation'
import AddQuotation from './components/AddQuotation'

function Logout() {
  useEffect(() => {
    fetch('/api/settings/logout/', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .finally(() => {
        window.location.hash = '#/admin-login'
        window.location.href = '/admin-login/'
      })
  }, [])
  return <div className="card">Logging out...</div>
}

function StatCard({ number, label, color }) {
  return (
    <div className="card stat-card" role="status" aria-label={`${label}: ${number}`}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-number">{number}</div>
      </div>
      <div className="stat-badge" style={{ background: color }} aria-hidden />
    </div>
  )
}

export default function App() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [creditors, setCreditors] = useState([])
  const [latestExpenses, setLatestExpenses] = useState([])
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/admin-login')

  const { user, logout } = useContext(AuthContext)

  useEffect(() => {
    const onHash = () => setCurrentHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/admin-login'
      setCurrentHash('#/admin-login')
    }
  }, [])

  useEffect(() => {
    if (!user) {
      if (currentHash && currentHash !== '#/admin-login') {
        window.location.hash = '#/admin-login'
        setCurrentHash('#/admin-login')
      }
    } else {
      if (currentHash === '#/admin-login' || currentHash === '#/login') {
        window.location.hash = '#/'
        setCurrentHash('#/')
      }
    }
  }, [user, currentHash])

  useEffect(() => {
    let mounted = true
    fetch('/api/orders/view/').then(r => r.json()).then(data => mounted && setOrders(data.orders || [])).catch(()=>{})
    fetch('/api/customers/view/').then(r => r.json()).then(data => mounted && setCustomers(data.customers || [])).catch(()=>{})
    fetch('/api/orders/market-creditors/').then(r => r.json()).then(d => mounted && setCreditors(d.creditors || [])).catch(()=>{})
    fetch('/api/expense/list/').then(r => r.json()).then(d => mounted && setLatestExpenses(d.expenses || [])).catch(()=>{})
    return () => { mounted = false }
  }, [])

  const isAuthRoute = currentHash === '#/admin-login' || currentHash === '#/login'

  const renderRoute = () => {
    switch (currentHash) {
      case '#/admin-login': return <AdminLogin />
      case '#/login': return <Login />
      case '#/add-customer': return <AddCustomer setCustomers={setCustomers} />
      case '#/add-order': return <AddOrder customers={customers} setCustomers={setCustomers} user={user} logout={logout} />
      case '#/products': return <Products />
      case '#/suppliers': return <Suppliers />
      case '#/expenses': return <Expenses />
      case '#/view-orders': return <ViewOrders />
      case '#/market-creditors': return <MarketCreditors />
      case '#/payment-voucher': return <PaymentVoucher />
      case '#/reporting-monthly': return <ReportingMonthly />
      case '#/reporting-cash': return <ReportingCash />
      case '#/opening-balance': return <OpeningBalance />
      case '#/low-stock': return <LowStock />
      case '#/users': return <Users />
      case '#/customer-products': return <CustomerProducts />
      case '#/view-customers': return <ViewCustomers />
      case '#/supplier-ledger': return <SupplierLedger />
      case '#/view-quotation': return <ViewQuotation />
      case '#/add-quotation': return <AddQuotation />
      case '#/logout': return <Logout />
      default: return null
    }
  }

  return (
    <div className={`app-shell ${isAuthRoute ? 'auth-shell' : ''}`}>
      {!isAuthRoute && <Sidebar currentHash={currentHash} />}
      <main className={`main-content ${isAuthRoute ? 'auth-main' : ''}`}>
        {!isAuthRoute && (
          <nav style={{marginBottom:20, display:'flex', flexWrap:'wrap', gap:'12px', padding:'12px 0', borderBottom:'1px solid #e5e7eb'}} aria-label="Primary navigation">
            <a href="#/admin-login">🔐 Admin Login</a> |
            <a href="#/">📊 Dashboard</a> |
            <a href="#/add-customer">👥 Add Customer</a> |
            <a href="#/add-order">🧾 Add Order</a> |
            <a href="#/view-orders">📋 View Orders</a> |
            <a href="#/market-creditors">💰 Market Creditors</a> |
            <a href="#/payment-voucher">💳 Payment Voucher</a> |
            <a href="#/supplier-ledger">📈 Supplier Ledger</a>
          </nav>
        )}

        {isAuthRoute ? (
          renderRoute()
        ) : (
          <>
            {currentHash === '#/' || currentHash === '' || currentHash === '#/dashboard' ? (
              <>
                <header className="dashboard-header">
                  <h2>Dashboard</h2>
                  <div className="welcome">Welcome back, Admin</div>
                </header>

                <section className="cards-grid" aria-label="Key statistics">
                  <StatCard number={String(orders.length)} label="Total Orders" color="#06b6d4" />
                  <StatCard number={String(orders.filter(o => o.status === 'pending').length)} label="Pending Orders" color="#f59e0b" />
                  <StatCard number={String(orders.filter(o => o.status === 'completed').length)} label="Completed Orders" color="#10b981" />
                  <StatCard number={String(orders.filter(o => o.status === 'working').length)} label="Working Orders" color="#ef4444" />
                </section>

                <section className="table-container card" aria-labelledby="dashboard-data-heading">
                  <h3 id="dashboard-data-heading">Dashboard Data</h3>

                  <div className="table-wrap" role="region" aria-label="Recent dashboard items">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Amount/Bill</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.status === 'pending').slice(0,5).map(o => (
                          <tr key={`pending-${o.id}`}>
                            <td>Pending Order</td>
                            <td>{o.id}</td>
                            <td><span className="cell-truncate" title={o.customer_name || ''}>{o.customer_name || '-'}</span></td>
                            <td>{o.total_bill}</td>
                            <td>{o.order_date}</td>
                            <td>Pending</td>
                          </tr>
                        ))}

                        {orders.filter(o => o.status === 'completed').slice(0,5).map(o => (
                          <tr key={`completed-${o.id}`}>
                            <td>Completed Order</td>
                            <td>{o.id}</td>
                            <td><span className="cell-truncate" title={o.customer_name || ''}>{o.customer_name || '-'}</span></td>
                            <td>{o.total_bill}</td>
                            <td>{o.order_date}</td>
                            <td>Completed</td>
                          </tr>
                        ))}

                        {creditors.slice(0,5).map(c => (
                          <tr key={`creditor-${c.id}`}>
                            <td>Market Creditor</td>
                            <td>{c.id}</td>
                            <td><span className="cell-truncate" title={c.customer_name || ''}>{c.customer_name || '-'}</span></td>
                            <td>{c.balance}</td>
                            <td>{c.order_date}</td>
                            <td>Creditor</td>
                          </tr>
                        ))}

                        {latestExpenses.slice(0,5).map(e => (
                          <tr key={`expense-${e.id}`}>
                            <td>Expense</td>
                            <td>{e.id}</td>
                            <td>-</td>
                            <td>{e.amount}</td>
                            <td>{e.date}</td>
                            <td>{e.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : renderRoute()}
          </>
        )}
      </main>
    </div>
  )
}
