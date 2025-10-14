import React from 'react'
import Sidebar from './components/Sidebar'
import './App.css'
import { useEffect, useState } from 'react'
import AddCustomer from './components/AddCustomer'
import AddOrder from './components/AddOrder'
import Login from './components/Login'
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

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <nav style={{marginBottom:12}}>
          <a href="#/">Dashboard</a> | <a href="#/add-customer">Add Customer</a> | <a href="#/add-order">Add Order</a> | <a href="#/view-orders">View Orders</a> | <a href="#/market-creditors">Market Creditors</a> | <a href="#/payment-voucher">Payment Voucher</a>
        </nav>
  {window.location.hash === '#/login' ? <Login /> : window.location.hash === '#/add-customer' ? <AddCustomer setCustomers={setCustomers} /> : window.location.hash === '#/add-order' ? <AddOrder customers={customers} setCustomers={setCustomers} user={user} logout={logout} /> : window.location.hash === '#/products' ? <Products /> : window.location.hash === '#/suppliers' ? <Suppliers /> : window.location.hash === '#/expenses' ? <Expenses /> : window.location.hash === '#/view-orders' ? <ViewOrders /> : window.location.hash === '#/market-creditors' ? <MarketCreditors /> : window.location.hash === '#/payment-voucher' ? <PaymentVoucher /> : window.location.hash === '#/reporting-monthly' ? <ReportingMonthly /> : window.location.hash === '#/reporting-cash' ? <ReportingCash /> : window.location.hash === '#/opening-balance' ? <OpeningBalance /> : window.location.hash === '#/low-stock' ? <LowStock /> : window.location.hash === '#/users' ? <Users /> : window.location.hash === '#/customer-products' ? <CustomerProducts /> : window.location.hash === '#/view-customers' ? <ViewCustomers /> : window.location.hash === '#/supplier-ledger' ? <SupplierLedger /> : window.location.hash === '#/view-quotation' ? <ViewQuotation /> : window.location.hash === '#/add-quotation' ? <AddQuotation /> : (
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

        <section className="tables-grid">
          <div className="card table-card">
            <h3>Latest Pending Orders</h3>
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Total Bill</th><th>Date</th></tr>
              </thead>
                <tbody>
                  {orders.slice(0,5).map(o=> (
                    <tr key={o.id}><td>{o.id}</td><td>{o.customer_name}</td><td>{o.total_bill}</td><td>{o.order_date}</td></tr>
                  ))}
                </tbody>
            </table>
          </div>

          <div className="card table-card">
            <h3>Latest Completed Orders</h3>
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Completed Date</th></tr>
              </thead>
              <tbody>
                {orders.filter(o=> o.status==='completed').slice(0,5).map(o=> (
                  <tr key={o.id}><td>{o.id}</td><td>{o.customer_name}</td><td>{o.order_date}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="tables-grid">
          <div className="card table-card">
            <h3>Market Orders (Creditors)</h3>
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {creditors.slice(0,5).map(c=> (
                  <tr key={c.id}><td>{c.id}</td><td>{c.customer_name}</td><td>{c.balance}</td><td>{c.order_date}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card table-card">
            <h3>Latest Expenses</h3>
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {latestExpenses.slice(0,5).map(e=> (
                  <tr key={e.id}><td>{e.type}</td><td>{e.amount}</td><td>{e.date}</td></tr>
                ))}
              </tbody>
            </table>
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
