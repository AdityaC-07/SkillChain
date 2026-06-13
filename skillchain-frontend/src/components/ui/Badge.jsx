import React from 'react'

export default function Badge({ children, color='bg-amber' }){
  return (<span className={`inline-block px-2 py-1 text-xs rounded ${color} text-white`}>{children}</span>)
}
