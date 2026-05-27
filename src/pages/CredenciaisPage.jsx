import { useEffect, useState, useCallback } from 'react'
import {
  Search, CheckCircle, XCircle, Eye, Filter,
  FileText, Image, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const STATUS_OPTS = [
  { value: '',          label: 'Todos' },
  { value: 'PENDENTE',  label: 'Pendentes' },
  { value: 'APROVADO',  label: 'Aprovados' },
  { value: 'REJEITADO', label: 'Rejeitados' },
]

const STATUS_BADGE = {
  PENDENTE:  { cls: 'badge--warning', label: 'Pendente' },
  APROVADO:  { cls: 'badge--success', label: 'Aprovado' },
  REJEITADO: { cls: 'badge--danger',  label: 'Rejeitado' },
}

function Badge({ status }) {
  const b = STATUS_BADGE[status] ?? { cls: '', label: status }
  return <span className={`badge ${b.cls}`}>{b.label}</span>
}

function DocumentoModal({ credencial, onClose }) {
  const isPdf = credencial.arquivoUrl?.endsWith('.pdf')
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Documento — {credencial.nomeUsuario}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="doc-meta">
            <p><strong>Tipo:</strong> {credencial.tipo}</p>
            <p><strong>E-mail:</strong> {credencial.emailUsuario}</p>
            <p><strong>Enviado em:</strong> {fmtDate(credencial.criadoEm)}</p>
            {credencial.observacaoAdmin && (
              <p><strong>Observação:</strong> {credencial.observacaoAdmin}</p>
            )}
          </div>
          <div className="doc-preview">
            {credencial.arquivoUrl ? (
              isPdf ? (
                <iframe
                  src={credencial.arquivoUrl}
                  title="Documento"
                  className="doc-iframe"
                />
              ) : (
                <img
                  src={credencial.arquivoUrl}
                  alt="Documento"
                  className="doc-img"
                />
              )
            ) : (
              <p className="no-doc">Nenhum documento enviado.</p>
            )}
          </div>
          {credencial.arquivoUrl && (
            <a
              href={credencial.arquivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Abrir em nova aba
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function AvaliarModal({ credencial, onClose, onConfirm }) {
  const [observacao, setObservacao] = useState('')
  const [acao, setAcao]             = useState(null) // 'APROVADO' | 'REJEITADO'
  const [loading, setLoading]       = useState(false)

  async function confirmar() {
    if (!acao) return
    if (acao === 'REJEITADO' && !observacao.trim()) {
      toast.error('Informe o motivo da rejeição.')
      return
    }
    setLoading(true)
    try {
      await onConfirm(credencial.id, acao, observacao)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Avaliar Credencial</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>
            Profissional: <strong>{credencial.nomeUsuario}</strong><br />
            Tipo: <strong>{credencial.tipo}</strong>
          </p>

          <div className="acao-btns">
            <button
              className={`btn-acao ${acao === 'APROVADO' ? 'btn-acao--selected-success' : ''}`}
              onClick={() => setAcao('APROVADO')}
            >
              <CheckCircle size={16} /> Aprovar
            </button>
            <button
              className={`btn-acao ${acao === 'REJEITADO' ? 'btn-acao--selected-danger' : ''}`}
              onClick={() => setAcao('REJEITADO')}
            >
              <XCircle size={16} /> Rejeitar
            </button>
          </div>

          {acao === 'REJEITADO' && (
            <div className="field">
              <label>Motivo da rejeição <span className="required">*</span></label>
              <textarea
                rows={3}
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Ex: Documento ilegível, CREF não encontrado no sistema..."
                maxLength={500}
              />
              <span className="char-count">{observacao.length}/500</span>
            </div>
          )}

          {acao === 'APROVADO' && (
            <div className="field">
              <label>Observação (opcional)</label>
              <textarea
                rows={2}
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Observação para o profissional..."
                maxLength={500}
              />
            </div>
          )}

          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              className="btn-primary"
              onClick={confirmar}
              disabled={!acao || loading}
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}

export default function CredenciaisPage() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [pagina, setPagina]     = useState(0)
  const TAMANHO = 20
  const [status, setStatus]     = useState('PENDENTE')
  const [loading, setLoading]   = useState(true)
  const [docModal, setDocModal] = useState(null)
  const [avalModal, setAvalModal] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pagina, tamanho: TAMANHO }
      if (status) params.status = status
      const { data } = await api.get('/credenciais', { params })
      setItems(data.conteudo)
      setTotal(data.totalElementos)
    } catch {
      toast.error('Erro ao carregar credenciais.')
    } finally {
      setLoading(false)
    }
  }, [pagina, status])

  useEffect(() => { carregar() }, [carregar])

  async function handleAvaliar(id, novoStatus, observacao) {
    await api.patch(`/credenciais/${id}/avaliar`, {
      status: novoStatus,
      observacao: observacao || undefined,
    })
    toast.success(novoStatus === 'APROVADO' ? 'Credencial aprovada!' : 'Credencial rejeitada.')
    carregar()
  }

  const totalPaginas = Math.ceil(total / TAMANHO)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Credenciais</h1>
          <p>Valide documentos de personal trainers e nutricionistas</p>
        </div>
        <button className="btn-icon-label" onClick={carregar}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="toolbar">
        <div className="filter-tabs">
          {STATUS_OPTS.map(opt => (
            <button
              key={opt.value}
              className={`tab-btn ${status === opt.value ? 'tab-btn--active' : ''}`}
              onClick={() => { setStatus(opt.value); setPagina(0) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="total-label">{total} registro{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} />
          <p>Nenhuma credencial encontrada.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Profissional</th>
                <th>E-mail</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Enviado em</th>
                <th>Avaliado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td className="td-id">{c.id}</td>
                  <td className="td-bold">{c.nomeUsuario}</td>
                  <td>{c.emailUsuario}</td>
                  <td><span className="badge badge--info">{c.tipo}</span></td>
                  <td><Badge status={c.status} /></td>
                  <td>{fmtDate(c.criadoEm)}</td>
                  <td>{c.avaliadoEm ? fmtDate(c.avaliadoEm) : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        title="Ver documento"
                        onClick={() => setDocModal(c)}
                      >
                        <Eye size={15} />
                      </button>
                      {c.status === 'PENDENTE' && (
                        <button
                          className="btn-icon btn-icon--primary"
                          title="Avaliar"
                          onClick={() => setAvalModal(c)}
                        >
                          <CheckCircle size={15} />
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

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            className="btn-icon"
            disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>Página {pagina + 1} de {totalPaginas}</span>
          <button
            className="btn-icon"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => setPagina(p => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {docModal  && <DocumentoModal  credencial={docModal}  onClose={() => setDocModal(null)} />}
      {avalModal && <AvaliarModal    credencial={avalModal} onClose={() => setAvalModal(null)} onConfirm={handleAvaliar} />}
    </div>
  )
}
