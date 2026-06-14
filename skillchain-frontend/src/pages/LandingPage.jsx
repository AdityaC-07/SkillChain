import React from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Users,
  Landmark,
  ShieldAlert,
  LogIn,
  Cloud,
  Link as LinkIcon,
  QrCode,
  CheckCircle,
  History,
  Database,
  Network,
  Library
} from 'lucide-react'

export default function LandingPage() {
  const [verifIdx, setVerifIdx] = React.useState(0);
  
  const verifications = [
    { text: "Welding NSQF L4 certificate verified", inst: "Govt ITI Delhi", time: "Just now" },
    { text: "Electrician Level 3 certificate verified", inst: "NSDC Partner", time: "2m ago" },
    { text: "Plumbing Basics verified", inst: "Skill India Center", time: "5m ago" }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setVerifIdx((prev) => (prev + 1) % verifications.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="text-5xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
            Your Skills.<br/>
            <span className="text-[#E07A25]">Verified</span> Forever.
          </h1>
          <p className="text-[#5C5854] text-lg mb-8 max-w-md leading-relaxed">
            Issue blockchain-backed vocational certificates that build trust in your skills and future. Modern education meets permanent security.
          </p>
          <div className="flex items-center space-x-4">
            <Link to="/register" className="bg-[#E07A25] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#C96B1E] transition-colors">
              Get Certified
            </Link>
            <Link to="/verify" className="border-2 border-[#E07A25] text-[#1A1816] px-6 py-3 rounded-xl font-bold hover:bg-[#FFF4EA] transition-colors">
              Verify Now
            </Link>
          </div>

          <div className="mt-16">
            <p className="text-[11px] font-bold text-[#8B8276] uppercase tracking-widest mb-4">Trusted by vocational institutes across India</p>
            <div className="flex flex-wrap gap-3">
              {['NSDC', 'ITI Network', 'Skill India Digital', 'NCVET'].map(name => (
                <span key={name} className="px-4 py-2 bg-white border border-[#EAE3DC] rounded-lg text-xs font-bold text-[#8B8276] grayscale hover:grayscale-0 hover:text-[#1A1816] hover:border-[#D2C8BC] transition-all cursor-default shadow-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Certificates Issued</p>
              <p className="text-3xl font-extrabold text-[#1A1816]">12,548</p>
            </div>
            <div className="bg-[#FFF4EA] p-3 rounded-full">
              <BadgeCheck className="w-6 h-6 text-[#E07A25]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Verified Professionals</p>
              <p className="text-3xl font-extrabold text-[#6B7240]">12,320</p>
            </div>
            <div className="bg-[#F2F4E6] p-3 rounded-full">
              <Users className="w-6 h-6 text-[#6B7240]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Institutions</p>
              <p className="text-3xl font-extrabold text-[#4F6C8A]">17</p>
            </div>
            <div className="bg-[#EAF0F6] p-3 rounded-full">
              <Landmark className="w-6 h-6 text-[#4F6C8A]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Fraud Cases Blocked</p>
              <p className="text-3xl font-extrabold text-[#C93C3C]">0</p>
            </div>
            <div className="bg-[#FBEBEB] p-3 rounded-full">
              <ShieldAlert className="w-6 h-6 text-[#C93C3C]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between mt-2 transition-all">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider">Recent Verification</p>
              <div className="flex items-center space-x-1.5 bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-green-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-700">{verifications[verifIdx].time}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-[#1A1816] leading-snug mb-1">
              {verifications[verifIdx].text}
            </p>
            <p className="text-xs text-[#5C5854] font-medium">{verifications[verifIdx].inst}</p>
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 border-t border-[#EAE3DC] mt-16">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E07A25]"></div>
          <h2 className="text-2xl font-bold text-[#1A1816]">How it works</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { icon: LogIn, title: 'Log In', desc: 'Access your secure account' },
            { icon: Cloud, title: 'Upload', desc: 'Securely store your data' },
            { icon: LinkIcon, title: 'Link', desc: 'Issue on blockchain' },
            { icon: QrCode, title: 'Generate QR', desc: 'Scan to share instantly' },
            { icon: CheckCircle, title: 'Verify', desc: 'Anyone can verify anywhere' }
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white border border-[#EAE3DC] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-[#E07A25]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#1A1816] text-sm mb-1">{step.title}</h3>
                <p className="text-[11px] text-[#8B8276] max-w-[100px] leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="py-16 md:py-24 border-t border-[#EAE3DC]">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1A1816] tracking-tight mb-4">Built for Bharat's Digital Infrastructure</h2>
          <p className="text-[#5C5854] text-lg max-w-2xl">Seamlessly integrated with national platforms to ensure your vocational credentials are recognized everywhere.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-16 h-16 bg-[#F5F1EB] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-[#4F6C8A]" strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-bold text-[#1A1816] mb-3">DigiLocker Ready</h3>
             <p className="text-[#5C5854] text-sm leading-relaxed">Push verified certificates directly to students' DigiLocker accounts for permanent, easy access.</p>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-16 h-16 bg-[#FFF4EA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Network className="w-8 h-8 text-[#E07A25]" strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-bold text-[#1A1816] mb-3">Skill India Digital</h3>
             <p className="text-[#5C5854] text-sm leading-relaxed">Fully compatible with the SID ecosystem, mapping credentials to the National Skills Qualification Framework.</p>
          </div>

          <div className="bg-white border border-[#EAE3DC] rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-16 h-16 bg-[#F2F4E6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Library className="w-8 h-8 text-[#6B7240]" strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-bold text-[#1A1816] mb-3">Academic Bank of Credits</h3>
             <p className="text-[#5C5854] text-sm leading-relaxed">Enable seamless vocational-to-academic mobility by linking with the national credit bank.</p>
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 border-t border-[#EAE3DC] mb-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-[#994914]"></div>
          <h2 className="text-2xl font-bold text-[#1A1816]">Live Activity</h2>
        </div>
        <div className="bg-[#F5F1EB] border border-[#EAE3DC] rounded-2xl h-40 flex flex-col items-center justify-center shadow-inner">
          <History className="w-8 h-8 text-[#8B8276] mb-3" strokeWidth={1.5} />
          <h3 className="font-bold text-[#1A1816]">No recent activity</h3>
          <p className="text-xs text-[#8B8276] mt-1">Updates every 10 seconds</p>
        </div>
      </div>
    </div>
  )
}
