import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageToggle(){
  const { i18n } = useTranslation()
  const change = (lng)=> i18n.changeLanguage(lng)
  return (
    <div className="inline-flex gap-2">
      <button onClick={()=>change('en')} className={`px-2 py-1 rounded ${i18n.language==='en'?'bg-amber text-white':''}`}>EN</button>
      <button onClick={()=>change('hi')} className={`px-2 py-1 rounded ${i18n.language==='hi'?'bg-amber text-white':''}`}>HI</button>
    </div>
  )
}
