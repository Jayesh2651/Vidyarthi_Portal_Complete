import { createContext, startTransition, useContext, useEffect, useState } from 'react'

import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    authenticated: false,
    loading: true,
  })

  useEffect(() => {
    let ignore = false

    async function bootstrapAuth() {
      try {
        await authService.ensureCsrf()
        const response = await authService.getSession()
        if (ignore) return

        startTransition(() => {
          setAuthState({
            user: response.data.user,
            authenticated: response.data.authenticated,
            loading: false,
          })
        })
      } catch {
        if (ignore) return

        startTransition(() => {
          setAuthState({
            user: null,
            authenticated: false,
            loading: false,
          })
        })
      }
    }

    bootstrapAuth()

    return () => {
      ignore = true
    }
  }, [])

  async function refreshSession() {
    const response = await authService.getSession()
    startTransition(() => {
      setAuthState({
        user: response.data.user,
        authenticated: response.data.authenticated,
        loading: false,
      })
    })
    return response.data
  }

  async function login(credentials) {
    await authService.ensureCsrf()
    const response = await authService.login(credentials)
    startTransition(() => {
      setAuthState({
        user: response.data.user,
        authenticated: true,
        loading: false,
      })
    })
    return response.data
  }

  async function logout() {
    await authService.ensureCsrf()
    await authService.logout()
    startTransition(() => {
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
      })
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
