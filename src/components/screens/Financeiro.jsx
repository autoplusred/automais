import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../ui/Toast'
import { fetchWithAuth } from '../../services/apiBackend'

function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(v) {
  if (!v) return '-'
  return new Date(`${v}T00:00:00`).toLocaleDateString('pt-BR')
}

function diasPara(dataVencimento) {
  if (!dataVencimento) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dt = new Date(`${dataVencimento}T00:00:00`)
  return Math.round((dt.getTime() - hoje.getTime()) / 86400000)
}

function statusParcelaLabel(item) {
  if (item.status === 'pago') return { txt: 'Recebido', cls: 'ok' }
  const dias = diasPara(item.data_vencimento)
  if (item.status === 'vencido' || (typeof dias === 'number' && dias < 0)) return { txt: `${Math.abs(dias)} dias em atraso`, cls: 'vencida' }
  if (typeof dias === 'number' && dias <= 7) return { txt: `vence em ${dias} dia${dias === 1 ? '' : 's'}`, cls: 'proxima' }
  if (typeof dias === 'number') return { txt: `vence em ${dias} dias`, cls: '' }
  return { txt: item.status || '-', cls: '' }
}

export default function Financeiro({ onOpenModal, reloadSignal = 0 }) {
  const toast = useToast()
  const [tab, setTab] = useState('receber')
  const [resumo, setResumo] = useState(null)
  const [parcelas, setParcelas] = useState([])
  const [contas, setContas] = useState([])
  const [loadingReceber, setLoadingReceber] = useState(true)
  const [loadingPagar, setLoadingPagar] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const carregarResumo = async () => {
    try {
      const data = await fetchWithAuth('/financeiro/resumo')
      setResumo(data)
    } catch {
      setResumo(null)
    }
  }

  const carregarParcelas = async () => {
    try {
      setLoadingReceber(true)
      const data = await fetchWithAuth('/financeiro/parcelas?limite=100')
      setParcelas(data.parcelas || [])
    } catch {
      setParcelas([])
    } finally {
      setLoadingReceber(false)
    }
  }

  const carregarContas = async () => {
    try {
      setLoadingPagar(true)
      const data = await fetchWithAuth('/financeiro/contas?limite=100')
      setContas(data.contas || [])
    } catch {
      setContas([])
    } finally {
      setLoadingPagar(false)
    }
  }

  useEffect(() => {
    carregarResumo()
    carregarParcelas()
    carregarContas()
  }, [reloadSignal])

  const registrarRecebimento = async (parcelaId) => {
    try {
      setUpdatingId(parcelaId)
      await fetchWithAuth(`/financeiro/parcelas/${parcelaId}/receber`, { method: 'POST', body: JSON.stringify({}) })
      await Promise.all([carregarResumo(), carregarParcelas()])
      toast('Recebimento registrado!')
    } catch (err) {
      toast(err.message || 'Erro ao registrar recebimento')
    } finally {
      setUpdatingId(null)
    }
  }

  const registrarPagamento = async (contaId) => {
    try {
      setUpdatingId(contaId)
      await fetchWithAuth(`/financeiro/contas/${contaId}/pagar`, { method: 'POST', body: JSON.stringify({}) })
      await Promise.all([carregarResumo(), carregarContas()])
      toast('Pagamento registrado!')
    } catch (err) {
      toast(err.message || 'Erro ao registrar pagamento')
    } finally {
      setUpdatingId(null)
    }
  }

  const resumoView = useMemo(() => ({
    totalReceber: resumo?.a_receber?.total || 0,
    totalVencido: resumo?.a_receber?.vencido || 0,
    totalPagar: resumo?.a_pagar?.total || 0,
  }), [resumo])

  const saldoPrevisto = resumoView.totalReceber - resumoView.totalPagar
  const vencidasCount = parcelas.filter((p) => p.status === 'vencido').length

  return (
    <div>
      <div className="stats-grid" style={{marginBottom:18}}>
        <div className="stat"><div className="stat-lbl">Total a Receber</div><div className="stat-val g">{money(resumoView.totalReceber)}</div><div className="stat-sub">{parcelas.length} parcelas</div></div>
        <div className="stat alert-card"><div className="stat-lbl">Vencido</div><div className="stat-val r">{money(resumoView.totalVencido)}</div><div className="stat-sub">{vencidasCount} parcelas em atraso</div></div>
        <div className="stat"><div className="stat-lbl">Total a Pagar</div><div className="stat-val a">{money(resumoView.totalPagar)}</div><div className="stat-sub">{contas.length} contas</div></div>
        <div className="stat"><div className="stat-lbl">Saldo Previsto</div><div className={`stat-val ${saldoPrevisto >= 0 ? 'g' : 'r'}`}>{money(saldoPrevisto)}</div><div className="stat-sub">receber − pagar</div></div>
      </div>

      <div className="tabs" style={{width:'fit-content'}}>
        <div className={`tab ${tab==='receber'?'active':''}`} onClick={() => setTab('receber')} style={{minWidth:120}}>A Receber</div>
        <div className={`tab ${tab==='pagar'?'active':''}`}   onClick={() => setTab('pagar')}   style={{minWidth:120}}>A Pagar</div>
      </div>

      {tab === 'receber' && (
        <div>
          <div className="alert-banner" style={{marginBottom:12}}>
            <div className="ab-icon">🔴</div>
            <div className="ab-body">
              <div className="ab-title">{`${vencidasCount} parcelas vencidas · ${money(resumoView.totalVencido)}`}</div>
              <div className="ab-sub">Acione o cliente ou registre o recebimento manualmente</div>
            </div>
          </div>
          <div className="tbl-wrap">
            {loadingReceber && <div style={{padding:14,fontSize:13,color:'var(--muted)'}}>Carregando parcelas...</div>}
            {!loadingReceber && parcelas.length === 0 && <div style={{padding:14,fontSize:13,color:'var(--muted)'}}>Nenhuma parcela encontrada.</div>}
            {parcelas.map((r) => {
              const status = statusParcelaLabel(r)
              const icon = status.cls === 'vencida' ? '🔴' : status.cls === 'proxima' ? '⚠️' : r.status === 'pago' ? '💚' : '📅'
              const bg = status.cls === 'vencida' ? 'var(--dangerb)' : status.cls === 'proxima' ? 'var(--amberb)' : r.status === 'pago' ? 'var(--greenb)' : 'var(--blueb)'
              const podeReceber = r.status === 'pendente' || r.status === 'vencido'
              return (
              <div key={r.id} className="conta-row">
                <div className="conta-ico" style={{background:bg}}>{icon}</div>
                <div className="conta-body">
                  <div className="conta-desc">{`${r.cliente_nome || 'Cliente'} · ${r.veiculo || 'Veículo'}`}</div>
                  <div className="conta-meta">{`Parcela ${r.numero}/${r.total} · vencimento ${fmtDate(r.data_vencimento)}`}</div>
                </div>
                <div className="conta-right">
                  <div className="conta-val receber">{money(r.valor)}</div>
                  <div className={`conta-venc ${status.cls==='vencida'?'vencida':status.cls==='proxima'?'proxima':''}`}
                    style={status.cls==='ok'?{color:'var(--green)'}:{}}>{status.txt}</div>
                </div>
                {podeReceber && <button className="btn-p" style={{marginLeft:10,fontSize:12,padding:'6px 12px'}} disabled={updatingId === r.id} onClick={() => registrarRecebimento(r.id)}>{updatingId === r.id ? 'Salvando...' : 'Recebido'}</button>}
              </div>
            )})}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <button className="btn-p" onClick={() => onOpenModal('addReceber')}>+ Registrar Recebimento</button>
          </div>
        </div>
      )}

      {tab === 'pagar' && (
        <div>
          <div className="sec-title">Contas a Pagar</div>
          <div className="tbl-wrap" style={{marginBottom:16}}>
            {loadingPagar && <div style={{padding:14,fontSize:13,color:'var(--muted)'}}>Carregando contas...</div>}
            {!loadingPagar && contas.length === 0 && <div style={{padding:14,fontSize:13,color:'var(--muted)'}}>Nenhuma conta cadastrada.</div>}
            {contas.map((r) => {
              const dias = diasPara(r.data_vencimento)
              const isVencida = r.status === 'vencido' || (typeof dias === 'number' && dias < 0)
              const isPaga = r.status === 'pago'
              const isProxima = !isVencida && !isPaga && typeof dias === 'number' && dias <= 7
              const venc = isPaga ? 'Pago' : isVencida ? `${Math.abs(dias)} dias em atraso` : `vence em ${dias} dia${dias === 1 ? '' : 's'}`
              const bg = isPaga ? 'var(--greenb)' : isVencida ? 'var(--dangerb)' : isProxima ? 'var(--amberb)' : 'var(--blueb)'
              const ico = isPaga ? '✅' : isVencida ? '🔴' : '📅'
              return (
              <div key={r.id} className="conta-row">
                <div className="conta-ico" style={{background:bg}}>{ico}</div>
                <div className="conta-body">
                  <div className="conta-desc">{r.descricao}</div>
                  <div className="conta-meta">{`${r.categoria} · vencimento ${fmtDate(r.data_vencimento)}`}</div>
                </div>
                <div className="conta-right">
                  <div className="conta-val pagar">{money(r.valor)}</div>
                  <div className={`conta-venc ${isProxima || isVencida ? 'proxima' : ''}`}
                    style={isPaga?{color:'var(--green)'}:{}}>{venc}</div>
                </div>
                {!isPaga && <button className="btn-p" style={{marginLeft:10,fontSize:12,padding:'6px 12px'}} disabled={updatingId === r.id} onClick={() => registrarPagamento(r.id)}>{updatingId === r.id ? 'Salvando...' : 'Pago'}</button>}
              </div>
            )})}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button className="btn-p" onClick={() => onOpenModal('addPagar')}>+ Lançar Despesa</button>
          </div>
        </div>
      )}
    </div>
  )
}
