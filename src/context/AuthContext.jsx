import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { saveTokens, clearTokens, hasSession, getTokens } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const iniciar = async () => {
      if (!hasSession()) {
        setLoading(false)
        return
      }
      try {
        const { refreshToken } = getTokens()
        const { data } = await api.post('/auth/refresh', { refreshToken })
        saveTokens(data.accessToken, data.refreshToken)
        if (data.tipo !== 'ADMIN') {
          clearTokens()
          setAdmin(null)
        } else {
          setAdmin({ id: data.usuarioId, nome: data.nome, email: data.email })
        }
      } catch {
        clearTokens()
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }
    iniciar()
  }, [])

  const login = useCallback(async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })

    if (data.tipo !== 'ADMIN') {
      throw new Error('Acesso negado. Esta área é exclusiva para administradores.')
    }

    saveTokens(data.accessToken, data.refreshToken)
    setAdmin({ id: data.usuarioId, nome: data.nome, email: data.email })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      const { refreshToken } = getTokens()
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } finally {
      clearTokens()
      setAdmin(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
