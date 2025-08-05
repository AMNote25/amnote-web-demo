import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/useLanguage"
import LanguageSelector from "../components/LanguageSelector"
import ThemeToggle from "../components/ThemeToggle"
import { User, Building } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "../components/ui"
import { Eye, EyeOff, Lock } from "lucide-react"
import Logo from "../components/Logo"
import { LoadingButton } from "../components/ui"
import { login } from "../api/authApi"

interface LoginScreenProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

interface FormData {
  username: string
  password: string
  companyId: string
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isDarkMode, toggleTheme }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    companyId: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { ok, data } = await login({
        username: formData.username,
        password: formData.password,
        companyID: formData.companyId,
        Lag: "VIET",
      })

      setIsLoading(false)

      if (ok && data.status === "success") {
        localStorage.setItem("access_token", data.access_token)
        navigate("/dashboard")
      } else {
        alert(data.messages?.[0] || "Sai thông tin đăng nhập!")
      }
    } catch {
      setIsLoading(false)
      alert("Lỗi kết nối máy chủ!")
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center">
      <div className="bg-white w-full max-w-2xl mx-auto rounded-lg shadow-lg">
        <div className="w-2/3 p-6 md:space-y-6 sm:p-8 mx-auto ">
          {/* Header with theme toggle and language selector */}
          <div className="flex justify-between items-center">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <LanguageSelector />
          </div>

          {/* Logo */}
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">{t.signIn}</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{t.signInSubtitle}</p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="companyId"
                name="companyId"
                placeholder={t.companyId}
                value={formData.companyId}
                onChange={handleInputChange}
                leftIcon={<Building className="h-5 w-5 text-gray-400" />}
                required
                label={t.companyId}
                labelVisible={false}
              />
              <Input
                id="username"
                name="username"
                placeholder={t.username}
                value={formData.username}
                onChange={handleInputChange}
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
                required
                label={t.username}
                labelVisible={false}
              />
              <Input
                id="password"
                name="password"
                placeholder={t.password}
                value={formData.password}
                onChange={handleInputChange}
                type={showPassword ? "text" : "password"}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </button>
                }
                required
                label={t.password}
                labelVisible={false}
              />
            </div>

            {/* Submit Button */}
            <div>
              <LoadingButton 
                type="submit"
                isLoading={isLoading} 
                loadingText={t.signingIn}
                className="w-full"
              >
                {t.signIn}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
