```jsx
import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  FilePlus,
  ShieldCheck,
  AlertTriangle,
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
  Fingerprint,
  Search,
  Shield,
  User,
  Info,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue', label: 'Issue', icon: FilePlus },
    { id: 'verify', label: 'Verify', icon: ShieldCheck },
    { id: 'fraud', label: 'Fraud', icon: AlertTriangle },
  ];

  return (
    <div className="w-64 shrink-0">
      <div className="bg-[#F5F1EB] rounded-xl border border-[#EAE3DC] p-6">
        <div className="mb-8 flex items-center gap-3">
          {activeTab === 'issue' && (
            <div className="w-10 h-10 bg-[#D97706] rounded-full flex items-center justify-center shrink-0">
               <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-[#994914] text-lg font-bold leading-tight">SkillChain Portal</h2>
            <p className="text-[#8B8276] text-[11px] font-bold uppercase tracking-wider mt-0.5">
              {activeTab === 'issue' ? 'ISSUE AUTHORITY' : 'Vocational Verification'}
            </p>
          </div>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E07A25] text-[#1A1816]' 
                    : 'text-[#5C5854] hover:bg-[#EAE4DB]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1A1816]' : 'text-[#5C5854]'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

const Navbar = () => (
  <header className="w-full flex items-center justify-between py-6 px-10">
    <div className="text-[22px] font-black tracking-tight text-[#994914]">
      SKILLCHAIN
    </div>
    <div className="flex items-center space-x-8">
      <nav className="flex items-center space-x-6 text-[#5C5854] font-medium text-sm">
        <a href="#" className="hover:text-[#994914] border-b-2 border-[#994914] text-[#994914] pb-1">Verify</a>
        <a href="#" className="hover:text-[#994914]">About</a>
        <a href="#" className="hover:text-[#994914]">Login</a>
      </nav>
      <button className="bg-[#A0522D] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#8B4513] transition-colors">
        Get Certified
      </button>
    </div>
  </header>
);

const HomeView = () => (
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
          <button className="bg-[#E07A25] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#C96B1E] transition-colors">
            Get Certified
          </button>
          <button className="border-2 border-[#E07A25] text-[#1A1816] px-6 py-3 rounded-xl font-bold hover:bg-[#FFF4EA] transition-colors">
            Verify Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Certificates Issued</p>
            <p className="text-3xl font-extrabold text-[#1A1816]">12,548</p>
          </div>
          <div className="bg-[#FFF4EA] p-3 rounded-full">
            <BadgeCheck className="w-6 h-6 text-[#E07A25]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Verified Professionals</p>
            <p className="text-3xl font-extrabold text-[#6B7240]">12,320</p>
          </div>
          <div className="bg-[#F2F4E6] p-3 rounded-full">
            <Users className="w-6 h-6 text-[#6B7240]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Institutions</p>
            <p className="text-3xl font-extrabold text-[#4F6C8A]">17</p>
          </div>
          <div className="bg-[#EAF0F6] p-3 rounded-full">
            <Landmark className="w-6 h-6 text-[#4F6C8A]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-[#EAE3DC] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[#8B8276] text-xs font-bold uppercase tracking-wider mb-1">Fraud Cases Blocked</p>
            <p className="text-3xl font-extrabold text-[#C93C3C]">0</p>
          </div>
          <div className="bg-[#FBEBEB] p-3 rounded-full">
            <ShieldAlert className="w-6 h-6 text-[#C93C3C]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>

    <div className="mt-20">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-2.5 h-2.5 rounded-full bg-[#E07A25]"></div>
        <h2 className="text-2xl font-bold text-[#1A1816]">How it works</h2>
      </div>
      
      <div className="grid grid-cols-5 gap-6">
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
              <div className="w-16 h-16 bg-white border border-[#EAE3DC] rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#E07A25]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-[#1A1816] text-sm mb-1">{step.title}</h3>
              <p className="text-[11px] text-[#8B8276] max-w-[100px] leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>

    <div className="mt-20 mb-20">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-2.5 h-2.5 rounded-full bg-[#994914]"></div>
        <h2 className="text-2xl font-bold text-[#1A1816]">Live Activity</h2>
      </div>
      <div className="bg-[#F5F1EB] border border-[#EAE3DC] rounded-2xl h-40 flex flex-col items-center justify-center">
        <History className="w-8 h-8 text-[#8B8276] mb-3" strokeWidth={1.5} />
        <h3 className="font-bold text-[#1A1816]">No recent activity</h3>
        <p className="text-xs text-[#8B8276] mt-1">Updates every 10 seconds</p>
      </div>
    </div>
  </div>
);

const VerifyView = () => (
  <div className="flex-1 flex flex-col pt-4 relative">
    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFEFE0] rounded-full blur-[120px] -z-10 opacity-70"></div>
    
    <div className="mb-12">
      <h1 className="text-5xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
        Validate <span className="text-[#A0522D]">Achievement.</span>
      </h1>
      <p className="text-[#5C5854] text-lg max-w-2xl leading-relaxed">
        Enter a certificate ID to instantly verify vocational credentials on the blockchain. 
        Our decentralized ledger ensures that every skill is tamper-proof and authentic.
      </p>
    </div>

    <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 mb-8 shadow-sm">
      <label className="block text-[11px] font-bold text-[#5C5854] tracking-wider uppercase mb-4">
        CERTIFICATE ID VERIFICATION
      </label>
      <div className="flex space-x-4">
        <div className="flex-1 flex items-center border border-[#EAE3DC] rounded-xl px-4 bg-[#FDFBFA]">
          <Fingerprint className="w-5 h-5 text-[#8B8276] mr-3" />
          <input 
            type="text" 
            placeholder="e.g. SKL-8821-DAX-2024" 
            className="flex-1 bg-transparent border-none focus:outline-none py-4 text-[#1A1816] placeholder-[#8B8276]"
          />
        </div>
        <button className="bg-[#A0522D] text-white px-8 rounded-xl font-bold hover:bg-[#8B4513] transition-colors">
          Verify Now
        </button>
      </div>
      <div className="flex items-center text-xs text-[#8B8276] mt-4">
        <Info className="w-4 h-4 mr-2" />
        Searching live blockchain node: SkillChain-Mainnet-v2
      </div>
    </div>

    <div className="border border-dashed border-[#D2C8BC] rounded-3xl h-48 flex flex-col items-center justify-center bg-transparent mb-20">
      <Search className="w-8 h-8 text-[#8B8276] mb-4" strokeWidth={1.5} />
      <p className="text-[#5C5854] text-sm font-medium">Enter a certificate ID above to begin</p>
    </div>

    <div className="grid grid-cols-4 gap-8 pt-4 pb-20">
      {[
        { icon: Shield, label: 'ISO 27001 CERTIFIED' },
        { icon: ShieldCheck, label: 'GDPR COMPLIANT' },
        { icon: History, label: 'IMMUTABLE LOGS' },
        { icon: Landmark, label: 'GOV APPROVED' },
      ].map((feat, idx) => {
        const Icon = feat.icon;
        return (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5F1EB] rounded-full flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-[#8B8276]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-bold text-[#8B8276] tracking-wide uppercase">{feat.label}</p>
          </div>
        );
      })}
    </div>
  </div>
);

const IssueView = () => (
  <div className="flex-1 flex flex-col pt-4 relative">
    <div className="mb-12">
      <h1 className="text-4xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
        Issue New Certificate
      </h1>
      <p className="text-[#5C5854] text-lg max-w-2xl leading-relaxed">
        Complete the steps below to mint a verifiable vocational credential on the SkillChain blockchain.
      </p>
    </div>

    <div className="flex items-center justify-center mb-12 relative w-[80%] max-w-2xl mx-auto">
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#EAE3DC] -z-10"></div>
      <div className="flex justify-between w-full">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-[#EAE3DC] flex items-center justify-center text-sm font-bold text-[#1A1816]">1</div>
        <div className="w-8 h-8 rounded-full bg-white border-2 border-[#EAE3DC] flex items-center justify-center text-sm font-bold text-[#1A1816]">2</div>
        <div className="w-8 h-8 rounded-full bg-white border-2 border-[#EAE3DC] flex items-center justify-center text-sm font-bold text-[#1A1816]">3</div>
      </div>
    </div>

    <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 mb-20 shadow-sm max-w-3xl">
      <div className="flex items-center space-x-3 mb-8">
        <User className="w-6 h-6 text-[#A0522D]" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-[#1A1816]">Learner Details</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-[#1A1816] mb-2">
            Full Name
          </label>
          <input 
            type="text" 
            placeholder="As it appears on official ID" 
            className="w-full border border-[#EAE3DC] rounded-xl px-4 py-4 text-[#1A1816] placeholder-[#8B8276] focus:outline-none focus:border-[#E07A25]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A1816] mb-2">
            Aadhaar / National ID
          </label>
          <input 
            type="text" 
            placeholder="XXXX-XXXX-XXXX" 
            className="w-full border border-[#EAE3DC] rounded-xl px-4 py-4 text-[#1A1816] placeholder-[#8B8276] focus:outline-none focus:border-[#E07A25]"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button className="bg-[#A0522D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8B4513] transition-colors">
            Next Step
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function SkillchainApp() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#FDFBFA] font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-[1300px] mx-auto px-10 pt-8 pb-12 flex gap-12">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'dashboard' && <HomeView />}
        {activeTab === 'verify' && <VerifyView />}
        {activeTab === 'issue' && <IssueView />}
        {activeTab === 'fraud' && <div className="flex-1">Fraud view...</div>}
      </main>

      <footer className="border-t border-[#EAE3DC] py-8 mt-auto bg-[#FDFBFA]">
        <div className="max-w-[1300px] mx-auto px-10 flex items-center justify-between">
          <div>
            <div className="text-xl font-black tracking-tight text-[#994914] mb-2">
              SKILLCHAIN
            </div>
            <p className="text-[11px] text-[#8B8276] max-w-sm leading-tight">
              © 2024 SkillChain. Education verified on blockchain.<br/>
              Empowering vocational excellence through trust.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-[11px] font-medium text-[#5C5854]">
            <a href="#" className="hover:text-[#994914]">Terms of Service</a>
            <a href="#" className="hover:text-[#994914]">Privacy Policy</a>
            <a href="#" className="hover:text-[#994914]">Contact Support</a>
            <div className="flex space-x-3 ml-4">
              <div className="w-8 h-8 bg-[#F5F1EB] rounded-full"></div>
              <div className="w-8 h-8 bg-[#F5F1EB] rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```
