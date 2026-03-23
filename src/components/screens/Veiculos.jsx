import { useEffect, useMemo, useState } from 'react'
import { fetchWithAuth } from '../../services/apiBackend'

function toMoney(value) {
  const num = Number(value || 0)
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'disponivel') return 'b-g'
  if (s === 'reservado') return 'b-a'
  if (s === 'vendido') return 'b-m'
  return 'b-m'
}

export default function Veiculos({ onOpenModal }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const [loading, setLoading] = useState(true)
  const [veiculos, setVeiculos] = useState([])

  const carregar = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (tipo) params.set('tipo', tipo)
      params.set('limite', '100')
      const query = params.toString()
      const data = await fetchWithAuth(`/veiculos/${query ? `?${query}` : ''}`)
      setVeiculos(data.veiculos || [])
    } catch {
      setVeiculos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const cards = useMemo(() => veiculos.map((v) => ({
    id: v.id,
    modelo: `${v.marca || ''} ${v.modelo || ''}`.trim(),
    info: `${v.ano_modelo || '—'} · ${(v.km || 0).toLocaleString('pt-BR')} km · ${v.combustivel || '—'}`,
    preco: toMoney(v.preco_venda),
    placa: v.placa || 'SEM PLACA',
    status: v.status || 'disponivel',
    bc: statusBadge(v.status),
    tipo: v.tipo || '',
  })), [veiculos])

  return (
    <div>
      <div className="search-row">
        <input className="fi" placeholder="🔍  Buscar por modelo, placa, ano..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="fi" style={{maxWidth:160}} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
        <select className="fi" style={{maxWidth:160}} value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="Hatch">Hatch</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Pickup">Pickup</option>
          <option value="Moto">Moto</option>
        </select>
        <button className="btn-g" onClick={carregar}>Filtrar</button>
        <button className="btn-p" onClick={() => onOpenModal('addVeiculo')}>+ Veículo</button>
      </div>

      {loading && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Carregando veículos...</p>}
      <div className="vg">
        {!loading && cards.map((v) => (
          <div key={v.id} className="vc">
            <div className="vc-img">
              {v.tipo === 'Moto' ? '🏍️' : '🚗'}
              <div className="placa">{v.placa}</div>
            </div>
            <div className="vc-body">
              <div className="vc-modelo">{v.modelo}</div>
              <div className="vc-info">{v.info}</div>
              <div className="vc-preco">{v.preco}</div>
              <div className="vc-foot">
                <span className={`badge ${v.bc}`}>{v.status}</span>
                <span style={{fontSize:11,color:'var(--muted)'}}>{v.tipo || '—'}</span>
              </div>
            </div>
          </div>
        ))}
        {!loading && cards.length === 0 && (
          <div className="vc vc-add" style={{ minHeight: 180 }}>
            <div className="vc-add-inner">
              <div style={{fontSize:13,fontWeight:600}}>Nenhum veículo cadastrado</div>
            </div>
          </div>
        )}

        <div className="vc vc-add" onClick={() => onOpenModal('addVeiculo')}>
          <div className="vc-add-inner">
            <div className="vc-add-plus">+</div>
            <div style={{fontSize:13,fontWeight:600}}>Adicionar Veículo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
