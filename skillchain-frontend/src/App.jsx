import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import VerifyPage from './pages/VerifyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import InstituteDashboard from './pages/dashboard/InstituteDashboard'
import LearnerDashboard from './pages/dashboard/LearnerDashboard'
import IssueCertificatePage from './pages/dashboard/IssueCertificatePage'
import CertificateDetailPage from './pages/dashboard/CertificateDetailPage'
import AboutPage from './pages/AboutPage'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import NotFoundPage from './pages/NotFoundPage'
import { useOnlineStatus } from './hooks/useOnlineStatus'

function OfflineBanner(){
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="w-full bg-red-100 border-b border-red-200 text-red-800 text-center py-2">
      You&apos;re offline — some features may not work
    </div>
  )
}

function DemoRedirect() {
  const navigate = useNavigate()
  React.useEffect(() => {
    // Store demo data in localStorage
    const demoData = {
      learner_name: 'Ravi Kumar',
      learner_email: 'ravi.kumar@example.com',
      learner_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      course_name: 'Welding NSQF Level 4',
      completion_date: '2024-06-15',
      grade: 'A',
    }
    localStorage.setItem('demoFormData', JSON.stringify(demoData))
    localStorage.setItem('demoMode', 'true')
    navigate('/certificates/issue')
  }, [navigate])
  return null
}

export default function App(){
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      <OfflineBanner />
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
            <Route path="/certificates/issue" element={<ProtectedRoute role="institute"><IssueCertificatePage/></ProtectedRoute>} />
            <Route path="/certificates/:id" element={<ProtectedRoute><CertificateDetailPage/></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage/>} />
            <Route path="/demo" element={<DemoRedirect/>} />
            <Route path="*" element={<NotFoundPage/>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
