import React from 'react'
import { Link } from 'react-router-dom'
import { Fingerprint, Info, Search, Shield, ShieldCheck, History, Landmark } from 'lucide-react'

export default function VerifyPage() {
  return (
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
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 flex items-center border border-[#EAE3DC] rounded-xl px-4 bg-[#FDFBFA]">
            <Fingerprint className="w-5 h-5 text-[#8B8276] mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="e.g. SKL-8821-DAX-2024" 
              className="flex-1 bg-transparent border-none focus:outline-none py-4 text-[#1A1816] placeholder-[#8B8276]"
            />
          </div>
          <button className="bg-[#A0522D] text-white px-8 py-4 md:py-0 rounded-xl font-bold hover:bg-[#8B4513] transition-colors whitespace-nowrap">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4 pb-20">
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
  )
}
