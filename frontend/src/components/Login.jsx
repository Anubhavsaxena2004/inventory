import React, {useState, useContext} from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function Login(){
  const [form, setForm] = useState({email:'', password:''})
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)

  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      const res = await fetch('/api/auth/login/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const d = await res.json()
      if(res.ok && d.token){
        login(d.token, d.user)
      } else {
        setError(d.error || JSON.stringify(d))
      }
    }catch(err){ setError(String(err)) }
  }

  return (
    <div className="card small-card">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div className="form-row"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
        <div className="form-row"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
        <div className="form-row"><button className="btn primary" type="submit">Login</button></div>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
