import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import VerifyPage from './pages/VerifyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import InstituteDashboard from './pages/dashboard/InstituteDashboard'
import LearnerDashboard from './pages/dashboard/LearnerDashboard'
import CertificateDetailPage from './pages/dashboard/CertificateDetailPage'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'

export default function App(){
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      <Navbar onToggleSidebar={()=> setSidebarOpen(s=>!s)} />
      <div className="container mx-auto px-4 py-8 flex gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={()=> setSidebarOpen(false)} />
        <main id="main" className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/verify" element={<VerifyPage/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />

            <Route path="/dashboard/institute" element={<ProtectedRoute role="institute"><InstituteDashboard/></ProtectedRoute>} />
            <Route path="/dashboard/learner" element={<ProtectedRoute role="learner"><LearnerDashboard/></ProtectedRoute>} />
            <Route path="/certificates/:id" element={<ProtectedRoute><CertificateDetailPage/></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
