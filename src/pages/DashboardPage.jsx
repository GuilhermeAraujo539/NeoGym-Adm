import { useEffect, useState } from 'react'
import {
  Users, UserCheck, Dumbbell, Salad, Building2,
  Clock, CheckCircle, XCircle, Activity, AlertTriangle
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '1a', color }}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value ?? '—'}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Erro ao carregar dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  const pendentes = data?.credenciaisPendentes ?? 0

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da plataforma NeoGym</p>
      </div>

      {pendentes > 0 && (
        <div className="alert alert--warning">
          <AlertTriangle size={18} />
          <span>
            Há <strong>{pendentes}</strong> credencial{pendentes > 1 ? 'is' : ''} aguardando avaliação.
            <a href="/credenciais"> Avaliar agora →</a>
          </span>
        </div>
      )}

      <section>
        <h2 className="section-title">Usuários</h2>
        <div className="stat-grid">
          <StatCard icon={Users}    label="Total"         value={data?.totalUsuarios}      color="#3b82f6" />
          <StatCard icon={UserCheck} label="Alunos"       value={data?.totalAlunos}        color="#8b5cf6" />
          <StatCard icon={Dumbbell} label="Personais"     value={data?.totalPersonais}     color="#f59e0b" />
          <StatCard icon={Salad}    label="Nutricionistas" value={data?.totalNutricionistas} color="#10b981" />
          <StatCard icon={Building2} label="Academias"    value={data?.totalAcademias}     color="#06b6d4" />
          <StatCard icon={Activity} label="Ativos"        value={data?.usuariosAtivos}     color="#22c55e"
            sub={`${data?.usuariosInativos ?? 0} inativos`} />
        </div>
      </section>

      <section>
        <h2 className="section-title">Credenciais</h2>
        <div className="stat-grid">
          <StatCard icon={Clock}       label="Pendentes"  value={data?.credenciaisPendentes}  color="#f59e0b" />
          <StatCard icon={CheckCircle} label="Aprovadas"  value={data?.credenciaisAprovadas}  color="#22c55e" />
          <StatCard icon={XCircle}     label="Rejeitadas" value={data?.credenciaisRejeitadas} color="#ef4444" />
          <StatCard icon={AlertTriangle} label="Vínculos pendentes" value={data?.vinculosPendentes} color="#f97316" />
        </div>
      </section>
    </div>
  )
}
