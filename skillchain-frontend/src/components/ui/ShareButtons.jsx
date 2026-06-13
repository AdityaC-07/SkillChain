import React, { useState } from 'react'
import PdfPreviewModal from './PdfPreviewModal'

export default function ShareButtons({ url, title }){
  const [previewOpen, setPreviewOpen] = useState(false)

  const shareNative = async ()=>{
    if (navigator.share) return navigator.share({ title, url })
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,'_blank')
  }

  const copyLink = async ()=>{
    try{ await navigator.clipboard.writeText(url); alert('Link copied') }catch(e){ alert('Copy failed') }
  }

  return (
    <div className="flex gap-2 items-center">
      <button aria-label="Share" onClick={shareNative} className="px-3 py-1 bg-navy-700 text-white rounded">Share</button>
      <button aria-label="Copy link" onClick={copyLink} className="px-3 py-1 border rounded">Copy</button>
      <button aria-label="Preview PDF" onClick={()=> setPreviewOpen(true)} className="px-3 py-1 border rounded">Preview</button>
      <a aria-label="Download PDF" href={url} download className="px-3 py-1 border rounded">Download</a>

      <PdfPreviewModal url={url} open={previewOpen} onClose={()=> setPreviewOpen(false)} />
    </div>
  )
}
