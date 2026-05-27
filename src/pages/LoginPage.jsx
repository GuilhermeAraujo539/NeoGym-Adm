import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify'

export default function LoginPage() {
  const { login }           = useAuth()
  const { theme, toggle }   = useTheme()
  const navigate            = useNavigate()

  const [form, setForm]           = useState({ email: '', senha: '' })
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: DOMPurify.sanitize(value) }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      await login(form.email.toLowerCase().trim(), form.senha)
      toast.success('Bem-vindo de volta!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message || 'Erro ao fazer login.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">

      <button
        className="theme-toggle"
        onClick={toggle}
        title="Alternar tema"
        style={{ position: 'fixed', top: 16, right: 16 }}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div className="login-card">

        <div className="login-header">
          <img src="src/public/logo.png" alt="NeoGym" className="login-logo" />
          <div className="login-divider" />
          <h2>Painel Administrativo</h2>
          <p>Acesso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@neogym.com"
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="input-eye">
              <input
                id="senha"
                name="senha"
                type={showSenha ? 'text' : 'password'}
                value={form.senha}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowSenha(v => !v)}
                tabIndex={-1}
              >
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {erro && <p className="form-error">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><Loader size={15} className="spin" /> Entrando...</>
              : 'Entrar'
            }
          </button>

        </form>

        <p className="login-footer">
          NeoGym © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}
