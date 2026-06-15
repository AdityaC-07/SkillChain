import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onToggleSidebar=()=>{} }) {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-[#FDFBFA]/90 backdrop-blur-md border-b border-[#EAE3DC] flex items-center justify-between py-4 px-6 lg:px-10 h-[80px]">
      <div className="flex items-center">
         <button aria-label="Open navigation" onClick={onToggleSidebar} className="lg:hidden mr-4 p-2 -ml-2 text-[#5C5854] hover:bg-[#EAE4DB] rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
         </button>
         <Link to="/" className="lg:hidden text-[22px] font-black tracking-tight text-[#994914]">
            SKILLCHAIN
          </Link>
          <span className="ml-3 text-[10px] font-black uppercase tracking-wider bg-[#FFE4B5] text-[#8B4513] px-2 py-0.5 rounded-md border border-[#C96B1E]">DEMO</span>
          <span className="hidden lg:inline-flex ml-4 text-[10px] font-black uppercase tracking-wider bg-[#FFE4B5] text-[#8B4513] px-2 py-0.5 rounded-md border border-[#C96B1E]">DEMO</span>
       </div>
      <div className="flex items-center space-x-6 lg:space-x-8 ml-auto">
        <nav className="hidden md:flex items-center space-x-6 text-[#5C5854] font-medium text-sm">
          <Link 
            to="/verify" 
            className={`hover:text-[#994914] ${location.pathname === '/verify' ? 'border-b-2 border-[#994914] text-[#994914] pb-1' : ''}`}
          >
            Verify
          </Link>
          <Link 
            to="/about" 
            className={`hover:text-[#994914] ${location.pathname === '/about' ? 'border-b-2 border-[#994914] text-[#994914] pb-1' : ''}`}
          >
            About
          </Link>
          
          {!auth?.isAuthenticated ? (
            <Link 
              to="/login" 
              className={`hover:text-[#994914] ${location.pathname === '/login' ? 'border-b-2 border-[#994914] text-[#994914] pb-1' : ''}`}
            >
              Login
            </Link>
          ) : (
            <>
              <Link 
                to={auth.role === 'institute' ? '/dashboard/institute' : '/dashboard/learner'} 
                className={`hover:text-[#994914] ${location.pathname.startsWith('/dashboard') ? 'border-b-2 border-[#994914] text-[#994914] pb-1' : ''}`}
              >
                Dashboard
              </Link>
              <button onClick={auth.logout} className="hover:text-red-500 transition-colors">
                Logout
              </button>
            </>
          )}
        </nav>
        
        {!auth?.isAuthenticated && (
          <Link to="/register" className="bg-[#8B4513] text-white px-5 lg:px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#6B3410] transition-colors whitespace-nowrap">
            Get Certified
          </Link>
        )}
      </div>
    </header>
  )
}
