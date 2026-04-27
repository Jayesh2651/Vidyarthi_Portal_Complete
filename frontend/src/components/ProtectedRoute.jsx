import { Navigate, useLocation } from 'react-router-dom'

import { LoadingState } from './ui/LoadingState'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState label="Checking your session" />
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
