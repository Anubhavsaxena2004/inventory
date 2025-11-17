import React from 'react'
import Sidebar from './components/Sidebar'
import './App.css'
import { useEffect, useState } from 'react'
import AddCustomer from './components/AddCustomer'
import AddOrder from './components/AddOrder'
import Login from './components/Login'
import AdminLogin from './components/AdminLogin'
import { useContext } from 'react'
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
  const { logout } = useContext(AuthContext)
  React.useEffect(() => {
    logout('manual')
    window.location.href = '/admin-login/'
  }, [logout])
  return <div>Logging out...</div>
}

// Ensure unified stylesheet is imported after component-level CSS so its rules take precedence
import './styles/unified.css'

function StatCard({ number, label, color }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-number">{number}</div>
      </div>
      <div className="stat-badge" style={{background: color}} />
    </div>
  )
}

export default function App(){
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const { user, logout } = useContext(AuthContext)
  const [creditors, setCreditors] = useState([])
  const [latestExpenses, setLatestExpenses] = useState([])
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/admin-login')

  // Ensure the app starts on admin login when no hash is present
  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/admin-login'
    }
  }, [])

  // Enforce auth: redirect to admin-login if not logged in
  React.useEffect(() => {
    // If user is not logged in and trying to access any page other than admin-login, force redirect
    if (!user) {
      if (window.location.hash && window.location.hash !== '#/admin-login') {
        window.location.hash = '#/admin-login'
      }
    } else {
      // If logged in and still on admin-login, go to dashboard
      if (window.location.hash === '#/admin-login' || window.location.hash === '#/login') {
        window.location.hash = '#/'
      }
    }
  }, [user, currentHash])

  useEffect(()=>{
    fetch('/api/orders/view/')
      .then(r=>r.json())
      .then(data=>{
        setOrders(data.orders || [])
      }).catch(console.error)

    fetch('/api/customers/view/')
      .then(r=>r.json())
      .then(data=>{
        setCustomers(data.customers || [])
      }).catch(console.error)

    fetch('/api/orders/market-creditors/')
      .then(r=>r.json())
      .then(d=> setCreditors(d.creditors || []))
      .catch(()=>{})

    fetch('/api/expense/list/')
      .then(r=>r.json())
      .then(d=> setLatestExpenses(d.expenses || []))
      .catch(()=>{})
  },[])

  useEffect(()=>{
    const onHash = ()=> setCurrentHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  const isAuthRoute = currentHash === '#/admin-login' || currentHash === '#/login'

  return (
    <div className={`app-shell ${isAuthRoute ? 'auth-shell' : ''}`}>
      {!isAuthRoute && <Sidebar currentHash={currentHash} />}
      <main className={`main-content ${isAuthRoute ? 'auth-main' : ''}`}>
        {!isAuthRoute && (
        <nav style={{marginBottom:20, display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e5e7eb'}}>
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
  {window.location.hash === '#/admin-login' ? <AdminLogin /> : window.location.hash === '#/login' ? <Login /> : window.location.hash === '#/add-customer' ? <AddCustomer setCustomers={setCustomers} /> : window.location.hash === '#/add-order' ? <AddOrder customers={customers} setCustomers={setCustomers} user={user} logout={logout} /> : window.location.hash === '#/products' ? <Products /> : window.location.hash === '#/suppliers' ? <Suppliers /> : window.location.hash === '#/expenses' ? <Expenses /> : window.location.hash === '#/view-orders' ? <ViewOrders /> : window.location.hash === '#/market-creditors' ? <MarketCreditors /> : window.location.hash === '#/payment-voucher' ? <PaymentVoucher /> : window.location.hash === '#/reporting-monthly' ? <ReportingMonthly /> : window.location.hash === '#/reporting-cash' ? <ReportingCash /> : window.location.hash === '#/opening-balance' ? <OpeningBalance /> : window.location.hash === '#/low-stock' ? <LowStock /> : window.location.hash === '#/users' ? <Users /> : window.location.hash === '#/customer-products' ? <CustomerProducts /> : window.location.hash === '#/view-customers' ? <ViewCustomers /> : window.location.hash === '#/supplier-ledger' ? <SupplierLedger /> : window.location.hash === '#/view-quotation' ? <ViewQuotation /> : window.location.hash === '#/add-quotation' ? <AddQuotation /> : window.location.hash === '#/logout' ? <Logout /> : (
        <>
        <header className="dashboard-header">
          <h2>Dashboard</h2>
          <div className="welcome">Welcome back, Admin</div>
        </header>

        <section className="cards-grid">
          <StatCard number={String(orders.length)} label="Total Orders" color="#06b6d4" />
          <StatCard number={String(orders.filter(o=>o.status==='pending').length)} label="Pending Orders" color="#f59e0b" />
          <StatCard number={String(orders.filter(o=>o.status==='completed').length)} label="Completed Orders" color="#10b981" />
          <StatCard number={String(orders.filter(o=>o.status==='working').length)} label="Working Orders" color="#ef4444" />
        </section>

        <section className="table-container">
          <div className="card table-card">
            <h3>Dashboard Data</h3>
            <div className="table-wrap">
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
                  {/* Pending Orders */}
                  {orders.filter(o => o.status === 'pending').slice(0, 5).map(o => (
                    <tr key={`pending-${o.id}`}>
                      <td>Pending Order</td>
                      <td>{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td>{o.total_bill}</td>
                      <td>{o.order_date}</td>
                      <td>Pending</td>
                    </tr>
                  ))}
                  {/* Completed Orders */}
                  {orders.filter(o => o.status === 'completed').slice(0, 5).map(o => (
                    <tr key={`completed-${o.id}`}>
                      <td>Completed Order</td>
                      <td>{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td>{o.total_bill}</td>
                      <td>{o.order_date}</td>
                      <td>Completed</td>
                    </tr>
                  ))}
                  {/* Market Creditors */}
                  {creditors.slice(0, 5).map(c => (
                    <tr key={`creditor-${c.id}`}>
                      <td>Market Creditor</td>
                      <td>{c.id}</td>
                      <td>{c.customer_name}</td>
                      <td>{c.balance}</td>
                      <td>{c.order_date}</td>
                      <td>Creditor</td>
                    </tr>
                  ))}
                  {/* Latest Expenses */}
                  {latestExpenses.slice(0, 5).map(e => (
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
          </div>
        </section>

        <section className="card">
          <h3>Customers</h3>
          <ul>
            {customers.slice(0,10).map(c=> <li key={c.id}>{c.name} — {c.phone}</li>)}
          </ul>
        </section>
        </>
        )}
      </main>
    </div>
  )
}
