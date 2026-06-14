import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const techStack = [
  { name: 'FastAPI', icon: '⚡', color: 'bg-green-100 text-green-800' },
  { name: 'React', icon: '⚛️', color: 'bg-blue-100 text-blue-800' },
  { name: 'MongoDB', icon: '🍃', color: 'bg-green-100 text-green-800' },
  { name: 'Polygon', icon: '🔷', color: 'bg-purple-100 text-purple-800' },
  { name: 'IPFS', icon: '🌐', color: 'bg-blue-100 text-blue-800' },
  { name: 'Python', icon: '🐍', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Web3.py', icon: '🔗', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'TailwindCSS', icon: '🎨', color: 'bg-cyan-100 text-cyan-800' },
]

const teamMembers = [
  { name: 'Team SkillChain', role: 'Hackathon Team', description: 'Building the future of vocational credential verification in India' },
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-navy-700 mb-8">{t('about.title')}</h1>

        {/* Problem Statement */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <span>⚠️</span> {t('about.problem')}
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              India issues over 10 million vocational certificates annually, yet verification remains a manual, time-consuming process that takes 7-30 days. Paper certificates are easily forged, costing employers and institutions crores in fraud losses. The current centralized system is vulnerable to single points of failure and lacks real-time verification capabilities.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Verification takes 7-30 days</li>
              <li>High forgery risk with paper certificates</li>
              <li>Costs ₹500-2000 per verification</li>
              <li>Centralized system with single point of failure</li>
              <li>No real-time verification capability</li>
            </ul>
          </div>
        </section>

        {/* Solution */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-green-700 mb-4 flex items-center gap-2">
            <span>✅</span> {t('about.solution')}
          </h2>
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              SkillChain leverages blockchain technology to create an immutable, tamper-proof record of vocational certificates. By minting certificates as NFTs on Polygon and storing metadata on IPFS, we enable instant verification (seconds instead of days) at near-zero cost (₹0.10 per transaction). Our system integrates with DigiLocker and includes AI-powered fraud detection to ensure credential authenticity.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Instant verification in seconds</li>
              <li>Cryptographically impossible to forge</li>
              <li>₹0.10 per transaction</li>
              <li>Decentralized and tamper-proof</li>
              <li>AI-powered fraud detection</li>
              <li>DigiLocker integration</li>
            </ul>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <span>🛠️</span> {t('about.tech_stack')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${tech.color} p-4 rounded-lg text-center font-semibold`}
              >
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div>{tech.name}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
            <span>👥</span> {t('about.team')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-purple-50 border border-purple-200 p-6 rounded-lg"
              >
                <h3 className="text-xl font-bold text-purple-900">{member.name}</h3>
                <p className="text-purple-700 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GitHub Link */}
        <section className="text-center">
          <a
            href="https://github.com/yourusername/skillchain"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📦</span> View on GitHub
          </a>
        </section>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
