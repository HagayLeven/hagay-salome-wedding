'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, translations, TranslationKey } from './i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
  dir: 'rtl' | 'ltr'
}

const LangContext = createContext<LangContextType>({
  lang: 'he',
  setLang: () => {},
  t: (key) => translations.he[key] as string,
  dir: 'rtl',
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he')

  useEffect(() => {
    const saved = localStorage.getItem('wp_lang') as Lang
    if (saved && ['he', 'fr', 'en'].includes(saved)) {
      setLangState(saved)
      document.documentElement.dir = saved === 'he' ? 'rtl' : 'ltr'
      document.documentElement.lang = saved
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('wp_lang', l)
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  const t = (key: TranslationKey) => translations[lang][key] as string
  const dir: 'rtl' | 'ltr' = lang === 'he' ? 'rtl' : 'ltr'

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
