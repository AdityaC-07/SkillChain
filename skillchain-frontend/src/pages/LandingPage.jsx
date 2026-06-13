import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import axios from '../services/api'

export default function LandingPage(){
  const { t } = useTranslation()
  const { data } = useQuery(['stats'], async ()=> axios.get('/api/analytics/stats').then(r=>r.data), {staleTime: 60000})

  const count = data?.total_certificates || 0

  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-heading text-navy-700">{t('hero.title')}</h1>
        <p className="mt-4 text-gray-600">{t('hero.subtitle')}</p>
        <div className="mt-6 space-x-3">
          <Link to="/register" className="bg-amber text-white px-4 py-2 rounded">{t('hero.cta_certify')}</Link>
          <Link to="/verify" className="border border-amber px-4 py-2 rounded">{t('hero.cta_verify')}</Link>
        </div>
        <div className="mt-8">
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="text-3xl font-bold">{count.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Certificates on chain</div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-heading">How it works</h2>
        <div className="flex gap-4 mt-4">
          {['Log In','Store','Mint','QR','Verify'].map((s,i)=> (
            <motion.div key={s} whileInView={{y:0, opacity:1}} initial={{y:20, opacity:0}} className="p-4 bg-white rounded shadow flex-1 text-center">{s}</motion.div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow text-center">Certificates Issued<br/>0</div>
          <div className="p-4 bg-white rounded shadow text-center">Fraud Caught<br/>0</div>
          <div className="p-4 bg-white rounded shadow text-center">Instant Verifications<br/>0</div>
        </div>
      </section>

      <section className="py-8">
        <h3 className="text-xl">Trusted by</h3>
        <div className="flex gap-4 mt-4">
          <div className="p-4 bg-gray-100 rounded">DigiLocker</div>
          <div className="p-4 bg-gray-100 rounded">Skill India</div>
          <div className="p-4 bg-gray-100 rounded">NCVET</div>
        </div>
      </section>
    </div>
  )
}
