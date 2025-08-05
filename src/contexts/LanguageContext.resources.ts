export type Language = "en" | "vi" | "ko"

export interface Translations {
  signIn: string
  signInSubtitle: string
  username: string
  password: string
  companyId: string
  signingIn: string
  loginSuccess: string
  forgotPassword: string
}

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const translations: Record<Language, Translations> = {
  en: {
    signIn: "Sign in to your account",
    signInSubtitle: "Enter your credentials to access your account",
    username: "Username",
    password: "Password",
    companyId: "Company ID",
    signingIn: "Signing in...",
    loginSuccess: "Login successful!",
    forgotPassword: "Forgot your password?",
  },
  vi: {
    signIn: "Đăng nhập tài khoản",
    signInSubtitle: "Nhập thông tin đăng nhập để truy cập tài khoản",
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    companyId: "Mã công ty",
    signingIn: "Đang đăng nhập...",
    loginSuccess: "Đăng nhập thành công!",
    forgotPassword: "Quên mật khẩu?",
  },
  ko: {
    signIn: "계정에 로그인",
    signInSubtitle: "계정에 액세스하려면 자격 증명을 입력하세요",
    username: "사용자명",
    password: "비밀번호",
    companyId: "회사 ID",
    signingIn: "로그인 중...",
    loginSuccess: "로그인 성공!",
    forgotPassword: "비밀번호를 잊으셨나요?",
  },
}
