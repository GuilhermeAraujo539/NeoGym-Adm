import { useEffect, useState, useCallback } from 'react'
import {
  Search, UserX, UserCheck, Trash2, Edit, RefreshCw,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const TIPO_OPTS = [
  { value: '',              label: 'Todos os tipos' },
  { value: 'ALUNO',         label: 'Aluno' },
  { value: 'PERSONAL',      label: 'Personal' },
  { value: 'NUTRICIONISTA', label: 'Nutricionista' },
  { value: 'ACADEMIA',      label: 'Academia' },
  { value: 'ADMIN',         label: 'Admin' },
]

const TIPO_COLOR = {
  ALUNO:          '#8b5cf6',
  PERSONAL:       '#f59e0b',
  NUTRICIONISTA:  '#10b981',
  ACADEMIA:       '#06b6d4',
  ADMIN:          '#ef4444',
}

function Badge({ tipo }) {
  return (
    <span className="badge" style={{
      background: (TIPO_COLOR[tipo] ?? '#64748b') + '1a',
      color: TIPO_COLOR[tipo] ?? '#64748b'
    }}>
      {tipo}
    </span>
  )
}

function StatusPill({ ativo }) {
  return (
    <span className={`badge ${ativo ? 'badge--success' : 'badge--danger'}`}>
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function EditModal({ usuario, onClose, onSalvar }) {
  const [form, setForm] = useState({
    nome:  usuario.nome  ?? '',
    email: usuario.email ?? '',
  })
  const [loading, setLoading] = useState(false)

  async function salvar() {
    setLoading(true)
    try {
      await onSalvar(usuario.id, form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Usuário</h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nome</label>
            <input
              value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              maxLength={120}
            />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              maxLength={120}
            />
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={salvar} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ mensagem, onConfirmar, onCancelar, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmar ação</h3>
          <button className="btn-icon" onClick={onCancelar}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p>{mensagem}</p>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onCancelar}>Cancelar</button>
            <button className="btn-danger" onClick={onConfirmar} disabled={loading}>
              {loading ? 'Aguarde...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function UsuariosPage() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [pagina, setPagina]     = useState(0)
  const TAMANHO = 20
  const [tipo, setTipo]         = useState('')
  const [ativo, setAtivo]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [editModal, setEditModal]     = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pagina, tamanho: TAMANHO }
      if (tipo)  params.tipo  = tipo
      if (ativo !== '') params.ativo = ativo === 'true'
      const { data } = await api.get('/admin/usuarios', { params })
      setItems(data.conteudo)
      setTotal(data.totalElementos)
    } catch {
      toast.error('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [pagina, tipo, ativo])

  useEffect(() => { carregar() }, [carregar])

  async function handleEditar(id, form) {
    await api.patch(`/admin/usuarios/${id}`, form)
    toast.success('Usuário atualizado!')
    carregar()
  }

  async function handleToggleAtivo(usuario) {
    const acao = usuario.ativo ? 'desativar' : 'ativar'
    setConfirmModal({
      mensagem: `Deseja ${acao} o usuário "${usuario.nome}"?`,
      onConfirmar: async () => {
        await api.patch(`/admin/usuarios/${usuario.id}`, { ativo: !usuario.ativo })
        toast.success(`Usuário ${acao}do com sucesso!`)
        setConfirmModal(null)
        carregar()
      }
    })
  }

  async function handleDeletar(usuario) {
    if (usuario.tipo === 'ADMIN') {
      toast.error('Não é possível deletar administradores.')
      return
    }
    setConfirmModal({
      mensagem: `Deletar permanentemente "${usuario.nome}"? Esta ação não pode ser desfeita.`,
      danger: true,
      onConfirmar: async () => {
        await api.delete(`/admin/usuarios/${usuario.id}`)
        toast.success('Usuário deletado.')
        setConfirmModal(null)
        carregar()
      }
    })
  }

  const totalPaginas = Math.ceil(total / TAMANHO)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Usuários</h1>
          <p>Gerencie todos os usuários da plataforma</p>
        </div>
        <button className="btn-icon-label" onClick={carregar}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      <div className="toolbar toolbar--wrap">
        <select
          className="select-filter"
          value={tipo}
          onChange={e => { setTipo(e.target.value); setPagina(0) }}
        >
          {TIPO_OPTS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="select-filter"
          value={ativo}
          onChange={e => { setAtivo(e.target.value); setPagina(0) }}
        >
          <option value="">Ativos e inativos</option>
          <option value="true">Apenas ativos</option>
          <option value="false">Apenas inativos</option>
        </select>

        <span className="total-label">{total} usuário{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Search size={40} />
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className={!u.ativo ? 'row--inactive' : ''}>
                  <td className="td-id">{u.id}</td>
                  <td className="td-bold">{u.nome}</td>
                  <td>{u.email}</td>
                  <td><Badge tipo={u.tipo} /></td>
                  <td><StatusPill ativo={u.ativo} /></td>
                  <td>{fmtDate(u.criadoEm)}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() => setEditModal(u)}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className={`btn-icon ${u.ativo ? 'btn-icon--warning' : 'btn-icon--success'}`}
                        title={u.ativo ? 'Desativar' : 'Ativar'}
                        onClick={() => handleToggleAtivo(u)}
                      >
                        {u.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      {u.tipo !== 'ADMIN' && (
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Deletar"
                          onClick={() => handleDeletar(u)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="pagination">
          <button className="btn-icon" disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span>Página {pagina + 1} de {totalPaginas}</span>
          <button className="btn-icon" disabled={pagina >= totalPaginas - 1}
            onClick={() => setPagina(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {editModal && (
        <EditModal
          usuario={editModal}
          onClose={() => setEditModal(null)}
          onSalvar={handleEditar}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          mensagem={confirmModal.mensagem}
          onConfirmar={confirmModal.onConfirmar}
          onCancelar={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
