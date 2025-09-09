'use client'

import Cookies from 'js-cookie'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  token: string | null
  accountId: string | null
  setToken: (token: string | null) => void
  setAccountId: (id: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const getAuthToken = () => Cookies.get('token')
export const getTenantId = () => Cookies.get('accountId')


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const [accountId, setAccountIdState] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = Cookies.get('token') || null
    const savedAccountId = Cookies.get('accountId') || null
    setTokenState(savedToken)
    setAccountIdState(savedAccountId)
  }, [])

  const setToken = (newToken: string | null) => {
    setTokenState(newToken)
    if (newToken) Cookies.set('token', newToken, { expires: 7 })
    else Cookies.remove('token')
  }

  const setAccountId = (newId: string | null) => {
    setAccountIdState(newId)
    if (newId) Cookies.set('accountId', newId, { expires: 7 })
    else Cookies.remove('accountId')
  }

  const logout = () => {
    setToken(null)
    setAccountId(null)
  }

  return (
    <AuthContext.Provider value={{ token, accountId, setToken, setAccountId, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuthStore = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
