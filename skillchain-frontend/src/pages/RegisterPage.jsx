import React, { useState } from 'react'
import { register as apiRegister } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await apiRegister({email, password})
      nav('/login')
    }catch(err){
      alert(err.response?.data?.detail || 'Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl">Register</h1>
      <form onSubmit={submit} className="mt-4">
        <input className="w-full border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2 mt-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="mt-3 bg-amber px-4 py-2 rounded">Create account</button>
      </form>
    </div>
  )
}
