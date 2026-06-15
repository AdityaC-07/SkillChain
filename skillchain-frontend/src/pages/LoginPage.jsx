import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ShieldCheck, FilePlus, AlertTriangle, ArrowRight } from 'lucide-react'

const demoLinks = [
  { to: '/dashboard', icon: BarChart3, label: 'Analytics Dashboard', color: 'text-[#4F6C8A]', bg: 'bg-[#EAF0F6]' },
  { to: '/certificates/issue', icon: FilePlus, label: 'Issue a Certificate', color: 'text-[#6B7240]', bg: 'bg-[#F2F4E6]' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify a Certificate', color: 'text-[#C96B1E]', bg: 'bg-[#FFF4EA]' },
  { to: '/fraud', icon: AlertTriangle, label: 'AI Fraud Scanner', color: 'text-[#C93C3C]', bg: 'bg-[#FBEBEB]' },
]

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFF4EA] rounded-full blur-[120px] -z-10 opacity-60" />

      <div className="max-w-lg mx-auto w-full mt-12 mb-20">
        <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-[#FFF4EA] rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-black text-[#994914]">!</span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1816] mb-2">No Login Required</h1>
            <p className="text-sm text-[#5C5854] leading-relaxed">
              Full institute/learner accounts are part of the production rollout. Explore the platform via the sidebar — no login required for this demo.
            </p>
          </div>

          <div className="border-t border-[#EAE3DC] pt-6 space-y-3">
            <p className="text-xs font-bold text-[#8B8276] uppercase tracking-wider">Try these demo pages</p>
            <div className="grid grid-cols-1 gap-2.5">
              {demoLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between ${link.bg} border border-[#EAE3DC] rounded-xl px-5 py-3.5 hover:shadow-sm transition-all group`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${link.color}`} strokeWidth={2} />
                      <span className="text-sm font-bold text-[#1A1816]">{link.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8B8276] group-hover:text-[#1A1816] transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="bg-[#F5F1EB] rounded-xl p-4 border border-[#EAE3DC]">
            <p className="text-xs text-[#5C5854]">
              <span className="font-bold">Note:</span> Production accounts for institutes and learners are coming soon. This interactive preview showcases all core features of SkillChain.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
