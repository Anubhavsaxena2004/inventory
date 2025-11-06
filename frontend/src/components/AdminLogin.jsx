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
    // Hardcoded admin credential as requested
    if (adminId === '123456789' && password === 'password') {
      // Log in via AuthProvider so other components know the user
      try{
        // simple static token and user object for admin
        login('admin-token', { name: 'Admin', is_admin: true })
      }catch(e){/* ignore */}
      // navigate to dashboard
      window.location.hash = '#/';
    } else {
      setError('Invalid admin ID or password');
    }
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
