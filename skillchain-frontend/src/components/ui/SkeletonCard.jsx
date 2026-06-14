import React from 'react'
import Skeleton from './Skeleton'

export default function SkeletonCard({ lines = 3, className = '' }){
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={`skeleton-${index}`} className="h-4 w-full mb-3" />
      ))}
    </div>
  )
}
