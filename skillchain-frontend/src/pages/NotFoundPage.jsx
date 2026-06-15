import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-lg p-10 text-center">
        <div className="text-6xl mb-6">404</div>
        <h1 className="text-3xl font-heading mb-3 text-navy-900">Page not found</h1>
        <p className="text-slate-600 mb-8">The page you were looking for doesn’t exist or may have moved. Use the links below to continue.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/verify" className="px-5 py-3 bg-[#8B4513] text-white rounded shadow">Go to Verify</Link>
          <Link to="/" className="px-5 py-3 border border-slate-300 rounded hover:bg-slate-100">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
