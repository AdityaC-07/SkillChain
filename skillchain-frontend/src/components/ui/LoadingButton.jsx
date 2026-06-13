import React from 'react'

export default function LoadingButton({ children, loading, className='', ...props }){
  return (
    <button disabled={loading} className={`inline-flex items-center gap-2 px-4 py-2 rounded ${className}`} {...props}>
      {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
      <span>{children}</span>
    </button>
  )
}
