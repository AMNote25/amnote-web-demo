import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "../contexts/useLanguage"
import { ChevronDown, Globe } from "lucide-react"
import type { Language } from "../contexts/LanguageContext.resources";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage} = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border border-gray-200 bg-white rounded-lg shadow-lg z-10 absolute right-0 mt-2 w-48">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200 ${
                  language === lang.code
                    ? "bg-gray-100 text-gray-600"
                    : "text-gray-600"
                }`}
                onClick={() => handleLanguageChange(lang.code as Language)}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
