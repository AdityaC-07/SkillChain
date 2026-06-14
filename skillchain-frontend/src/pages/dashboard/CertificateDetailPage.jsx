import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCertificate } from '../../services/certificateService'
import SkeletonCard from '../../components/ui/SkeletonCard'

function BlockchainExplorer({ txHash }) {
  const [iframeError, setIframeError] = useState(false)
  const polygonscanUrl = `https://mumbai.polygonscan.com/tx/${txHash}`

  if (!txHash) return null

  if (iframeError) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">🔗 Blockchain Transaction</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Transaction Hash:</span>
            <span className="font-mono text-xs text-slate-800 break-all ml-2">{txHash}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Network:</span>
            <span className="text-slate-800">Polygon Mumbai Testnet</span>
          </div>
        </div>
        <a
          href={polygonscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          View on Polygonscan →
        </a>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">🔗 Live Blockchain Explorer</h3>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <iframe
          src={polygonscanUrl}
          className="w-full h-96"
          onError={() => setIframeError(true)}
          title="Polygonscan Transaction"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        If the explorer fails to load,{' '}
        <button onClick={() => setIframeError(true)} className="text-blue-600 underline">
          click here for a summary view
        </button>
      </p>
    </div>
  )
}

export default function CertificateDetailPage(){
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['cert', id],
    queryFn: () => getCertificate(id).then(r => r.data),
    enabled: !!id,
  })

  if (isLoading) return <SkeletonCard lines={6} className="max-w-3xl" />
  if (!data) return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">Certificate not found.</div>

  const txHash = data.data?.tx_hash

  return (
    <div className="max-w-3xl bg-white rounded shadow p-6">
      <h1 className="text-2xl font-semibold mb-4">{data.data.learner_name}</h1>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(data.data).map(([key, value]) => (
          <div key={key} className="rounded border border-slate-200 p-4">
            <div className="text-xs uppercase text-slate-500">{key.replace(/_/g, ' ')}</div>
            <div className="mt-2 text-sm text-slate-700">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</div>
          </div>
        ))}
      </div>
      <BlockchainExplorer txHash={txHash} />
    </div>
  )
}
