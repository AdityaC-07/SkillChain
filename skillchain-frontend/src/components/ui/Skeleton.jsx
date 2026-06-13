import React from 'react'

export default function Skeleton({ className='h-6 w-full bg-gray-200 rounded' }){
  return <div className={className + ' animate-pulse'} />
}
