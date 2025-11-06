import React, { useState, useContext } from 'react';
import './Login.css'; // Assuming you have a CSS file for styling
import { AuthContext } from '../auth/AuthProvider'

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext)

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send credentials to backend login endpoint
    fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminId, password })
    }).then(async res => {
      if(res.ok){
        const data = await res.json()
        login(data.token, data.user)
        window.location.hash = '#/'
      } else if(res.status === 409){
        setError('This admin is already logged in from another session')
      } else {
        const j = await res.json().catch(()=>({}));
        setError(j.error || 'Invalid admin ID or password')
      }
    }).catch(()=> setError('Network error'))
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="adminId">Admin ID:</label>
          <input
            type="text"
            id="adminId"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
