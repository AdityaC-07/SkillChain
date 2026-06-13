import React from 'react'

export default function QRShareCard({ qrUrl, downloadUrl }){
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <img src={qrUrl} alt="qr" className="mx-auto w-40 h-40" />
      <div className="mt-3">
        <a href={downloadUrl} className="text-amber underline">Download PDF</a>
      </div>
    </div>
  )
}
