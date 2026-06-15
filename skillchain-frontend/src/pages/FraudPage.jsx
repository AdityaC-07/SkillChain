import React from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  ShieldCheck,
  AlertTriangle,
  ScanSearch,
  Loader2,
  Brain,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react'

const PLACEHOLDER_PREVIEW =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#F5F1EB"/>
      <rect x="20" y="20" width="360" height="200" rx="8" fill="#EAE3DC"/>
      <text x="200" y="145" text-anchor="middle" fill="#8B8276" font-family="sans-serif" font-size="18" font-weight="bold">Sample Certificate</text>
      <text x="200" y="170" text-anchor="middle" fill="#8B8276" font-family="sans-serif" font-size="13">SkillChain — Blockchain Verified</text>
      <rect x="80" y="210" width="240" height="4" rx="2" fill="#994914"/>
      <rect x="120" y="230" width="160" height="4" rx="2" fill="#EAE3DC"/>
      <rect x="140" y="250" width="120" height="4" rx="2" fill="#EAE3DC"/>
    </svg>`
  )

const signalExplanations = {
  ml: 'ML Model: Vision Transformer trained to detect tampering patterns in document images',
  meta: 'Metadata: Checks EXIF data for editing software signatures and timestamp inconsistencies',
  visual: 'Visual Anomaly: Detects copy-paste regions, inconsistent noise/compression patterns',
  text: 'Text Region: Analyzes font consistency, spacing, and alignment of text blocks'
}

const signals = [
  { key: 'ml', label: 'ML Model Analysis' },
  { key: 'meta', label: 'Metadata Integrity' },
  { key: 'visual', label: 'Visual Anomaly Detection' },
  { key: 'text', label: 'Text Region Analysis' }
]

function AnimatedScoreBar({ value, color }) {
  return (
    <div className="h-3 bg-[#EAE3DC] rounded-full w-full overflow-hidden shadow-inner border border-gray-100">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      />
    </div>
  )
}

function SignalTooltip({ text, visible }) {
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-white border border-[#EAE3DC] rounded-xl shadow-lg p-3 pointer-events-none"
    >
      <p className="text-xs text-[#5C5854] leading-relaxed">{text}</p>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-[#EAE3DC] rotate-45" />
    </motion.div>
  )
}

function SignalRow({ label, value, colorClass, tooltipText, note }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center font-semibold text-[#1A1816] text-xs">
        <span className="flex items-center gap-1.5">
          {label}
          <span
            className="relative inline-flex"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Info className="w-3.5 h-3.5 text-[#8B8276] cursor-pointer" strokeWidth={2} />
            <SignalTooltip text={tooltipText} visible={hovered} />
          </span>
        </span>
        <span className={`font-extrabold text-sm ${colorClass}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#F5F1EB] rounded-full overflow-hidden w-full">
        <motion.div
          className={`h-full rounded-full ${colorClass === 'text-green-700' ? 'bg-green-600' : 'bg-[#C93C3C]'}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {note && (
        <p className="text-[10px] text-[#C93C3C] font-bold italic mt-0.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />{note}
        </p>
      )}
    </div>
  )
}

export default function FraudPage() {
  const [file, setFile] = React.useState(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState(null)
  const [barValue, setBarValue] = React.useState(0)

  const fileInputRef = React.useRef(null)

  React.useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setBarValue(result === 'GENUINE' ? 94 : 87)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setBarValue(0)
    }
  }, [result])

  const setFileData = (name, preview) => {
    setFile({
      name,
      size: '0.42 MB',
      preview
    })
    setResult(null)
    setBarValue(0)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFileData(selectedFile.name, URL.createObjectURL(selectedFile))
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = (e) => {
    e.preventDefault()
    const selectedFile = e.dataTransfer.files?.[0]
    if (selectedFile) {
      setFileData(selectedFile.name, URL.createObjectURL(selectedFile))
    }
  }

  const triggerFileSelect = () => fileInputRef.current?.click()

  const handleAnalyze = () => {
    if (!file) return
    setAnalyzing(true)
    setResult(null)

    setTimeout(() => {
      const nameLower = file.name.toLowerCase()
      const isFake = nameLower.includes('fake') || nameLower.includes('edit') || nameLower.includes('tamper')
      setResult(isFake ? 'FAKE' : 'GENUINE')
      setAnalyzing(false)
    }, 2000)
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setBarValue(0)
  }

  const handleSampleGenuine = () => {
    setFileData('certificate_verified_001.png', PLACEHOLDER_PREVIEW)
  }

  const handleSampleFake = () => {
    setFileData('certificate_fake_attempt.png', PLACEHOLDER_PREVIEW)
  }

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#FFF4EA] to-[#FDFBFA] border border-[#EAE3DC] rounded-2xl p-5 mb-8 flex items-center space-x-4 shadow-sm">
        <div className="w-10 h-10 bg-[#994914] rounded-xl flex items-center justify-center shrink-0">
          <ScanSearch className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-[#1A1816]">
          Demo Mode — Upload any certificate image to see AI fraud detection in action
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto w-full mb-20">

        {/* Upload & Initial State */}
        {!analyzing && !result && (
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#D2C8BC] hover:border-[#8B4513] rounded-3xl p-10 flex flex-col items-center justify-center bg-white text-center min-h-[340px] shadow-sm transition-all duration-300"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {file ? (
                <div className="space-y-6 w-full max-w-md">
                  <div className="relative border border-[#EAE3DC] rounded-2xl overflow-hidden bg-[#F5F1EB] max-h-[220px] shadow-inner flex items-center justify-center">
                    <img
                      src={file.preview}
                      alt="Certificate Preview"
                      className="max-h-[220px] w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-[#F5F1EB] p-3 rounded-xl border border-[#EAE3DC] text-xs">
                    <div className="flex items-center space-x-2 text-left truncate">
                      <FileCheck className="w-5 h-5 text-green-700 shrink-0" />
                      <div>
                        <p className="font-bold text-[#1A1816] truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[#8B8276] font-semibold">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="font-extrabold text-[#C93C3C] hover:underline cursor-pointer ml-3 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#FFF4EA] rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                    <Upload className="w-8 h-8 text-[#C96B1E]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1A1816] mb-2">Drag and drop certificate</h3>
                  <p className="text-[#5C5854] text-xs mb-6 font-semibold">Supports PNG, JPG, or JPEG images</p>
                  <button
                    onClick={triggerFileSelect}
                    className="bg-[#8B4513] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-sm cursor-pointer text-sm"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Sample Quick-Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSampleGenuine}
                className="flex items-center gap-2 bg-[#F2F4E6] border border-green-200 text-green-800 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-green-50 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Try Sample Genuine
              </button>
              <button
                onClick={handleSampleFake}
                className="flex items-center gap-2 bg-[#FBEBEB] border border-red-200 text-[#C93C3C] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Try Sample Fake
              </button>
            </div>

            {/* Analyze Button */}
            {file && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleAnalyze}
                  className="bg-[#1A1816] hover:bg-black text-white font-extrabold px-10 py-4 rounded-xl transition-all shadow-md flex items-center gap-2.5 cursor-pointer text-sm"
                >
                  <ScanSearch className="w-5 h-5" />
                  <span>Analyze with AI</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <div className="border border-[#EAE3DC] bg-white rounded-3xl p-16 flex flex-col items-center justify-center min-h-[350px] shadow-sm animate-fade-in text-center">
            <div className="relative mb-6">
              <Loader2 className="w-12 h-12 text-[#C96B1E] animate-spin" />
              <Brain className="w-5 h-5 text-[#8B4513] absolute inset-0 m-auto" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-extrabold text-[#1A1816] mb-2 animate-pulse">Running 4-signal AI analysis...</h3>
            <p className="text-sm text-[#5C5854] max-w-sm">
              Scanning visual layout, verifying metadata signatures, and analyzing text regions for alterations.
            </p>
          </div>
        )}

        {/* Result Screen */}
        {!analyzing && result && (
          <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 md:p-8 shadow-sm animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

              {/* Image Preview */}
              <div className="md:col-span-5 flex flex-col items-center space-y-4">
                <div className="border border-[#EAE3DC] rounded-2xl bg-[#F5F1EB] p-2 overflow-hidden w-full flex items-center justify-center shadow-inner">
                  <img
                    src={file?.preview}
                    alt="Scanned Document"
                    className="max-h-[240px] w-full object-contain rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#1A1816] truncate max-w-[180px]">{file?.name}</p>
                  <p className="text-[10px] text-[#8B8276] font-semibold">Analyzed Document</p>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="md:col-span-7 space-y-6">

                {/* Result Badge */}
                <div>
                  {result === 'GENUINE' ? (
                    <div className="flex items-center gap-2 bg-[#F2F4E6] border border-green-200 text-[#6B7240] px-4 py-2.5 rounded-2xl self-start w-fit">
                      <ShieldCheck className="w-6 h-6 text-green-700" strokeWidth={2.5} />
                      <span className="text-sm font-black tracking-wider uppercase">GENUINE — 94% Confidence</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#FBEBEB] border border-red-200 text-[#C93C3C] px-4 py-2.5 rounded-2xl self-start w-fit">
                      <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={2.5} />
                      <span className="text-sm font-black tracking-wider uppercase">FAKE — 87% Fraud Probability</span>
                    </div>
                  )}
                </div>

                {/* Overall Score Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-[#8B8276] uppercase tracking-wider text-[10px]">Overall Security Rating</span>
                    <span className={result === 'GENUINE' ? 'text-green-700 text-sm font-extrabold' : 'text-[#C93C3C] text-sm font-extrabold'}>
                      {result === 'GENUINE' ? '94%' : '13%'} Security
                    </span>
                  </div>
                  <AnimatedScoreBar
                    value={barValue}
                    color={result === 'GENUINE' ? 'bg-green-600' : 'bg-[#C93C3C]'}
                  />
                </div>

                {/* Signal Breakdown */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-[#8B8276] uppercase tracking-widest border-b border-[#EAE3DC] pb-1">
                    Forensic Signal Breakdown
                  </h4>

                  <div className="space-y-3">
                    {result === 'GENUINE' ? (
                      <>
                        {signals.map((s) => (
                          <SignalRow
                            key={s.key}
                            label={s.label}
                            value={{ ml: 96, meta: 92, visual: 95, text: 93 }[s.key]}
                            colorClass="text-green-700"
                            tooltipText={signalExplanations[s.key]}
                          />
                        ))}
                        <div className="rounded-xl p-4 border text-xs leading-relaxed bg-[#F2F4E6] border-green-200 text-green-800">
                          <p className="font-black mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Recommendation
                          </p>
                          <p className="font-medium">✓ This certificate appears authentic. Safe to proceed with blockchain verification.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {signals.map((s) => (
                          <SignalRow
                            key={s.key}
                            label={s.label}
                            value={{ ml: 23, meta: 15, visual: 31, text: 28 }[s.key]}
                            colorClass="text-[#C93C3C]"
                            tooltipText={signalExplanations[s.key]}
                            note={s.key === 'meta' ? "EXIF data shows editing software 'Adobe Photoshop 2024' — original certificates have no editing metadata" : undefined}
                          />
                        ))}
                        <div className="rounded-xl p-4 border text-xs leading-relaxed bg-[#FBEBEB] border-red-200 text-red-800">
                          <p className="font-black mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Critical Caution
                          </p>
                          <p className="font-medium">✗ High probability of tampering. Do not accept. Contact issuing institution to verify directly.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="border-t border-[#EAE3DC] pt-6 flex justify-end">
              <button
                onClick={handleReset}
                className="bg-[#1A1816] hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm text-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Scan Another Document</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analyzing && !result && !file && (
          <div className="flex flex-col items-center justify-center text-center mt-12 pb-12">
            <div className="w-16 h-16 bg-[#F5F1EB] rounded-full flex items-center justify-center mb-4 border border-[#EAE3DC]">
              <Brain className="w-6 h-6 text-[#8B8276]" strokeWidth={1.5} />
            </div>
            <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">AI Fraud Detection Ready</p>
            <p className="text-[#8B8276] text-xs max-w-sm">Upload a certificate image or try a sample above to begin analysis.</p>
          </div>
        )}

      </div>
    </div>
  )
}
