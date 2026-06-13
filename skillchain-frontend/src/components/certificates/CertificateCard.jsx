import React from 'react'
import { Link } from 'react-router-dom'
import { shorten } from '../../utils/addressUtils'

export default function CertificateCard({ cert }){
  return (
    <Link to={`/certificates/${cert.certificate_id}`} className="block bg-white p-4 rounded shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{cert.learner_name}</h3>
          <div className="text-sm text-gray-600">{cert.course_name}</div>
        </div>
        <div className="text-right text-xs text-gray-500">{cert.completion_date}</div>
      </div>
      <div className="mt-3 text-sm text-gray-700">Token: {cert.token_id ?? '—'}</div>
      <div className="mt-2 text-xs text-gray-500">Wallet: {shorten(cert.learner_wallet)}</div>
    </Link>
  )
}
