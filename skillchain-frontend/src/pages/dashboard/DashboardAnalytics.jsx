import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Info,
  Database,
  Link2,
  Brain,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Activity
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const totalCertificates = 247
const active = 239
const revoked = 8
const verifiedToday = 34

const statCards = [
  {
    icon: FileText,
    iconBg: 'bg-[#EAF0F6]',
    iconColor: 'text-[#4F6C8A]',
    label: 'Total Certificates Issued',
    value: totalCertificates,
    explainer: 'Counted from on-chain mint events (ERC-721 totalSupply) cross-referenced with MongoDB records — ensures no certificate exists in DB without a matching blockchain entry.'
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-[#EAF0F6]',
    iconColor: 'text-[#16A34A]',
    label: 'Active',
    value: active,
    explainer: 'Certificates where revokedTokens[tokenId] = false on the smart contract. Checked live against the blockchain ledger, not just the database.'
  },
  {
    icon: ShieldAlert,
    iconBg: 'bg-[#FEE2E2]',
    iconColor: 'text-[#DC2626]',
    label: 'Revoked',
    value: revoked,
    explainer: 'Institutions can revoke certificates for errors or fraud. Revocation is permanent and recorded as an immutable on-chain event — revoked certificates remain visible for audit but fail verification.'
  },
  {
    icon: Activity,
    iconBg: 'bg-[#FFF4EA]',
    iconColor: 'text-[#E07A25]',
    label: 'Verified Today',
    value: verifiedToday,
    explainer: 'Each verification triggers a read-only blockchain call (zero gas cost) plus an AuditLog entry — this number reflects real verification demand from employers/institutions.'
  }
]

const monthlyData = [
  { month: 'Jan', count: 28 },
  { month: 'Feb', count: 35 },
  { month: 'Mar', count: 41 },
  { month: 'Apr', count: 38 },
  { month: 'May', count: 52 },
  { month: 'Jun', count: 53 }
]

const monthlyInsights = {
  'Jan': '28 certificates in January — starting the year with strong momentum across all NSQF courses.',
  'Feb': '35 certificates in February — a 25% increase from January, driven by Electrical Wiring course completions.',
  'Mar': '41 certificates in March — a 17% increase from February, led by Computer Basics and Welding courses.',
  'Apr': '38 certificates in April — a 7% seasonal dip from March, typical during assessment transitions.',
  'May': '52 certificates in May — a 37% surge from April, fueled by Solar Panel Installation completions.',
  'Jun': '53 certificates in June — a 2% increase from May, the highest monthly output in the pilot.'
}

const gradeData = [
  { name: 'A', value: 142, color: '#4F6C8A', pct: '57.5%', explainer: 'Certificates with grade A indicate learners scoring 85%+ in practical and theory assessments per NCVET NSQF guidelines' },
  { name: 'B', value: 78, color: '#A0522D', pct: '31.6%', explainer: 'Certificates with grade B indicate learners scoring 70-84% across practical and theory modules per NCVET NSQF standards' },
  { name: 'C', value: 21, color: '#E07A25', pct: '8.5%', explainer: 'Certificates with grade C indicate learners scoring 55-69%, meeting the minimum competency threshold for NSQF certification' },
  { name: 'D', value: 6, color: '#DC2626', pct: '2.4%', explainer: 'Certificates with grade D indicate learners scoring 40-54%, requiring remedial assessments per institutional policy' }
]

const topCoursesData = [
  { name: 'Welding NSQF L4', value: 67, rate: 97 },
  { name: 'Electrical Wiring NSQF L3', value: 54, rate: 94 },
  { name: 'Computer Basics NSQF L2', value: 49, rate: 99 },
  { name: 'Plumbing NSQF L3', value: 38, rate: 96 },
  { name: 'Solar Panel Installation NSQF L4', value: 31, rate: 98 }
]

const trustSections = [
  {
    icon: Database,
    title: 'MongoDB Records',
    desc: 'Certificate metadata, learner info, issuance history'
  },
  {
    icon: Link2,
    title: 'Blockchain Ledger',
    desc: 'Immutable mint/revoke events on Polygon — cross-checked against database on every verification'
  },
  {
    icon: Brain,
    title: 'AI Fraud Layer',
    desc: 'Every uploaded certificate image is scored across 4 independent signals before being trusted'
  }
]

function StatCardTooltip({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute z-20 top-full mt-2 right-0 w-72 bg-white border border-[#EAE3DC] rounded-xl shadow-lg p-4 pointer-events-none"
    >
      <p className="text-xs text-[#5C5854] leading-relaxed">{text}</p>
      <div className="absolute -top-1 right-6 w-2 h-2 bg-white border-l border-t border-[#EAE3DC] rotate-45" />
    </motion.div>
  )
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const count = payload[0].value
  const insight = monthlyInsights[label]
  return (
    <div className="bg-white border border-[#EAE3DC] rounded-xl shadow-lg p-4 max-w-xs">
      <p className="text-sm font-bold text-[#1A1816] mb-1">{label} — {count} certificate{count !== 1 ? 's' : ''}</p>
      <p className="text-xs text-[#5C5854] leading-relaxed">{insight}</p>
    </div>
  )
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0].payload
  return (
    <div className="bg-white border border-[#EAE3DC] rounded-xl shadow-lg p-4 max-w-xs">
      <p className="text-sm font-bold text-[#1A1816] mb-1">Grade {entry.name} ({entry.value} — {entry.pct})</p>
      <p className="text-xs text-[#5C5854] leading-relaxed">{entry.explainer}</p>
    </div>
  )
}

function CustomCourseTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0].payload
  return (
    <div className="bg-white border border-[#EAE3DC] rounded-xl shadow-lg p-4 max-w-xs">
      <p className="text-sm font-bold text-[#1A1816] mb-1">{entry.name}</p>
      <p className="text-xs text-[#5C5854] mb-1">{entry.value} certificate{entry.value !== 1 ? 's' : ''} issued</p>
      <p className="text-xs text-[#5C5854]">This course has a {entry.rate}% verification rate</p>
    </div>
  )
}

