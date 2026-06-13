import React from 'react'

export default function BlockchainInfo({ contractAddress, network }){
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-600">Network</div>
      <div className="font-mono text-sm">{network || 'Mumbai'}</div>
      <div className="mt-2 text-sm text-gray-600">Contract</div>
      <div className="font-mono text-xs">{contractAddress || 'Not deployed'}</div>
    </div>
  )
}
