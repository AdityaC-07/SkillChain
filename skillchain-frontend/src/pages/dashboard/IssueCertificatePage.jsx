import React from 'react'
import { User } from 'lucide-react'

export default function IssueCertificatePage() {
  return (
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
  )
}
