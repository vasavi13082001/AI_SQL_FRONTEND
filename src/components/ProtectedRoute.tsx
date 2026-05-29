import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../types/auth'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/app/unauthorized" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
