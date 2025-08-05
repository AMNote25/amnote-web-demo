import type React from "react"
import { createContext, useState, type ReactNode } from "react"
import { translations, type Language, type LanguageContextType } from "./LanguageContext.resources"

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  const value: LanguageContextType = {
    language,
    setLanguage: (lang: Language) => setLanguage(lang),
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export { LanguageContext }
