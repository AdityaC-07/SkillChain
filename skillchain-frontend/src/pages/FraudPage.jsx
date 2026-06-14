import React from 'react'
import { CloudUpload, ScanLine } from 'lucide-react'

export default function FraudPage() {
  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
          Fraud Scanner
        </h1>
        <p className="text-[#5C5854] text-lg max-w-2xl leading-relaxed">
          Use our advanced forensic engine to verify external vocational certificates against blockchain records and detected tampering patterns.
        </p>
      </div>

      <div className="border-2 border-dashed border-[#D2C8BC] rounded-3xl p-12 flex flex-col items-center justify-center bg-transparent mb-20 text-center min-h-[350px]">
        <div className="w-20 h-20 bg-[#FCDCC9] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
           <CloudUpload className="w-10 h-10 text-[#994914]" strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-[#1A1816] mb-3">Drag and drop certificate</h3>
        <p className="text-[#5C5854] text-sm mb-8">Support PDF, PNG, or JPG up to 10MB</p>
        <button className="bg-[#A0522D] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#8B4513] transition-colors shadow-sm">
          Browse Files
        </button>
      </div>

      <div className="flex flex-col items-center justify-center text-center mt-4 pb-12">
        <div className="w-16 h-16 bg-[#F5F1EB] rounded-full flex items-center justify-center mb-5">
          <ScanLine className="w-8 h-8 text-[#8B8276]" strokeWidth={1.5} />
        </div>
        <p className="text-[#8B8276] text-[11px] font-bold uppercase tracking-widest mb-2">Awaiting Analysis</p>
        <p className="text-[#8B8276] text-sm">Upload a file to begin the deep-scan fraud detection process.</p>
      </div>
    </div>
  )
}
