import React, { useState } from 'react'
import { useVerify } from '../hooks/useVerify'
import { useTranslation } from 'react-i18next'

export default function VerifyPage(){
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const mutation = useVerify()

  const onSubmit = (e)=>{ e.preventDefault(); mutation.mutate(query) }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-heading">{t('verify.title')}</h1>
      <form onSubmit={onSubmit} className="mt-4">
        <input className="w-full border-2 border-amber p-3" placeholder={t('verify.placeholder')} value={query} onChange={e=>setQuery(e.target.value)} />
        <button className="mt-3 bg-amber px-4 py-2 rounded">{t('verify.button')}</button>
      </form>

      <div className="mt-6">
        {mutation.isLoading && <div>Loading...</div>}
        {mutation.isError && <div className="text-red-500">{mutation.error.message}</div>}
        {mutation.isSuccess && (
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg">{mutation.data.data.blockchain_status}</h3>
            <pre className="text-xs">{JSON.stringify(mutation.data.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
