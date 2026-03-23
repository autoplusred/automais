import { useEffect, useMemo, useState } from 'react'
import { fetchWithAuth } from '../../services/apiBackend'

function formatCpf(cpf) {
  const digits = String(cpf || '').replace(/\D/g, '')
  if (digits.length !== 11) return cpf || 'CPF não informado'
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function getInitials(nome) {
  return String(nome || 'C')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'CL'
}

export default function Clientes({ onOpenModal }) {
  const [q, setQ] = useState('')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true)
        const data = await fetchWithAuth(`/clientes/?limite=100&q=${encodeURIComponent(q)}`)
        setClientes(data.clientes || [])
      } catch {
        setClientes([])
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [q])

  const totalLabel = useMemo(() => `${clientes.length} cliente${clientes.length === 1 ? '' : 's'}`, [clientes.length])

  return (
    <div>
      <div className="search-row">
        <input
          className="fi"
          placeholder="🔍  Buscar por nome, CPF, telefone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-p" onClick={() => onOpenModal('novoCliente')}>+ Novo Cliente</button>
      </div>
      <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>{loading ? 'Carregando clientes...' : totalLabel}</div>
      <div className="tbl-wrap">
        {!loading && clientes.length === 0 && (
          <div style={{padding:16,color:'var(--muted)',fontSize:13}}>
            Nenhum cliente encontrado.
          </div>
        )}
        {clientes.map((c) => (
          <div key={c.id} className="cli-row">
            <div className="cli-av">{getInitials(c.nome)}</div>
            <div className="cli-body">
              <div className="cli-name">{c.nome}</div>
              <div className="cli-meta">
                {`${formatCpf(c.cpf)} · ${c.telefone || 'Telefone não informado'}`}
                {c.email && <span>{` · ${c.email}`}</span>}
              </div>
            </div>
            <div className="cli-val">
              <div className="v">{c.cidade || '-'}</div>
              <div className="lbl">{c.estado || 'sem UF'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
