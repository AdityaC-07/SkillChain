import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import VerifyPage from './pages/VerifyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics'
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
  React.useEffect(() => {
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
    localStorage.setItem('token', 'demo-token')
    window.location.href = '/certificates/issue'
  }, [])
  return null
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col pt-4 relative animate-pulse">
      <div className="h-8 bg-[#EAE3DC] rounded-lg w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 bg-[#EAE3DC] rounded-xl mb-4" />
            <div className="h-3 bg-[#EAE3DC] rounded w-24 mb-2" />
            <div className="h-8 bg-[#EAE3DC] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm h-64" />
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm h-64" />
      </div>
    </div>
  )
}

const Footer = () => (
  <footer className="border-t border-[#EAE3DC] py-8 mt-auto bg-[#FDFBFA]">
    <div className="w-full px-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-black tracking-tight text-[#994914] mb-2">
            SKILLCHAIN
          </div>
          <p className="text-[11px] text-[#8B8276] max-w-sm leading-tight">
            © 2026 SkillChain. Education verified on blockchain.<br/>
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
      <div className="border-t border-[#EAE3DC] pt-4 text-center">
        <p className="text-[10px] text-[#8B8276] font-medium tracking-wide">
          Powered by Polygon · IPFS · HuggingFace AI
        </p>
      </div>
    </div>
  </footer>
)

export default function App(){
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [initialLoading, setInitialLoading] = React.useState(true)
  const location = useLocation()

  React.useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 250)
    return () => clearTimeout(timer)
  }, [])

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBFA] font-sans flex flex-col text-[#1A1816]">
        <Navbar onToggleSidebar={()=> setSidebarOpen(s=>!s)} />
        <div className="w-full flex flex-1">
          <div className="hidden lg:block w-72 shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col min-h-screen">
            <main className="flex-1 px-6 lg:px-10 pt-[100px] pb-12 w-full max-w-7xl mx-auto">
              <LoadingSkeleton />
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBFA] font-sans flex flex-col text-[#1A1816]">
      <OfflineBanner />
      <Navbar onToggleSidebar={()=> setSidebarOpen(s=>!s)} />
      
      <div className="w-full flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={()=> setSidebarOpen(false)} />
        
        <div className="flex-1 min-w-0 lg:ml-72 flex flex-col min-h-screen">
          <main id="main" className="flex-1 px-6 lg:px-10 pt-[100px] pb-12 w-full max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedPage><LandingPage/></AnimatedPage>} />
                <Route path="/verify" element={<AnimatedPage><VerifyPage/></AnimatedPage>} />
                <Route path="/login" element={<AnimatedPage><LoginPage/></AnimatedPage>} />
                <Route path="/register" element={<AnimatedPage><RegisterPage/></AnimatedPage>} />
                <Route path="/dashboard" element={<AnimatedPage><DashboardAnalytics/></AnimatedPage>} />
                <Route path="/dashboard/institute" element={<AnimatedPage><ProtectedRoute role="institute"><InstituteDashboard/></ProtectedRoute></AnimatedPage>} />
                <Route path="/dashboard/learner" element={<AnimatedPage><ProtectedRoute role="learner"><LearnerDashboard/></ProtectedRoute></AnimatedPage>} />
                <Route path="/certificates/issue" element={<AnimatedPage><IssueCertificatePage/></AnimatedPage>} />
                <Route path="/certificates/:id" element={<AnimatedPage><ProtectedRoute><CertificateDetailPage/></ProtectedRoute></AnimatedPage>} />
                <Route path="/fraud" element={<AnimatedPage><FraudPage/></AnimatedPage>} />
                <Route path="/about" element={<AnimatedPage><AboutPage/></AnimatedPage>} />
                <Route path="/demo" element={<DemoRedirect/>} />
                <Route path="*" element={<AnimatedPage><NotFoundPage/></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
          </main>
          
          <div className="mt-auto w-full">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