export default function DashboardAnalytics() {
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#FFF4EA] to-[#FDFBFA] border border-[#EAE3DC] rounded-2xl p-5 mb-8 flex items-center space-x-4 shadow-sm">
        <div className="w-10 h-10 bg-[#994914] rounded-xl flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-[#1A1816]">
          Live Analytics Preview — showing sample data from SkillChain's pilot deployment
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm relative"
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={2} />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: hoveredCard === idx ? 1 : 0, scale: hoveredCard === idx ? 1 : 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Info className="w-4 h-4 text-[#8B8276]" strokeWidth={2} />
              </motion.div>
            </div>
            <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-3xl font-extrabold text-[#1A1816]">{card.value.toLocaleString()}</p>
            <AnimatePresence>
              {hoveredCard === idx && <StatCardTooltip text={card.explainer} />}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Issuance Bar Chart */}
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1816] mb-4">Monthly Issuance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE3DC" />
              <XAxis dataKey="month" stroke="#5C5854" tick={{ fontSize: 12 }} />
              <YAxis stroke="#5C5854" tick={{ fontSize: 12 }} />
              <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#F5F1EB' }} />
              <Bar dataKey="count" fill="#E07A25" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution Donut Chart */}
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1816] mb-4 text-center">Grade Distribution</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={gradeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-[#1A1816]">{totalCertificates}</p>
                <p className="text-xs text-[#8B8276] font-medium -mt-1">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses Horizontal Bar Chart */}
      <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#1A1816] mb-4">Top Courses Issued</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            layout="vertical"
            data={topCoursesData}
            margin={{ top: 10, right: 30, left: 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EAE3DC" />
            <XAxis type="number" stroke="#5C5854" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#5C5854"
              tick={{ fontSize: 11, fontWeight: 600 }}
              width={130}
            />
            <RechartsTooltip content={<CustomCourseTooltip />} cursor={{ fill: '#F5F1EB' }} />
            <Bar dataKey="value" fill="#4F6C8A" radius={[0, 4, 4, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Section */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-[#1A1816] mb-5 tracking-tight">How These Numbers Are Verified</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trustSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 bg-[#F5F1EB] rounded-xl flex items-center justify-center mb-4">
                <section.icon className="w-5 h-5 text-[#994914]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#1A1816] mb-2">{section.title}</h3>
              <p className="text-sm text-[#5C5854] leading-relaxed">{section.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <Link
            to="/certificates/issue"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8B4513] hover:text-[#6B3410] transition-colors"
          >
            See how certificates are issued <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
