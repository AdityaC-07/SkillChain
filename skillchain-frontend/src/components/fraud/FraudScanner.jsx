import React, { useState } from 'react'
import { useFraud } from '../../hooks/useFraud'

export default function FraudScanner(){
  const [file, setFile] = useState(null)
  const mutation = useFraud()

  const onFile = (e)=> setFile(e.target.files[0])
  const analyze = async ()=>{
    if (!file) return alert('Select file')
    const fd = new FormData(); fd.append('image', file)
    mutation.mutate(fd)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl">Fraud Scanner</h2>
      <div className="mt-4 p-6 border-2 border-dashed border-amber">
        <input type="file" accept="image/*" onChange={onFile} />
      </div>
      <button onClick={analyze} className="mt-3 bg-amber px-4 py-2 rounded">Analyze Certificate</button>

      <div className="mt-6">
        {mutation.isLoading && <div>Analyzing with AI...</div>}
        {mutation.isError && <div className="text-red-500">{mutation.error.message}</div>}
        {mutation.isSuccess && (
          <div className="bg-white p-4 rounded shadow">
            <h3>Fraud Score: {mutation.data.data.analysis.fraud_score}</h3>
            <pre>{JSON.stringify(mutation.data.data.analysis, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
