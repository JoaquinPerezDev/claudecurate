import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('webhookToken', data.webhookToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (email, password) => {
    const { data } = await api.post('/api/auth/register', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('webhookToken', data.webhookToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const regenerateToken = async () => {
    const { data } = await api.post('/api/auth/regenerate-token')
    localStorage.setItem('webhookToken', data.webhookToken)
    return data.webhookToken
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, regenerateToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
