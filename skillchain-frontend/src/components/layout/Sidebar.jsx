import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  FilePlus,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  FileBadge,
  User,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ isOpen=false, onClose=()=>{} }) {
  const location = useLocation()
  const auth = useAuth()
  
  let navItems = []
  
  if (auth?.role === 'learner') {
    navItems = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/dashboard/learner', label: 'My Certificates', icon: FileBadge },
      { path: '/verify', label: 'Verify', icon: ShieldCheck },
      { path: '/fraud', label: 'Report Issue', icon: AlertTriangle },
    ]
  } else {
    navItems = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/dashboard/institute', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/certificates/issue', label: 'Issue', icon: FilePlus },
      { path: '/verify', label: 'Verify', icon: ShieldCheck },
      { path: '/fraud', label: 'Fraud', icon: AlertTriangle },
    ]
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path === '/dashboard/institute' && location.pathname.startsWith('/dashboard/institute')) return true;
    if (path === '/dashboard/learner' && location.pathname.startsWith('/dashboard/learner')) return true;
    if (path === '/certificates/issue' && location.pathname.startsWith('/certificates/issue')) return true;
    return location.pathname === path;
  }

  const isIssueActive = isActive('/certificates/issue');

  const SidebarContent = () => (
    <div className="w-72 h-full flex flex-col bg-[#F5F1EB] border-r border-[#EAE3DC]">
      <div className="hidden lg:flex items-center px-8 h-[80px] border-b border-[#EAE3DC] shrink-0">
        <Link to="/" className="text-[22px] font-black tracking-tight text-[#994914]">
          SKILLCHAIN
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-8 flex items-center gap-3">
          {isIssueActive ? (
            <div className="w-10 h-10 bg-[#D97706] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               <GraduationCap className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-[#E07A25] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               {auth?.role === 'learner' ? <User className="w-5 h-5 text-white" /> : <Home className="w-5 h-5 text-white" />}
            </div>
          )}
          <div>
            <h2 className="text-[#994914] text-lg font-bold leading-tight">SkillChain Portal</h2>
            <p className="text-[#8B8276] text-[11px] font-bold uppercase tracking-wider mt-0.5">
              {isIssueActive ? 'ISSUE AUTHORITY' : (auth?.role === 'learner' ? 'Learner Portal' : 'Vocational Verification')}
            </p>
          </div>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#E07A25] text-white shadow-sm' 
                    : 'text-[#5C5854] hover:bg-[#EAE4DB]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#5C5854]'}`} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {auth?.isAuthenticated && (
          <div className="mt-auto pt-6 border-t border-[#EAE3DC] flex items-center gap-3">
             {location.pathname === '/fraud' ? (
               <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#0284C7]" />
               </div>
             ) : (
               <div className="w-10 h-10 rounded-full bg-[#1A1816] flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-full bg-[#EAE3DC] border-2 border-[#1A1816] rounded-full flex items-center justify-center">
                     <User className="w-5 h-5 text-[#5C5854]" />
                  </div>
               </div>
             )}
             <div>
               <h3 className="text-sm font-bold text-[#1A1816]">
                 {location.pathname === '/fraud' ? 'Agent Smith' : (auth?.role === 'learner' ? 'Alex Rivera' : 'Admin Portal')}
               </h3>
               <p className="text-[10px] text-[#8B8276] font-bold uppercase tracking-widest mt-0.5">
                 {location.pathname === '/fraud' ? 'Verification Officer' : (auth?.role === 'learner' ? 'Vocational Learner' : 'Vocational Inst.')}
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-[#1A1816]/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <aside className="relative w-72 h-full bg-[#F5F1EB] shadow-2xl transition-transform transform">
            <button aria-label="Close navigation" onClick={onClose} className="absolute top-4 right-4 p-2 text-[#5C5854] hover:bg-[#EAE4DB] rounded-lg z-10">
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
