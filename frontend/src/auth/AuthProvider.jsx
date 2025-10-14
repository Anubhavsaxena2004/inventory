import React, {createContext, useEffect, useState} from 'react'

export const AuthContext = createContext({ user: null, token: null, login: ()=>{}, logout: ()=>{} })

export function AuthProvider({children}){
  const [user, setUser] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('user')) }catch(e){return null}
  })
  const [token, setToken] = useState(()=> localStorage.getItem('token'))

  useEffect(()=>{
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },[token])
  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },[user])

  function login(newToken, newUser){ setToken(newToken); setUser(newUser) }
  function logout(){ setToken(null); setUser(null) }

  return (
    <AuthContext.Provider value={{user, token, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}
