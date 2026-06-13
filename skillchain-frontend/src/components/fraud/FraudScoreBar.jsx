import React from 'react'

export default function FraudScoreBar({ score=0 }){
  const pct = Math.max(0, Math.min(100, Math.round(score*100)))
  const color = pct>70? 'bg-red-500' : pct>40? 'bg-yellow-400':'bg-green-500'
  return (
    <div className="w-full bg-gray-200 h-4 rounded overflow-hidden">
      <div className={`h-4 ${color}`} style={{width: pct+'%'}} />
    </div>
  )
}
