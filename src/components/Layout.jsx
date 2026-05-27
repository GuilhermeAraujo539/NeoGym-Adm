import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileCheck, Users, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/credenciais', label: 'Credenciais',   Icon: FileCheck },
  { to: '/usuarios',    label: 'Usuários',      Icon: Users },
]

export default function Layout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Sessão encerrada.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={28} />
          <span>NeoGym Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item--active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="admin-name">{admin?.nome}</span>
          <button className="btn-logout" onClick={handleLogout} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
