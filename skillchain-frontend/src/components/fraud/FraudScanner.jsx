import React, { useState } from 'react'
import { useFraud } from '../../hooks/useFraud'
import SkeletonCard from '../ui/SkeletonCard'

export default function FraudScanner(){
  const [file, setFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const mutation = useFraud()

  const onFile = (e)=> setFile(e.target.files[0])
  const analyze = async ()=>{
    if (!file) return alert('Select file')
    const fd = new FormData(); fd.append('image', file)
    setSubmitted(true)
    mutation.mutate(fd)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl">Fraud Scanner</h2>
      <div className="mt-4 p-6 border-2 border-dashed border-amber rounded">
        <input type="file" accept="image/*" onChange={onFile} />
      </div>
      <button onClick={analyze} className="mt-3 bg-amber px-4 py-2 rounded">Analyze Certificate</button>

      <div className="mt-6">
        {!submitted && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
            <p className="font-semibold mb-2">No fraud scans run yet</p>
            <p>Upload a certificate image to check for suspicious metadata or tampering.</p>
          </div>
        )}

        {mutation.isLoading && <SkeletonCard lines={4} className="max-w-xl" />}
        {mutation.isError && <div className="text-red-500">{mutation.error.message}</div>}
        {mutation.isSuccess && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg">Fraud Score: {mutation.data.data.analysis.fraud_score}</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              {Object.entries(mutation.data.data.analysis).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
