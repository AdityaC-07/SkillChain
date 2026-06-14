import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from '../services/api'

function formatTimeAgo(timestamp) {
  const now = new Date()
  const past = new Date(timestamp)
  const seconds = Math.floor((now - past) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function ActivityFeed() {
  const { data: stats } = useQuery(
    ['stats'],
    async () => axios.get('/api/analytics/stats').then(r => r.data),
    { refetchInterval: 10000 }
  )
  
  const activities = stats?.recent_activity?.slice(0, 5) || []

  const getActionMessage = (action, metadata) => {
    switch(action) {
      case 'ISSUED':
        return `Certificate issued for ${metadata?.course_name || 'a course'}`
      case 'VERIFIED':
        return 'Certificate verified'
      case 'REVOKED':
        return 'Certificate revoked'
      case 'FRAUD_SCAN':
        return `Fraud scan: ${metadata?.verdict || 'completed'}`
      default:
        return action
    }
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-heading mb-4">🔴 Live Activity</h2>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={`${activity.action}-${activity.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{getActionMessage(activity.action, activity.metadata)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mt-3">Updates every 10 seconds</p>
      </div>
    </section>
  )
}

function BlockchainComparison() {
  const [showComparison, setShowComparison] = useState(false)

  if (!showComparison) {
    return (
      <section className="py-8">
        <button
          onClick={() => setShowComparison(true)}
          className="w-full max-w-md mx-auto block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
        >
          🚀 Why Blockchain? See the Difference
        </button>
      </section>
    )
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-heading text-center mb-6">Why Blockchain?</h2>
      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-4">❌ Traditional System</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <div>
                <div className="font-semibold">Verification Time</div>
                <div className="text-sm text-gray-600">7-30 days</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <div>
                <div className="font-semibold">Forgery Risk</div>
                <div className="text-sm text-gray-600">High (paper certificates easily faked)</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <div>
                <div className="font-semibold">Cost</div>
                <div className="text-sm text-gray-600">₹500-2000 per verification</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <div>
                <div className="font-semibold">Centralized</div>
                <div className="text-sm text-gray-600">Single point of failure</div>
              </div>
            </li>
          </ul>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">✅ SkillChain</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <div className="font-semibold">Verification Time</div>
                <div className="text-sm text-gray-600">Instant (seconds)</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <div className="font-semibold">Forgery Risk</div>
                <div className="text-sm text-gray-600">Cryptographically impossible</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <div className="font-semibold">Cost</div>
                <div className="text-sm text-gray-600">₹0.10 per transaction</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <div className="font-semibold">Decentralized</div>
                <div className="text-sm text-gray-600">Immutable, tamper-proof</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

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

      <BlockchainComparison />

      <ActivityFeed />

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
