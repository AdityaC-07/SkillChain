import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ isOpen=false, onClose=()=>{} }){
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block w-56 bg-gray-50 p-4 border-r h-full" aria-label="Main navigation">
        <nav className="space-y-2">
          <NavLink to="/" className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Dashboard</NavLink>
          <NavLink to="/certificates/issue" className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Issue</NavLink>
          <NavLink to="/verify" className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Verify</NavLink>
          <NavLink to="/fraud" className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Fraud</NavLink>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} aria-hidden="true" />
          <aside className="relative w-64 h-full bg-white p-4">
            <button aria-label="Close navigation" onClick={onClose} className="mb-4">Close</button>
            <nav className="space-y-2" aria-label="Mobile navigation">
              <NavLink to="/" onClick={onClose} className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Home</NavLink>
              <NavLink to="/dashboard" onClick={onClose} className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Dashboard</NavLink>
              <NavLink to="/certificates/issue" onClick={onClose} className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Issue</NavLink>
              <NavLink to="/verify" onClick={onClose} className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Verify</NavLink>
              <NavLink to="/fraud" onClick={onClose} className={({isActive})=> isActive? 'block p-2 bg-amber text-white rounded':'block p-2 rounded'}>Fraud</NavLink>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
