const API_BASE_URL = '/api' // Sử dụng proxy của Vite cho đường dẫn API // NHUT TEST
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface LoginParams {
  username: string
  password: string
  companyID: string
  Lag?: string
}

export async function login({ username, password, companyID, Lag = "VIET" }: LoginParams) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, companyID, Lag }),
  })
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await response.json()
    return { ok: response.ok, data }
  } catch (error) {
    console.error("Logout error:", error)
    return { ok: false, data: null }
  }
}