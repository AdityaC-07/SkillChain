import React from 'react'
import {
  FileText,
  Upload,
  Link2,
  QrCode,
  CheckCircle2,
  Loader2,
  Download,
  Copy,
  ExternalLink,
  User,
  Award,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  Check
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function IssueCertificatePage() {
  // Step state
  const [currentStep, setCurrentStep] = React.useState(1)

  // Prefilled Form Data
  const [learnerName, setLearnerName] = React.useState('Amit Verma')
  const [learnerEmail, setLearnerEmail] = React.useState('amit.verma@example.com')
  const [learnerWallet, setLearnerWallet] = React.useState('0x8D3e2f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d4a')
  
  const [courseName, setCourseName] = React.useState('Plumbing & Pipefitting — NSQF Level 3')
  const [institutionName] = React.useState('Govt ITI, Lucknow') // Read-only
  const [completionDate, setCompletionDate] = React.useState('2026-06-01')
  const [grade, setGrade] = React.useState('A')
  const [nsqfLevel, setNsqfLevel] = React.useState('3')
  
  const [uploadedFile, setUploadedFile] = React.useState({
    name: 'amit_verma_plumbing_cert.pdf',
    size: '145 KB'
  })

  // Simulated Pipeline States
  const [minting, setMinting] = React.useState(false)
  const [pipelineStep, setPipelineStep] = React.useState(0)
  const [success, setSuccess] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const verifyUrl = `${window.location.origin}/verify?id=SKILLCHAIN-2025-PLM-00203`

  // Action handlers
  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleMint = () => {
    setMinting(true)
    setPipelineStep(0)
    
    // Simulate pipeline phases (1.5s each)
    setTimeout(() => {
      setPipelineStep(1) // Uploading to IPFS
      setTimeout(() => {
        setPipelineStep(2) // Minting NFT on Polygon
        setTimeout(() => {
          setPipelineStep(3) // Generating QR code
          setTimeout(() => {
            setPipelineStep(4) // Complete
            setTimeout(() => {
              setMinting(false)
              setSuccess(true)
            }, 600)
          }, 1500)
        }, 1500)
      }, 1500)
    }, 1500)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `SKILLCHAIN SECURE BLOCKCHAIN CERTIFICATE\n` +
      `==========================================\n` +
      `Certificate ID: SKILLCHAIN-2025-PLM-00203\n` +
      `Learner Name  : Amit Verma\n` +
      `Course Name   : Plumbing & Pipefitting — NSQF Level 3\n` +
      `Institution   : Govt ITI, Lucknow\n` +
      `Date Issued   : 2026-06-01\n` +
      `Grade         : A\n` +
      `------------------------------------------\n` +
      `Verification Link: ${verifyUrl}\n` +
      `Transaction Hash: 0x2f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a\n` +
      `IPFS Hash: QmZ3P7t4YJd1K5XF9N8s3w2eG6q4D7u8H9z0x1c2v3b4\n`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "SKILLCHAIN-2025-PLM-00203.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const resetForm = () => {
    setSuccess(false)
    setCurrentStep(1)
  }

  const pipelineStages = [
    "Generating certificate PDF...",
    "Uploading to IPFS...",
    "Minting NFT on Polygon...",
    "Generating QR code..."
  ]

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFF4EA] rounded-full blur-[120px] -z-10 opacity-60"></div>
      
      {/* Demo Badge */}
      <div className="mb-6 self-start flex items-center space-x-2 bg-[#FFF4EA] border border-[#E07A25] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#E07A25] shadow-sm animate-pulse">
        <Link2 className="w-4 h-4" />
        <span>Demo Mode — blockchain minting is simulated for this presentation</span>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-3">
          Issue New Certificate
        </h1>
        <p className="text-[#5C5854] text-base max-w-2xl leading-relaxed">
          Complete the steps below to mint a verifiable vocational credential on the SkillChain blockchain.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-12 relative w-full max-w-lg mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#EAE3DC] -z-10"></div>
        <div className="flex justify-between w-full">
          {[
            { step: 1, label: "Learner Details" },
            { step: 2, label: "Certificate Details" },
            { step: 3, label: "Upload & Review" }
          ].map((item) => {
            const isCompleted = currentStep > item.step
            const isActive = currentStep === item.step
            return (
              <div key={item.step} className="flex flex-col items-center relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-600 border-2 border-green-600 text-white' 
                      : isActive 
                        ? 'bg-[#A0522D] border-2 border-[#A0522D] text-white ring-4 ring-[#FFF4EA]' 
                        : 'bg-white border-2 border-[#EAE3DC] text-[#8B8276]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : item.step}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 absolute top-10 whitespace-nowrap ${
                  isActive ? 'text-[#A0522D]' : isCompleted ? 'text-green-700' : 'text-[#8B8276]'
                }`}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 mb-20 shadow-sm max-w-2xl mx-auto w-full mt-4">
        {/* Step 1: Learner Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#FFF4EA] rounded-lg">
                <User className="w-5 h-5 text-[#E07A25]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1A1816]">Learner Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                Learner Full Name
              </label>
              <input 
                type="text" 
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="As it appears on official identification" 
                className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] placeholder-[#8B8276] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                Learner Email Address
              </label>
              <input 
                type="email" 
                value={learnerEmail}
                onChange={(e) => setLearnerEmail(e.target.value)}
                placeholder="email@example.com" 
                className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] placeholder-[#8B8276] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                Student Wallet Address (Blockchain Identifier)
              </label>
              <input 
                type="text" 
                value={learnerWallet}
                onChange={(e) => setLearnerWallet(e.target.value)}
                placeholder="0x..." 
                className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] placeholder-[#8B8276] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] font-mono text-xs shadow-inner"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleNext}
                className="bg-[#A0522D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8B4513] transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Certificate Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#F2F4E6] rounded-lg">
                <Award className="w-5 h-5 text-[#6B7240]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1A1816]">Certificate Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                Course/Trade Name
              </label>
              <input 
                type="text" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Electrician Level 4" 
                className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] placeholder-[#8B8276] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                  Issuing Institution (Logged In)
                </label>
                <input 
                  type="text" 
                  value={institutionName}
                  readOnly
                  className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#5C5854] bg-[#F5F1EB] focus:outline-none text-sm font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                  Date of Completion
                </label>
                <input 
                  type="date" 
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                  Grade / Evaluation
                </label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                  NSQF Level
                </label>
                <select 
                  value={nsqfLevel} 
                  onChange={(e) => setNsqfLevel(e.target.value)}
                  className="w-full border border-[#EAE3DC] rounded-xl px-4 py-3.5 text-[#1A1816] bg-[#FDFBFA] focus:outline-none focus:border-[#E07A25] text-sm font-semibold shadow-inner"
                >
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button 
                onClick={handleBack}
                className="border-2 border-[#EAE3DC] text-[#5C5854] px-6 py-3 rounded-xl font-bold hover:bg-[#FDFBFA] transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={handleNext}
                className="bg-[#A0522D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8B4513] transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Upload */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#EAF0F6] rounded-lg">
                <FileCheck className="w-5 h-5 text-[#4F6C8A]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1A1816]">Review & Upload</h2>
            </div>

            {/* Structured Summary */}
            <div className="bg-[#F5F1EB] rounded-2xl p-5 border border-[#EAE3DC] space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#EAE3DC] pb-2">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Learner Name</span>
                <span className="font-extrabold text-[#1A1816]">{learnerName}</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE3DC] pb-2">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Learner Email</span>
                <span className="font-semibold text-[#1A1816]">{learnerEmail}</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE3DC] pb-2">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Wallet Address</span>
                <span className="font-mono text-xs text-[#1A1816] truncate max-w-[200px]" title={learnerWallet}>{learnerWallet}</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE3DC] pb-2">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Course Name</span>
                <span className="font-extrabold text-[#1A1816] text-right max-w-[240px]">{courseName}</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE3DC] pb-2">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Institution</span>
                <span className="font-bold text-[#1A1816]">{institutionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8276] font-bold uppercase text-[10px] tracking-wider">Date & Grade</span>
                <span className="font-bold text-[#1A1816]">{completionDate} (Grade {grade}, L{nsqfLevel})</span>
              </div>
            </div>

            {/* Drag and Drop File Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#8B8276] uppercase tracking-wider mb-2">
                Supporting PDF / Proof
              </label>
              <div className="border-2 border-dashed border-[#D2C8BC] hover:border-[#A0522D] rounded-2xl p-6 flex flex-col items-center justify-center bg-[#FDFBFA] cursor-pointer transition-colors relative">
                {uploadedFile ? (
                  <div className="flex items-center space-x-3 w-full justify-center">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#1A1816] truncate max-w-[240px]">{uploadedFile.name}</p>
                      <p className="text-xs text-[#8B8276]">{uploadedFile.size} • Ready for upload</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
                      className="text-xs font-bold text-[#C93C3C] hover:underline ml-4"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center" onClick={() => setUploadedFile({ name: 'custom_cert_document.pdf', size: '210 KB' })}>
                    <Upload className="w-8 h-8 text-[#8B8276] mb-3 mx-auto" />
                    <p className="text-sm font-bold text-[#1A1816]">Drag & Drop certificate files here</p>
                    <p className="text-xs text-[#8B8276] mt-1">PDF or image files up to 10MB (Simulated)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button 
                onClick={handleBack}
                className="border-2 border-[#EAE3DC] text-[#5C5854] px-6 py-3 rounded-xl font-bold hover:bg-[#FDFBFA] transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={handleMint}
                disabled={!uploadedFile}
                className={`px-8 py-3 rounded-xl font-bold text-white flex items-center space-x-2 shadow-sm cursor-pointer transition-colors ${
                  uploadedFile ? 'bg-green-700 hover:bg-green-800' : 'bg-[#D2C8BC] cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Mint Certificate</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Pipeline Modal */}
      {minting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#EAE3DC] pb-4">
              <Loader2 className="w-6 h-6 text-[#A0522D] animate-spin" />
              <h3 className="text-lg font-extrabold text-[#1A1816]">Executing Blockchain Pipeline</h3>
            </div>

            <div className="space-y-4">
              {pipelineStages.map((stage, idx) => {
                const isCompleted = pipelineStep > idx
                const isActive = pipelineStep === idx
                return (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center border border-green-300">
                          <Check className="w-3.5 h-3.5 text-green-700" strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-[#E07A25] animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#F5F1EB] border border-[#EAE3DC]" />
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${
                      isCompleted 
                        ? 'text-green-700 font-bold' 
                        : isActive 
                          ? 'text-[#1A1816] font-bold' 
                          : 'text-[#8B8276]'
                    }`}>
                      {stage}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-[#8B8276] text-center italic mt-2">
              Writing to Polygon block and generating IPFS links...
            </p>
          </div>
        </div>
      )}

      {/* Success Modal Card */}
      {success && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative my-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2 border-b border-[#EAE3DC] pb-6">
              <div className="w-16 h-16 bg-[#F2F4E6] border border-green-200 rounded-full flex items-center justify-center text-green-700 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[#1A1816]">Certificate Issued Successfully!</h2>
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest bg-[#F2F4E6] px-3 py-1 rounded-full border border-green-200 mt-1">
                Minted on Polygon
              </p>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="bg-[#F5F1EB] p-4 rounded-2xl border border-[#EAE3DC] flex flex-col items-center">
                <p className="text-[10px] font-bold text-[#8B8276] uppercase tracking-wider mb-1">Generated Certificate ID</p>
                <p className="text-base font-extrabold text-[#1A1816] font-mono select-all">SKILLCHAIN-2025-PLM-00203</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#EAE3DC] rounded-2xl shadow-inner relative group">
                <p className="text-[10px] font-bold text-[#8B8276] uppercase tracking-wider mb-3">On-Chain verification QR</p>
                <div className="p-2 bg-white rounded-lg border border-[#EAE3DC] shadow-sm">
                  <QRCodeSVG 
                    value={verifyUrl} 
                    size={160} 
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-[10px] text-[#8B8276] mt-2 font-medium">Scan QR to verify live proof instantly</p>
              </div>

              {/* Hashes */}
              <div className="bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B8276] font-bold uppercase text-[9px] tracking-wider">Transaction Hash</span>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-[#1A1816]">0x2f8a...c0d4</span>
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="text-[#8B8276] hover:text-[#4F6C8A] p-0.5 rounded hover:bg-[#F5F1EB]"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8B8276] font-bold uppercase text-[9px] tracking-wider">IPFS Hash</span>
                  <span className="font-mono text-[#1A1816]">QmZ3P7t4...v3b4</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleCopyLink}
                className="bg-white border-2 border-[#EAE3DC] hover:border-[#A0522D] text-[#1A1816] px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-700" />
                    <span className="text-green-700 font-extrabold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Verify Link</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleDownload}
                className="bg-[#A0522D] text-white hover:bg-[#8B4513] px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Proof</span>
              </button>
            </div>

            {/* Close Button */}
            <button 
              onClick={resetForm}
              className="w-full bg-[#1A1816] hover:bg-black text-white py-3 rounded-xl font-extrabold transition-colors text-center text-sm cursor-pointer shadow-sm"
            >
              Issue Another Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
