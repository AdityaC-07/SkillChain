import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function InstituteDashboard() {
  const recentIssuances = [
    {
      initials: 'AM',
      name: 'Aria Montgomery',
      course: 'Adv. Digital Fabrication',
      date: 'Oct 24, 2024',
      txHash: '0x4a2...9f3e',
      status: 'VERIFIED',
      avatarBg: 'bg-[#EAF0F6]',
      avatarText: 'text-[#4F6C8A]'
    },
    {
      initials: 'JL',
      name: 'Julian Laurent',
      course: 'Sustainable Agriculture',
      date: 'Oct 22, 2024',
      txHash: '0x8b1...e4c2',
      status: 'VERIFIED',
      avatarBg: 'bg-[#FFF4EA]',
      avatarText: 'text-[#994914]'
    },
    {
      initials: 'SK',
      name: 'Sarah Kim',
      course: 'Micro-Electronic Repair',
      date: 'Oct 21, 2024',
      txHash: '---',
      status: 'PENDING',
      avatarBg: 'bg-[#F5F1EB]',
      avatarText: 'text-[#5C5854]'
    },
    {
      initials: 'RW',
      name: 'Robert Walters',
      course: 'Cybersecurity Essentials',
      date: 'Oct 19, 2024',
      txHash: '0xf5c...2a1d',
      status: 'VERIFIED',
      avatarBg: 'bg-[#EAF0F6]',
      avatarText: 'text-[#4F6C8A]'
    }
  ]

  const monthlyData = [
    { month: 'Jan', count: 28 },
    { month: 'Feb', count: 35 },
    { month: 'Mar', count: 41 },
    { month: 'Apr', count: 38 },
    { month: 'May', count: 52 },
    { month: 'Jun', count: 53 },
  ];

  const gradeData = [
    { name: 'A', value: 142 },
    { name: 'B', value: 78 },
    { name: 'C', value: 21 },
    { name: 'D', value: 6 },
  ];

  const topCoursesData = [
    { name: 'Welding Technology NSQF L4', value: 67 },
    { name: 'Electrical Wiring NSQF L3', value: 54 },
    { name: 'Computer Basics NSQF L2', value: 49 },
    { name: 'Plumbing & Pipefitting NSQF L3', value: 38 },
    { name: 'Solar Panel Installation NSQF L4', value: 31 },
  ];

  const pendingConfirmations = [
    { learner: 'Amit Verma', id: '1042', status: 'Minting' },
    { learner: 'Priya Sharma', id: '2045', status: 'Minting' },
  ];

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#1A1816] leading-tight tracking-tight mb-1">
            Institutional Dashboard
          </h1>
          <p className="text-[#5C5854] text-sm font-medium">
            Real-time vocational certificate monitoring on-chain.
          </p>
        </div>
        <Link to="/certificates/issue" className="bg-[#A0522D] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#8B4513] transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-1.5" />
          Issue New Certificate
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#EAF0F6] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#4F6C8A]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-[#8B8276]">+12% this mo</span>
          </div>
          <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">Certificates Issued</p>
          <p className="text-3xl font-extrabold text-[#1A1816]">12,548</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#FFF4EA] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E07A25]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-[#8B8276]">Live pulse</span>
          </div>
          <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">Active Students</p>
          <p className="text-3xl font-extrabold text-[#1A1816]">4,892</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#FEF9C3] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#CA8A04]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-[#1A1816]">24 Pending</span>
          </div>
          <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">Verifications</p>
          <p className="text-3xl font-extrabold text-[#1A1816]">1,230</p>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#DC2626]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-[#DC2626]">Secure</span>
          </div>
          <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">Flagged Cases</p>
          <p className="text-3xl font-extrabold text-[#1A1816]">0</p>
        </div>
      </div>
        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Issuance Bar Chart */}
          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1816] mb-4">Monthly Issuance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#5C5854" />
                <YAxis stroke="#5C5854" />
                <Tooltip />
                <Bar dataKey="count" fill="#E07A25" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Grade Distribution Donut Chart */}
          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#1A1816] mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gradeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#4F6C8A', '#A0522D', '#E07A25', '#DC2626'][index % 4]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Courses Horizontal Bar Chart */}
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-[#1A1816] mb-4">Top Courses Issued</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={topCoursesData} margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#5C5854" />
              <YAxis dataKey="name" type="category" stroke="#5C5854" />
              <Tooltip />
              <Bar dataKey="value" fill="#4F6C8A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pending Blockchain Confirmations Widget */}
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-5 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-[#1A1816] mb-4">Pending Blockchain Confirmations</h3>
          <ul className="divide-y divide-[#EAE3DC]">
            {pendingConfirmations.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center py-2">
                <span className="font-medium text-[#1A1816]">{item.learner}</span>
                <span className="text-sm text-[#8B8276]">Token ID: {item.id}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#A16207] border border-[#FEF08A]">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

      <div className="bg-white border border-[#EAE3DC] rounded-2xl shadow-sm relative">
        <div className="p-6 border-b border-[#EAE3DC] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#1A1816]">Recent Issuance</h2>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B8276] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search student..." 
                className="pl-9 pr-4 py-2 border border-[#EAE3DC] rounded-lg text-sm text-[#1A1816] placeholder-[#8B8276] focus:outline-none focus:border-[#E07A25]"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-[#EAE3DC] rounded-lg text-sm font-medium text-[#5C5854] hover:bg-[#F5F1EB] transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-[#8B8276] font-bold uppercase tracking-wider border-b border-[#EAE3DC] bg-[#FDFBFA]">
              <tr>
                <th className="px-6 py-4 font-bold">Student Name</th>
                <th className="px-6 py-4 font-bold">Course</th>
                <th className="px-6 py-4 font-bold">Issue Date</th>
                <th className="px-6 py-4 font-bold">TX Hash</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3DC]">
              {recentIssuances.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FDFBFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${item.avatarBg} ${item.avatarText}`}>
                        {item.initials}
                      </div>
                      <span className="font-medium text-[#1A1816]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#5C5854]">{item.course}</td>
                  <td className="px-6 py-4 text-[#5C5854]">{item.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#E07A25]">{item.txHash}</td>
                  <td className="px-6 py-4">
                    {item.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-[#A16207] border border-[#FEF08A]">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
                        <History className="w-3 h-3 mr-1" />
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[#8B8276] hover:text-[#1A1816]">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#EAE3DC] flex items-center justify-between bg-[#FDFBFA] rounded-b-2xl">
          <span className="text-xs text-[#8B8276] font-medium">Showing 4 of 12,548 certificates</span>
          <div className="flex space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-[#EAE3DC] rounded-lg text-[#8B8276] hover:bg-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#EAE3DC] rounded-lg text-[#1A1816] hover:bg-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating action button matching the image */}
        <button className="absolute -bottom-5 -right-5 w-14 h-14 bg-[#E07A25] rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-[#C96B1E] transition-colors z-10 hidden md:flex">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-12 mb-8 bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl p-8 flex items-center justify-between">
        <div className="max-w-xl">
          <h3 className="text-xl font-bold text-[#994914] mb-2">Blockchain Secured</h3>
          <p className="text-[#5C5854] text-sm leading-relaxed">
            Every certificate issued through SkillChain is permanently recorded on the blockchain, ensuring your institution's credentials remain tamper-proof and verifiable worldwide.
          </p>
        </div>
        <div className="w-24 h-24 rounded-full bg-[#F5F1EB] flex items-center justify-center relative overflow-hidden">
           {/* Decorative geometric shapes inside circle */}
           <div className="absolute inset-0 border-[6px] border-[#EAE3DC] rounded-full m-3 opacity-50"></div>
           <div className="w-10 h-10 bg-[#EAE3DC] rotate-45 rounded-lg opacity-80"></div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function History(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
      <path d="M12 7v5l4 2"></path>
    </svg>
  );
}
