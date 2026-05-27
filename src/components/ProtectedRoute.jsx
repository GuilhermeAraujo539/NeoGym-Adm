import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { admin, loading } = useAuth()

  if (loading) {
    return (
      <div className="splash">
        <img src="src/public/logo.png" alt="NeoGym" />
        <div className="spinner" />
        <p>Verificando sessão...</p>
      </div>
    )
  }

  return admin ? <Outlet /> : <Navigate to="/login" replace />
}
