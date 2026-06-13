import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, role }){
  const auth = useAuth()
  if (!auth?.isAuthenticated) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/" replace />
  return children
}
