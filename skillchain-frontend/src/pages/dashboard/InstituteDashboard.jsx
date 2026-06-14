import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatsCard from '../../components/ui/StatsCard'
import CertificateCard from '../../components/certificates/CertificateCard'

export default function InstituteDashboard(){
  const stats = [
    { title: 'Total Issued', value: 1240 },
    { title: 'Verified Today', value: 86 },
    { title: 'Fraud Caught', value: 3 },
  ]

  const recent = [{ learner_name: 'Asha R', course_name: 'Welding', completion_date: '2026-05-12', certificate_id:'abc123', learner_wallet:'0x1234567890abcdef' }]
  const [pending, setPending] = useState([])

  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem('pendingCertificates') || '[]')
    setPending(Array.isArray(stored) ? stored : [])
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Institute Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of issued certificates and pending blockchain activity.</p>
        </div>
        <Link to="/certificates/issue" className="inline-flex items-center justify-center px-4 py-2 bg-amber text-white rounded">Issue Certificate</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {stats.map(s=> <StatsCard key={s.title} title={s.title} value={s.value} />)}
      </div>

      <section className="mt-8">
        <h2 className="text-lg">Pending Certificates</h2>
        {pending.length ? (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {pending.map(item => (
              <div key={item.txHash} className="bg-white p-4 rounded shadow">
                <div className="text-sm text-slate-500">{item.course_name || 'Pending certificate'}</div>
                <div className="mt-2 font-semibold">{item.learner_name || 'Unknown learner'}</div>
                <div className="text-xs text-slate-500 mt-2">Transaction: <span className="font-mono break-all">{item.txHash}</span></div>
                <div className="text-xs text-slate-400 mt-1">Saved {new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-slate-700">No pending certificates yet.</p>
            <Link to="/certificates/issue" className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-amber text-white rounded">Issue one now</Link>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg">Recent Certificates</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {recent.length ? (
            recent.map(r=> <CertificateCard key={r.certificate_id} cert={r} />)
          ) : (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-slate-700">No certificates yet.</p>
              <p className="text-slate-500 mt-2">Issue your first certificate to get started.</p>
              <Link to="/certificates/issue" className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-amber text-white rounded">Issue your first certificate</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
