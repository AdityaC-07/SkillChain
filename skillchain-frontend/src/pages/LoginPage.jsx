import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await apiLogin({email, password})
      const token = res.data.token
      const user = res.data.user || {}
      auth.login(token, user)
      nav('/')
    }catch(err){
      alert(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl">Login</h1>
      <form onSubmit={submit} className="mt-4">
        <input className="w-full border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2 mt-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="mt-3 bg-amber px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
