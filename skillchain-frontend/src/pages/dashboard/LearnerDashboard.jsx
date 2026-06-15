import React from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Landmark,
  Eye,
  ShieldCheck,
  Filter,
  Share2,
  Download,
  CheckCircle2,
  BookOpen
} from 'lucide-react'

export default function LearnerDashboard() {
  const certifications = [
    {
      id: '89XC2',
      title: 'Advanced Smart Contract Auditing',
      issuer: 'Global Tech Academy',
      date: 'Oct 24, 2023',
      type: 'Professional',
      gradient: 'from-orange-900 to-amber-600'
    },
    {
      id: '44LM9',
      title: 'Full Stack Web Architecture',
      issuer: 'DevFlow Institute',
      date: 'Sep 12, 2023',
      type: 'Specialization',
      gradient: 'from-yellow-900 to-amber-700'
    },
    {
      id: '21PK1',
      title: 'Data Science for Business',
      issuer: 'MIT Open Learning',
      date: 'Aug 05, 2023',
      type: 'Certification',
      gradient: 'from-stone-800 to-orange-800'
    }
  ]

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
            My Learning <span className="text-[#994914]">Achievements</span>
          </h1>
          <p className="text-[#5C5854] text-lg leading-relaxed">
            View and manage your blockchain-verified certificates. Your skills are 
            permanently secured and ready to share with the world.
          </p>
        </div>
        <div className="flex items-center space-x-4 shrink-0">
          <button className="flex items-center space-x-2 px-6 py-3 border border-[#EAE3DC] bg-white rounded-xl text-sm font-medium text-[#1A1816] hover:bg-[#F5F1EB] transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-[#8B4513] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#6B3410] transition-colors shadow-sm">
            <Share2 className="w-4 h-4" />
            <span>Public Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm">
          <Award className="w-6 h-6 text-[#8B4513] mb-4" strokeWidth={2} />
          <p className="text-3xl font-extrabold text-[#1A1816] mb-1">12</p>
          <p className="text-[#8B8276] text-sm">Active Certificates</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm">
          <Landmark className="w-6 h-6 text-[#CA8A04] mb-4" strokeWidth={2} />
          <p className="text-3xl font-extrabold text-[#1A1816] mb-1">4</p>
          <p className="text-[#8B8276] text-sm">Partner Institutions</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm">
          <Eye className="w-6 h-6 text-[#4F6C8A] mb-4" strokeWidth={2} />
          <p className="text-3xl font-extrabold text-[#1A1816] mb-1">148</p>
          <p className="text-[#8B8276] text-sm">Profile Views</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-[#16A34A] mb-4" strokeWidth={2} />
          <p className="text-3xl font-extrabold text-[#1A1816] mb-1">100%</p>
          <p className="text-[#8B8276] text-sm">Verified Status</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#1A1816] mb-6">Recent Certifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {certifications.map((cert, idx) => (
          <div key={idx} className="bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className={`h-32 bg-gradient-to-r ${cert.gradient} relative flex items-start justify-end p-4`}>
              {/* Abstract pattern overlay for visual interest */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              <div className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#994914] px-3 py-1.5 rounded-md uppercase tracking-wider z-10 border border-white/50">
                BLOCKCHAIN ID: {cert.id}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start space-x-4 mb-6 relative">
                <div className="w-12 h-12 bg-white rounded-xl border border-[#EAE3DC] shadow-sm flex items-center justify-center -mt-12 z-10">
                  <BookOpen className="w-6 h-6 text-[#8B8276]" />
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-[#1A1816] leading-tight mb-1">{cert.title}</h3>
                  <p className="text-xs text-[#5C5854] font-medium">{cert.issuer}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-[#EAE3DC] pt-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#8B8276] uppercase tracking-wider mb-1">ISSUED DATE</p>
                  <p className="text-sm text-[#1A1816] font-medium">{cert.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8B8276] uppercase tracking-wider mb-1">CREDENTIAL TYPE</p>
                  <p className="text-sm text-[#1A1816] font-medium">{cert.type}</p>
                </div>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 py-2.5 border border-[#EAE3DC] rounded-xl text-sm font-medium text-[#5C5854] hover:bg-[#F5F1EB] transition-colors">
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <Link to="/verify" className="flex items-center justify-center space-x-2 py-2.5 bg-[#A0522D] text-white rounded-xl text-sm font-bold hover:bg-[#8B4513] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Verify</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
