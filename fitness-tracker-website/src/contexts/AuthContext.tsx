import React, { createContext, useState, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService.js'

interface User {
  email: string
  is_admin?: boolean
  // Add any more fields you expect on the user
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token')
      const adminStatus = localStorage.getItem('isAdmin') === 'true'
      setIsAuthenticated(!!token)
      setIsAdmin(adminStatus)
      setIsLoading(false)
    }
    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setIsAuthenticated(true)
      setIsAdmin(!!response.user.is_admin)
      return response
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
