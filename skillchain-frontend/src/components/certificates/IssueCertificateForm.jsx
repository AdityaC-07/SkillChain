import React, { useState } from 'react'
import { issueCertificate } from '../../services/certificateService'

export default function IssueCertificateForm(){
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({})
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  function next(){ setStep(s=>s+1) }
  function prev(){ setStep(s=>s-1) }

  async function submit(e){
    e.preventDefault()
    const data = new FormData()
    Object.entries(form).forEach(([k,v])=> data.append(k, v))
    if (file) data.append('certificate_pdf', file)
    setLoading(true)
    try{
      const res = await issueCertificate(data)
      alert('Minted: '+ JSON.stringify(res.data))
    }catch(err){
      alert(err.response?.data?.detail || 'Issue failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="mb-4">Step {step} of 3</div>
      {step===1 && (
        <div>
          <input placeholder="Learner name" onChange={e=>setForm({...form, learner_name:e.target.value})} className="w-full border p-2 mb-2" />
          <input placeholder="Learner email" onChange={e=>setForm({...form, learner_email:e.target.value})} className="w-full border p-2 mb-2" />
          <input placeholder="Learner wallet" onChange={e=>setForm({...form, learner_wallet:e.target.value})} className="w-full border p-2 mb-2" />
        </div>
      )}
      {step===2 && (
        <div>
          <input placeholder="Course name" onChange={e=>setForm({...form, course_name:e.target.value})} className="w-full border p-2 mb-2" />
          <input placeholder="Completion date" onChange={e=>setForm({...form, completion_date:e.target.value})} className="w-full border p-2 mb-2" />
          <select onChange={e=>setForm({...form, grade:e.target.value})} className="w-full border p-2 mb-2"><option>A</option><option>B</option></select>
        </div>
      )}
      {step===3 && (
        <div>
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])} />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {step>1 && <button onClick={prev} className="px-3 py-1 border">Back</button>}
        {step<3 && <button onClick={next} className="px-3 py-1 bg-amber text-white">Next</button>}
        {step===3 && <button onClick={submit} className="px-3 py-1 bg-emerald-500 text-white">{loading? 'Minting...':'Mint Certificate'}</button>}
      </div>
    </div>
  )
}
