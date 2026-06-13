import React from 'react'
import StatsCard from '../../components/ui/StatsCard'
import CertificateCard from '../../components/certificates/CertificateCard'

export default function InstituteDashboard(){
  // sample data — will be wired to API
  const stats = [
    { title: 'Total Issued', value: 1240 },
    { title: 'Verified Today', value: 86 },
    { title: 'Fraud Caught', value: 3 },
  ]

  const recent = [{ learner_name: 'Asha R', course_name: 'Welding', completion_date: '2026-05-12', certificate_id:'abc123', learner_wallet:'0x1234567890abcdef' }]

  return (
    <div>
      <h1 className="text-2xl">Institute Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {stats.map(s=> <StatsCard key={s.title} title={s.title} value={s.value} />)}
      </div>

      <section className="mt-6">
        <h2 className="text-lg">Recent Certificates</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {recent.map(r=> <CertificateCard key={r.certificate_id} cert={r} />)}
        </div>
      </section>
    </div>
  )
}
