import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) =>{
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      if (token){
        try{
          const { data } = await authAPI.get('/api/auth/me')
          setUser(data)
        }catch(e){
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const login = (tokenValue, userData)=>{
    localStorage.setItem('token', tokenValue)
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = ()=>{
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const value = { user, token, login, logout, isAuthenticated: !!user, role: user?.role }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = ()=> useContext(AuthContext)
