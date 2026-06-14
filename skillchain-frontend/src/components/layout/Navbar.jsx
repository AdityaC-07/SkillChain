import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onToggleSidebar=()=>{} }){
  const { t } = useTranslation()
  const auth = useAuth()

  return (
    <nav className="bg-cream border-b">
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button aria-label="Open navigation" onClick={onToggleSidebar} className="md:hidden px-2 py-1">☰</button>
          <Link to="/" className="font-heading text-xl text-navy-700">SKILLCHAIN</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/verify" className="text-navy-700">{t('nav.verify')}</Link>
          <Link to="/about" className="text-navy-700">{t('nav.about')}</Link>
          {!auth?.isAuthenticated ? (
            <>
              <Link to="/login" className="text-amber">{t('nav.login')}</Link>
              <Link to="/register" className="bg-amber text-white px-3 py-1 rounded">{t('nav.home')}</Link>
            </>
          ) : (
            <>
              <Link to={auth.role === 'institute' ? '/dashboard/institute' : '/dashboard/learner'} className="text-navy-700">{t('nav.dashboard')}</Link>
              <button onClick={auth.logout} className="text-red-fraud">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
