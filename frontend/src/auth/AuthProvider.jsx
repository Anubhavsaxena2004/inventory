import React, {createContext, useEffect, useState, useCallback} from 'react'

export const AuthContext = createContext({ user: null, token: null, login: ()=>{}, logout: ()=>{} })

export function AuthProvider({children}){
  const [user, setUser] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('user')) }catch(e){return null}
  })
  const [token, setToken] = useState(()=> localStorage.getItem('token'))

  // Inactivity timeout: 30 minutes
  const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

  useEffect(()=>{
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },[token])
  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },[user])

  // Validate token with server on mount/loading to ensure it's still the active session
  useEffect(()=>{
    async function validate(){
      const t = localStorage.getItem('token')
      if(!t) return
      try{
        const res = await fetch('/api/auth/me/', { headers: { 'Authorization': 'Bearer ' + t } })
        if(res.status === 200){
          const d = await res.json()
          // ensure user object matches server
          if(d && d.user){
            setUser(d.user)
          }
        } else {
          // invalid or not active session
          logout()
        }
      }catch(e){
        // network errors — be conservative and keep client state
      }
    }
    validate()
    // run only once on mount
  }, [])

  const logout = useCallback(()=>{
    // attempt server logout
    try{
      const t = localStorage.getItem('token')
      if(t){
        fetch('/api/auth/logout/', { method: 'POST', headers: { 'Authorization': 'Bearer ' + t } }).catch(()=>{})
      }
    }catch(e){}
    setToken(null);
    setUser(null);
    try{ localStorage.removeItem('lastActivity') }catch(e){}
  },[])

  const login = useCallback((newToken, newUser)=>{
    setToken(newToken);
    setUser(newUser);
    try{ localStorage.setItem('lastActivity', Date.now().toString()) }catch(e){}
  },[])

  // Activity tracking: update lastActivity on user interactions
  useEffect(()=>{
    function updateActivity(){
      try{ localStorage.setItem('lastActivity', Date.now().toString()) }catch(e){}
    }

    // When user logs in, ensure we have an initial timestamp
    if(user && !localStorage.getItem('lastActivity')) updateActivity()

    const events = ['click','mousemove','keydown','touchstart','scroll']
    events.forEach(evt => window.addEventListener(evt, updateActivity, {passive:true}))
    window.addEventListener('focus', updateActivity)
    window.addEventListener('visibilitychange', ()=>{ if(!document.hidden) updateActivity() })

    // Poll to check expiration. We run this only when a user is present.
    let intervalId = null
    if(user){
      intervalId = setInterval(()=>{
        try{
          const last = parseInt(localStorage.getItem('lastActivity') || '0', 10)
          if(last && Date.now() - last > TIMEOUT_MS){
            // expire session
            logout()
            // Redirect to admin login page so user must re-authenticate
            try{ window.location.hash = '#/admin-login' }catch(e){}
            // Optional: notify
            try{ if(typeof window !== 'undefined') window.alert('Session expired due to inactivity. Please log in again.') }catch(e){}
          }
        }catch(e){ /* ignore read errors */ }
      }, 10_000) // check every 10s
    }

    return ()=>{
      events.forEach(evt => window.removeEventListener(evt, updateActivity))
      window.removeEventListener('focus', updateActivity)
      window.removeEventListener('visibilitychange', ()=>{ if(!document.hidden) updateActivity() })
      if(intervalId) clearInterval(intervalId)
    }
  }, [user, logout])

  return (
    <AuthContext.Provider value={{user, token, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}
