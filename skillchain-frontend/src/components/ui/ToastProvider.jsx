import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast(){ return useContext(ToastContext) }

export default function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, opts={})=>{
    const id = Date.now().toString(36)
    setToasts(t=>[...t, { id, msg, ...opts }])
    if (!opts.persistent) setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), opts.duration||5000)
  },[])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 space-y-2 z-50">
        {toasts.map(t=> (
          <div key={t.id} role="status" className="bg-navy-700 text-white px-4 py-2 rounded shadow">{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
