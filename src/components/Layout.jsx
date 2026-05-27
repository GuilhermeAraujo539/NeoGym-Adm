import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileCheck, Users, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/credenciais', label: 'Credenciais',  Icon: FileCheck },
  { to: '/usuarios',    label: 'Usuários',     Icon: Users },
]

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/credenciais': 'Credenciais',
  '/usuarios':    'Usuários',
}

function initials(nome) {
  if (!nome) return 'A'
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function Layout() {
  const { admin, logout }   = useAuth()
  const { theme, toggle }   = useTheme()
  const navigate            = useNavigate()
  const { pathname }        = useLocation()

  async function handleLogout() {
    await logout()
    toast.success('Sessão encerrada com sucesso.')
    navigate('/login', { replace: true })
  }

  const pageTitle = PAGE_TITLES[pathname] ?? 'NeoGym Admin'

  return (
    <div className="layout">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <img src="/src/public/logo.png" alt="NeoGym" />
        </div>

        <div className="sidebar-badge">
          <span>Painel Administrativo</span>
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
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-avatar">
            {initials(admin?.nome)}
          </div>
          <div className="admin-info">
            <span className="admin-name">{admin?.nome ?? 'Admin'}</span>
            <span className="admin-role">Administrador</span>
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut size={15} />
          </button>
        </div>

      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div className="topbar">
          <span className="topbar-title">{pageTitle}</span>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggle}
              title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            >
              {theme === 'light'
                ? <Moon size={16} />
                : <Sun size={16} />
              }
            </button>
          </div>
        </div>

        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
