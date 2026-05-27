import { useEffect, useState } from 'react'
import {
  Users, UserCheck, Dumbbell, Salad, Building2,
  Clock, CheckCircle, XCircle, Activity, AlertTriangle
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, bg, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon size={20} strokeWidth={2.2} />
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
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Erro ao carregar dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>
  }

  const pendentes = data?.credenciaisPendentes ?? 0

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da plataforma NeoGym</p>
        </div>
      </div>

      {pendentes > 0 && (
        <div className="alert alert--orange">
          <AlertTriangle size={17} />
          <span>
            <strong>{pendentes}</strong> credencial{pendentes > 1 ? 'is precisam' : ' precisa'} de avaliação.
            <a href="/credenciais"> Avaliar agora →</a>
          </span>
        </div>
      )}

      <section>
        <h2 className="section-title">Usuários</h2>
        <div className="stat-grid">
          <StatCard icon={Users}     label="Total"          value={data?.totalUsuarios}       color="var(--orange)"  bg="var(--orange-xl)" />
          <StatCard icon={UserCheck} label="Alunos"         value={data?.totalAlunos}         color="#7C3AED"        bg="#EDE9FE" />
          <StatCard icon={Dumbbell}  label="Personais"      value={data?.totalPersonais}      color="var(--yellow)"  bg="var(--yellow-bg)" />
          <StatCard icon={Salad}     label="Nutricionistas" value={data?.totalNutricionistas} color="var(--green)"   bg="var(--green-bg)" />
          <StatCard icon={Building2} label="Academias"      value={data?.totalAcademias}      color="#0891B2"        bg="#CFFAFE" />
          <StatCard icon={Activity}  label="Ativos"         value={data?.usuariosAtivos}      color="var(--green)"   bg="var(--green-bg)"
            sub={`${data?.usuariosInativos ?? 0} inativos`} />
        </div>
      </section>

      <section>
        <h2 className="section-title">Credenciais</h2>
        <div className="stat-grid">
          <StatCard icon={Clock}       label="Pendentes"  value={data?.credenciaisPendentes}  color="var(--orange)"  bg="var(--orange-xl)" />
          <StatCard icon={CheckCircle} label="Aprovadas"  value={data?.credenciaisAprovadas}  color="var(--green)"   bg="var(--green-bg)" />
          <StatCard icon={XCircle}     label="Rejeitadas" value={data?.credenciaisRejeitadas} color="var(--red)"     bg="var(--red-bg)" />
          <StatCard icon={AlertTriangle} label="Vínculos pendentes" value={data?.vinculosPendentes} color="var(--yellow)" bg="var(--yellow-bg)" />
        </div>
      </section>
    </div>
  )
}
