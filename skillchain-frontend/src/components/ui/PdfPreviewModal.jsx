import React from 'react'

export default function PdfPreviewModal({ url, open, onClose }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white w-11/12 md:w-3/4 lg:w-2/3 h-4/5 rounded shadow p-4">
        <button aria-label="Close preview" onClick={onClose} className="absolute right-3 top-3">✕</button>
        <iframe title="PDF preview" src={url} className="w-full h-full" />
      </div>
    </div>
  )
}
