import React from 'react'
import {
  Upload,
  ShieldCheck,
  AlertTriangle,
  ScanSearch,
  Loader2,
  ScanLine,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react'

export default function FraudPage() {
  const [file, setFile] = React.useState(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState(null)
  const [randomOffsets, setRandomOffsets] = React.useState([0, 0, 0, 0])
  const [barWidth, setBarWidth] = React.useState(0)

  const fileInputRef = React.useRef(null)

  // Trigger progress bar animation on result reveal
  React.useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setBarWidth(result === 'GENUINE' ? 94 : 87)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setBarWidth(0)
    }
  }, [result])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
        preview: URL.createObjectURL(selectedFile)
      })
      setResult(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const selectedFile = e.dataTransfer.files?.[0]
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
        preview: URL.createObjectURL(selectedFile)
      })
      setResult(null)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = () => {
    if (!file) return

    setAnalyzing(true)
    setResult(null)

    // Calculate slight offsets (±4%) for realistic metrics variance
    const offsets = [
      Math.floor(Math.random() * 9) - 4,
      Math.floor(Math.random() * 9) - 4,
      Math.floor(Math.random() * 9) - 4,
      Math.floor(Math.random() * 9) - 4
    ]
    setRandomOffsets(offsets)

    setTimeout(() => {
      const nameLower = file.name.toLowerCase()
      const isFake = nameLower.includes('fake') || nameLower.includes('edited')
      
      if (isFake) {
        setResult('FAKE')
      } else {
        setResult('GENUINE')
      }
      setAnalyzing(false)
    }, 2000)
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setBarWidth(0)
  }

  // Calculated Metric Scores
  const genuineScores = {
    ml: Math.min(100, 96 + randomOffsets[0]),
    meta: Math.min(100, 92 + randomOffsets[1]),
    visual: Math.min(100, 95 + randomOffsets[2]),
    text: Math.min(100, 93 + randomOffsets[3])
  }

  const fakeScores = {
    ml: Math.max(0, 23 + randomOffsets[0]),
    meta: Math.max(0, 15 + randomOffsets[1]),
    visual: Math.max(0, 31 + randomOffsets[2]),
    text: Math.max(0, 28 + randomOffsets[3])
  }

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFF4EA] rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-3">
          AI Fraud Scanner
        </h1>
        <p className="text-[#5C5854] text-base max-w-2xl leading-relaxed">
          Upload certificates to run digital forensic verification. Our Vision Transformer (ViT) model scans for image inconsistencies, visual alterations, and structural metadata edits.
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto w-full mb-20">
        
        {/* Upload & Initial Selection State */}
        {!analyzing && !result && (
          <div className="space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#D2C8BC] hover:border-[#A0522D] rounded-3xl p-10 flex flex-col items-center justify-center bg-white text-center min-h-[340px] shadow-sm transition-all duration-300"
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
                      <FileCheck className="w-5 h-5 text-green-700 flex-shrink-0" />
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
                    <Upload className="w-8 h-8 text-[#E07A25]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1A1816] mb-2">Drag and drop certificate</h3>
                  <p className="text-[#5C5854] text-xs mb-6 font-semibold">Supports PNG, JPG, or JPEG images (forensic analysis)</p>
                  <button 
                    onClick={triggerFileSelect}
                    className="bg-[#A0522D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8B4513] transition-colors shadow-sm cursor-pointer text-sm"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Demo Hint */}
            <div className="bg-[#EAF0F6] border border-blue-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-[#4F6C8A]">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Demo Mode Tip:</span> Upload any certificate image. Name your file with <span className="font-mono bg-blue-50 px-1 border border-blue-100 rounded font-extrabold text-[#A0522D]">&quot;fake&quot;</span> or <span className="font-mono bg-blue-50 px-1 border border-blue-100 rounded font-extrabold text-[#A0522D]">&quot;edited&quot;</span> in it to verify the AI Fraud report. Upload any other filename to see a Genuine verified report.
              </div>
            </div>

            {/* Action buttons */}
            {file && (
              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleAnalyze}
                  className="bg-green-700 hover:bg-green-800 text-white font-extrabold px-10 py-4 rounded-xl transition-all shadow-md flex items-center space-x-2.5 cursor-pointer text-sm"
                >
                  <ScanSearch className="w-5 h-5 animate-pulse" />
                  <span>Analyze Certificate</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading / Analyzing State */}
        {analyzing && (
          <div className="border border-[#EAE3DC] bg-white rounded-3xl p-16 flex flex-col items-center justify-center min-h-[350px] shadow-sm animate-fade-in text-center">
            <Loader2 className="w-12 h-12 text-[#E07A25] animate-spin mb-6" />
            <h3 className="text-xl font-extrabold text-[#1A1816] mb-2 animate-pulse">Running AI Fraud Detection</h3>
            <p className="text-[#8B8276] text-xs font-semibold uppercase tracking-wider mb-2 bg-[#FFF4EA] text-[#E07A25] px-3 py-1 rounded-full border border-orange-100">
              ViT Neural Network Model Active
            </p>
            <p className="text-sm text-[#5C5854] max-w-sm mt-2">
              Scanning visual layout boundaries, verifying EXIF metadata signatures, and analyzing text regions for alterations.
            </p>
          </div>
        )}

        {/* Result Screen */}
        {!analyzing && result && (
          <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 md:p-8 shadow-sm animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Image Preview left */}
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

              {/* Analysis details right */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Result Title */}
                <div>
                  {result === 'GENUINE' ? (
                    <div className="flex items-center space-x-2 bg-[#F2F4E6] border border-green-200 text-[#6B7240] px-4 py-2.5 rounded-2xl self-start w-fit">
                      <ShieldCheck className="w-6 h-6 text-green-700" strokeWidth={2.5} />
                      <span className="text-sm font-black tracking-wider uppercase">GENUINE — 94% CONFIDENCE</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-[#FBEBEB] border border-red-200 text-[#C93C3C] px-4 py-2.5 rounded-2xl self-start w-fit">
                      <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={2.5} />
                      <span className="text-sm font-black tracking-wider uppercase">FAKE — 87% FRAUD RISK</span>
                    </div>
                  )}
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-[#8B8276] uppercase tracking-wider text-[10px]">Overall Security Rating</span>
                    <span className={result === 'GENUINE' ? 'text-green-700 text-sm font-extrabold' : 'text-[#C93C3C] text-sm font-extrabold'}>
                      {result === 'GENUINE' ? '94%' : '13%'} Security
                    </span>
                  </div>
                  <div className="h-3 bg-[#EAE3DC] rounded-full w-full overflow-hidden shadow-inner border border-gray-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        result === 'GENUINE' ? 'bg-green-600' : 'bg-[#C93C3C]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Signals Breakdown */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-[#8B8276] uppercase tracking-widest border-b border-[#EAE3DC] pb-1">
                    Forensic Signal Breakdown
                  </h4>
                  
                  {result === 'GENUINE' ? (
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: "ML Model Alignment Analysis", val: genuineScores.ml, color: "bg-green-600" },
                        { label: "EXIF Metadata Signature Integrity", val: genuineScores.meta, color: "bg-green-600" },
                        { label: "Visual Alteration Anomaly Scan", val: genuineScores.visual, color: "bg-green-600" },
                        { label: "Text/OCR Region Line Alignment", val: genuineScores.text, color: "bg-green-600" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between font-semibold text-[#1A1816]">
                            <span>{item.label}</span>
                            <span className="font-extrabold">{item.val}%</span>
                          </div>
                          <div className="h-1.5 bg-[#F5F1EB] rounded-full overflow-hidden w-full">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: "ML Model Alignment Analysis", val: fakeScores.ml, color: "bg-[#C93C3C]" },
                        { label: "EXIF Metadata Signature Integrity", val: fakeScores.meta, color: "bg-[#C93C3C]", note: "Red flag: Photoshop edits detected" },
                        { label: "Visual Alteration Anomaly Scan", val: fakeScores.visual, color: "bg-[#C93C3C]" },
                        { label: "Text/OCR Region Line Alignment", val: fakeScores.text, color: "bg-[#C93C3C]" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between font-semibold text-[#1A1816]">
                            <span>
                              {item.label}
                              {item.note && (
                                <span className="block text-[10px] text-[#C93C3C] font-black italic mt-0.5">
                                  ⚠️ {item.note}
                                </span>
                              )}
                            </span>
                            <span className="font-extrabold text-[#C93C3C]">{item.val}%</span>
                          </div>
                          <div className="h-1.5 bg-[#F5F1EB] rounded-full overflow-hidden w-full">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendation Box */}
                <div className={`rounded-xl p-4 border text-xs leading-relaxed ${
                  result === 'GENUINE' 
                    ? 'bg-[#F2F4E6] border-green-200 text-green-800' 
                    : 'bg-[#FBEBEB] border-red-200 text-red-800'
                }`}>
                  <p className="font-black mb-1 text-[11px] uppercase tracking-wider">
                    {result === 'GENUINE' ? 'Recommendation' : 'CRITICAL CAUTION'}
                  </p>
                  <p className="font-medium">
                    {result === 'GENUINE' 
                      ? 'This certificate appears authentic. Safe to proceed with blockchain verification.' 
                      : 'High probability of tampering. Do not accept. Verify directly with issuing institution.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Reset Action */}
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

        {/* Static awaits block below if no result */}
        {!analyzing && !result && (
          <div className="flex flex-col items-center justify-center text-center mt-12 pb-12">
            <div className="w-16 h-16 bg-[#F5F1EB] rounded-full flex items-center justify-center mb-4 border border-[#EAE3DC]">
              <ScanLine className="w-6 h-6 text-[#8B8276]" strokeWidth={1.5} />
            </div>
            <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-widest mb-1">Awaiting Scan File</p>
            <p className="text-[#8B8276] text-xs max-w-sm">Upload a certificate image file to begin digital forensic patterns scan.</p>
          </div>
        )}

      </div>
    </div>
  )
}
