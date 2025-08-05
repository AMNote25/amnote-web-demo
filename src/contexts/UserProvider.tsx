import React, { useState } from "react"
import { UserContext } from "./UserContext"

export interface UserInfo {
  companyName?: string
  userName?: string
  // Thêm các trường khác nếu cần
}

export interface UserContextType {
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}