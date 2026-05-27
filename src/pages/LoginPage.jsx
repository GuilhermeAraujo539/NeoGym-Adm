import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]           = useState({ email: '', senha: '' })
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')

  // Sanitiza entradas antes de usar (prevenção XSS extra)
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: DOMPurify.sanitize(value) }))
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
      toast.success('Bem-vindo ao painel NeoGym!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.mensagem
        || err.message
        || 'Erro ao fazer login.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <ShieldCheck size={40} color="#3b82f6" />
          <h1>Painel Administrativo</h1>
          <p>Acesso exclusivo para administradores NeoGym</p>
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
                onClick={() => setShowSenha((v) => !v)}
                tabIndex={-1}
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && <p className="form-error">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
