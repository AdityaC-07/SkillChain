import React, { useState } from 'react'
import { useVerify } from '../hooks/useVerify'
import { useTranslation } from 'react-i18next'
import SkeletonCard from '../components/ui/SkeletonCard'

export default function VerifyPage(){
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const mutation = useVerify()

  const onSubmit = (e)=>{ e.preventDefault(); mutation.mutate(query) }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-heading">{t('verify.title')}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full border-2 border-amber p-3 rounded" placeholder={t('verify.placeholder')} value={query} onChange={e=>setQuery(e.target.value)} />
        <button type="submit" className="bg-amber px-4 py-2 rounded">{t('verify.button')}</button>
      </form>

      <div className="mt-6">
        {mutation.isLoading && <SkeletonCard lines={4} className="max-w-xl" />}
        {!query && !mutation.isLoading && !mutation.isSuccess && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
            <p className="text-lg font-semibold mb-2">Verify a certificate</p>
            <p>Enter a certificate ID, transaction hash, or learner wallet address to confirm authenticity.</p>
            <p className="mt-3 text-sm text-slate-500">Verification results appear here once you submit a search.</p>
          </div>
        )}
        {mutation.isError && <div className="text-red-500">{mutation.error.message}</div>}
        {mutation.isSuccess && (
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg">{mutation.data.data.blockchain_status}</h3>
            <pre className="text-xs mt-3 overflow-x-auto bg-slate-100 p-3 rounded">{JSON.stringify(mutation.data.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
