import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCertificate } from '../../services/certificateService'

export default function CertificateDetailPage(){
  const { id } = useParams()
  const { data, isLoading } = useQuery(['cert', id], ()=> getCertificate(id).then(r=>r.data), { enabled: !!id })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <div>
      <h1 className="text-2xl">{data.data.learner_name}</h1>
      <pre>{JSON.stringify(data.data, null, 2)}</pre>
    </div>
  )
}
