import React, { useEffect, useState } from 'react'
import { issueCertificate } from '../../services/certificateService'
import { isValidAddress } from '../../utils/addressUtils'
import LoadingButton from '../ui/LoadingButton'
import { useNavigate } from 'react-router-dom'

const initialForm = {
  learner_name: '',
  learner_email: '',
  learner_wallet: '',
  course_name: '',
  completion_date: '',
  grade: 'A',
}

function validateEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function IssueCertificateForm(){
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [longWait, setLongWait] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [pendingTx, setPendingTx] = useState(null)
  const [savedPending, setSavedPending] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [autoRunDemo, setAutoRunDemo] = useState(false)
  const [issuedCertificateId, setIssuedCertificateId] = useState(null)

  // Load demo data from localStorage if available
  useEffect(() => {
    const demoData = localStorage.getItem('demoFormData')
    const isDemoMode = localStorage.getItem('demoMode')
    if (demoData && isDemoMode === 'true') {
      const parsed = JSON.parse(demoData)
      setForm(parsed)
      setDemoMode(true)
      // Clear demo mode after loading
      localStorage.removeItem('demoMode')
    }
  }, [])

  useEffect(()=>{
    let timeout
    if (loading){
      timeout = window.setTimeout(()=> setLongWait(true), 15000)
    }
    return () => window.clearTimeout(timeout)
  }, [loading])

  const onChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    if (field === 'learner_wallet' && value){
      if (!isValidAddress(value)){
        setErrors(e => ({ ...e, learner_wallet: 'Wallet address must be 0x + 40 hex characters.' }))
      }
    }
  }

  function validateStep(currentStep){
    const nextErrors = {}
    if (currentStep === 1){
      if (!form.learner_name) nextErrors.learner_name = 'Learner name is required.'
      if (!form.learner_email) nextErrors.learner_email = 'Learner email is required.'
      else if (!validateEmail(form.learner_email)) nextErrors.learner_email = 'Enter a valid email address.'
      if (!form.learner_wallet) nextErrors.learner_wallet = 'Wallet address is required.'
      else if (!isValidAddress(form.learner_wallet)) nextErrors.learner_wallet = 'Wallet address must be 0x + 40 hex characters.'
    }
    if (currentStep === 2){
      if (!form.course_name) nextErrors.course_name = 'Course name is required.'
      if (!form.completion_date) nextErrors.completion_date = 'Completion date is required.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function next(){
    if (validateStep(step)) setStep(s=>s+1)
  }

  function prev(){ setStep(s=>s-1) }

  function savePending(){
    if (!pendingTx) return
    const pendingCertificates = JSON.parse(localStorage.getItem('pendingCertificates') || '[]')
    const newItem = {
      txHash: pendingTx,
      learner_name: form.learner_name,
      course_name: form.course_name,
      createdAt: new Date().toISOString(),
    }
    const exists = pendingCertificates.some(item => item.txHash === pendingTx)
    if (!exists) pendingCertificates.unshift(newItem)
    localStorage.setItem('pendingCertificates', JSON.stringify(pendingCertificates))
    setSavedPending(true)
  }

  async function submit(e){
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')
    setSavedPending(false)

    if (!validateStep(1) || !validateStep(2)) return
    if (!file){
      setErrors(e => ({ ...e, file: 'Please upload the PDF certificate.' }))
      return
    }

    const data = new FormData()
    Object.entries(form).forEach(([k,v])=> data.append(k, v))
    data.append('certificate_pdf', file)

    setLoading(true)
    try{
      const res = await issueCertificate(data)
      const txHash = res.data?.tx_hash || res.data?.transactionHash
      const certificateId = res.data?.certificate_id
      if (txHash){
        setPendingTx(txHash)
        setSubmitSuccess('Transaction submitted. You can save it to check status later.')
      }
      if (certificateId){
        setIssuedCertificateId(certificateId)
        setSubmitSuccess('Certificate issued successfully!')
        // Auto-navigate to verify page if in auto-run demo mode
        if (autoRunDemo) {
          setTimeout(() => {
            navigate(`/verify?cert_id=${certificateId}`)
          }, 2000)
        }
      } else {
        setSubmitSuccess('Certificate issuance request was sent successfully.')
      }
    }catch(err){
      setSubmitError(err.response?.data?.detail || 'Issue failed. Please try again.')
    }finally{
      setLoading(false)
    }
  }

  async function runFullDemo(){
    setAutoRunDemo(true)
    // Auto-fill steps
    setStep(1)
    await new Promise(r => setTimeout(r, 500))
    setStep(2)
    await new Promise(r => setTimeout(r, 500))
    setStep(3)
    // Create a dummy file for demo
    const dummyFile = new File(['dummy content'], 'demo_certificate.pdf', { type: 'application/pdf' })
    setFile(dummyFile)
    await new Promise(r => setTimeout(r, 500))
    // Submit
    const e = { preventDefault: () => {} }
    await submit(e)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-semibold">Issue Certificate</div>
        {demoMode && (
          <button
            type="button"
            onClick={runFullDemo}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            🚀 Run Full Demo
          </button>
        )}
      </div>
      <div className="mb-4 text-sm text-slate-600">Step {step} of 3</div>

      <form onSubmit={submit}>
        {step === 1 && (
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium">Learner name</span>
              <input value={form.learner_name} onChange={e=>onChange('learner_name', e.target.value)} className={`w-full border p-2 rounded mt-1 ${errors.learner_name ? 'border-red-500' : 'border-slate-300'}`} />
            </label>
            {errors.learner_name && <p className="text-red-500 text-sm mt-1">{errors.learner_name}</p>}

            <label className="block mb-2 mt-4">
              <span className="text-sm font-medium">Learner email</span>
              <input value={form.learner_email} onChange={e=>onChange('learner_email', e.target.value)} className={`w-full border p-2 rounded mt-1 ${errors.learner_email ? 'border-red-500' : 'border-slate-300'}`} />
            </label>
            {errors.learner_email && <p className="text-red-500 text-sm mt-1">{errors.learner_email}</p>}

            <label className="block mb-2 mt-4">
              <span className="text-sm font-medium">Learner wallet</span>
              <input value={form.learner_wallet} onChange={e=>onChange('learner_wallet', e.target.value)} className={`w-full border p-2 rounded mt-1 ${errors.learner_wallet ? 'border-red-500' : 'border-slate-300'}`} placeholder="0x..." />
            </label>
            {errors.learner_wallet && <p className="text-red-500 text-sm mt-1">{errors.learner_wallet}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium">Course name</span>
              <input value={form.course_name} onChange={e=>onChange('course_name', e.target.value)} className={`w-full border p-2 rounded mt-1 ${errors.course_name ? 'border-red-500' : 'border-slate-300'}`} />
            </label>
            {errors.course_name && <p className="text-red-500 text-sm mt-1">{errors.course_name}</p>}

            <label className="block mb-2 mt-4">
              <span className="text-sm font-medium">Completion date</span>
              <input type="date" value={form.completion_date} onChange={e=>onChange('completion_date', e.target.value)} className={`w-full border p-2 rounded mt-1 ${errors.completion_date ? 'border-red-500' : 'border-slate-300'}`} />
            </label>
            {errors.completion_date && <p className="text-red-500 text-sm mt-1">{errors.completion_date}</p>}

            <label className="block mb-2 mt-4">
              <span className="text-sm font-medium">Grade</span>
              <select value={form.grade} onChange={e=>onChange('grade', e.target.value)} className="w-full border p-2 rounded mt-1">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium">Certificate PDF</span>
              <input type="file" accept="application/pdf" onChange={e=>{ setFile(e.target.files[0]); setErrors(e=>({...e,file:''})) }} className="w-full border p-2 rounded mt-1" />
            </label>
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
            
            {file && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">📄 PDF Preview</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <embed
                    src={URL.createObjectURL(file)}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Review the certificate above before minting</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {step>1 && <button type="button" onClick={prev} className="px-4 py-2 border rounded">Back</button>}
          {step<3 && <button type="button" onClick={next} className="px-4 py-2 bg-amber text-white rounded">Next</button>}
          {step===3 && <LoadingButton type="submit" loading={loading} className="bg-emerald-500 text-white">Mint Certificate</LoadingButton>}
        </div>
      </form>

      {submitError && <div className="mt-4 text-red-600">{submitError}</div>}
      {submitSuccess && <div className="mt-4 text-green-700">{submitSuccess}</div>}

      {longWait && (
        <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p>This is taking longer than usual. Polygon Mumbai can be slow — please don't close this tab.</p>
        </div>
      )}

      {pendingTx && (
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Pending transaction hash saved after issuance attempt:</p>
          <p className="font-mono text-sm break-all mt-2">{pendingTx}</p>
          {!savedPending ? (
            <button onClick={savePending} className="mt-3 px-4 py-2 bg-amber text-white rounded">Check status later</button>
          ) : (
            <div className="mt-3 text-sm text-emerald-700">Saved to Pending Certificates.</div>
          )}
        </div>
      )}
    </div>
  )
}
