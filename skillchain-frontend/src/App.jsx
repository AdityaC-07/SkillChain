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
import FraudPage from './pages/FraudPage'
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
    <div className="w-full bg-red-100 border-b border-red-200 text-red-800 text-center py-2 fixed top-0 z-50">
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

const Footer = () => (
  <footer className="border-t border-[#EAE3DC] py-8 mt-auto bg-[#FDFBFA]">
    <div className="w-full px-10 flex items-center justify-between">
      <div>
        <div className="text-xl font-black tracking-tight text-[#994914] mb-2">
          SKILLCHAIN
        </div>
        <p className="text-[11px] text-[#8B8276] max-w-sm leading-tight">
          © 2024 SkillChain. Education verified on blockchain.<br/>
          Empowering vocational excellence through trust.
        </p>
      </div>
      
      <div className="flex items-center space-x-6 text-[11px] font-medium text-[#5C5854]">
        <a href="#" className="hover:text-[#994914]">Terms of Service</a>
        <a href="#" className="hover:text-[#994914]">Privacy Policy</a>
        <a href="#" className="hover:text-[#994914]">Contact Support</a>
        <div className="flex space-x-3 ml-4">
          <div className="w-8 h-8 bg-[#F5F1EB] rounded-full"></div>
          <div className="w-8 h-8 bg-[#F5F1EB] rounded-full"></div>
        </div>
      </div>
    </div>
  </footer>
)

export default function App(){
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-[#FDFBFA] font-sans flex flex-col text-[#1A1816]">
      <OfflineBanner />
      <Navbar onToggleSidebar={()=> setSidebarOpen(s=>!s)} />
      
      <div className="w-full flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={()=> setSidebarOpen(false)} />
        
        <div className="flex-1 min-w-0 lg:ml-72 flex flex-col min-h-screen">
          <main id="main" className="flex-1 px-6 lg:px-10 pt-[100px] pb-12 w-full">
            <Routes>
              <Route path="/" element={<LandingPage/>} />
              <Route path="/verify" element={<VerifyPage/>} />
              <Route path="/login" element={<LoginPage/>} />
              <Route path="/register" element={<RegisterPage/>} />
              <Route path="/dashboard/institute" element={<ProtectedRoute role="institute"><InstituteDashboard/></ProtectedRoute>} />
              <Route path="/dashboard/learner" element={<ProtectedRoute role="learner"><LearnerDashboard/></ProtectedRoute>} />
              <Route path="/certificates/issue" element={<ProtectedRoute role="institute"><IssueCertificatePage/></ProtectedRoute>} />
              <Route path="/certificates/:id" element={<ProtectedRoute><CertificateDetailPage/></ProtectedRoute>} />
              <Route path="/fraud" element={<ProtectedRoute><FraudPage/></ProtectedRoute>} />
              <Route path="/about" element={<AboutPage/>} />
              <Route path="/demo" element={<DemoRedirect/>} />
              <Route path="*" element={<NotFoundPage/>} />
            </Routes>
          </main>
          
          <div className="mt-auto w-full">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
