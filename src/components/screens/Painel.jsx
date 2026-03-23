import { useEffect, useMemo, useState } from 'react'
import { fetchWithAuth } from '../../services/apiBackend'

export default function Painel({ onNav }) {
  const [dashboard, setDashboard] = useState(null)
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const [dash, fin] = await Promise.all([
          fetchWithAuth('/dashboard/'),
          fetchWithAuth('/financeiro/resumo'),
        ])
        setDashboard(dash)
        setResumoFinanceiro(fin)
      } catch {
      }
    }
    carregar()
  }, [])

  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const kpis = dashboard?.kpis || {}
  const atividade = dashboard?.atividade || []
  const alertas = useMemo(() => (dashboard?.alertas || []).slice(0, 4), [dashboard])

  return (
    <div>
      <div className="alert-banner pulse" onClick={() => onNav('financeiro')}>
        <div className="ab-icon">🚨</div>
        <div className="ab-body">
          <div className="ab-title">
            {`${kpis.parcelas_vencidas || 0} parcelas vencidas — total ${money(kpis.valor_vencido || 0)}`}
          </div>
          <div className="ab-sub">Clique para abrir o financeiro e regularizar os recebimentos em atraso.</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div className="warn-banner">
        <div style={{fontSize:16}}>⚠️</div>
        <div>
          <div className="wb-title">{`${alertas.length} alertas de parcelas próximas/vencidas`}</div>
          <div className="wb-sub">Acompanhe os vencimentos para manter o fluxo de caixa saudável.</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat"><div className="stat-lbl">Receita Mês</div><div className="stat-val g">{money(kpis.receita_mes || 0)}</div><div className="stat-sub">vendas concluídas</div></div>
        <div className="stat"><div className="stat-lbl">Vendas</div><div className="stat-val b">{kpis.vendas_mes || 0}</div><div className="stat-sub">este mês</div></div>
        <div className="stat"><div className="stat-lbl">Veículos</div><div className="stat-val a">{kpis.estoque || 0}</div><div className="stat-sub">em estoque</div></div>
        <div className="stat alert-card"><div className="stat-lbl">Vencido</div><div className="stat-val r">{money(kpis.valor_vencido || 0)}</div><div className="stat-sub">{kpis.parcelas_vencidas || 0} parcelas em atraso</div></div>
        <div className="stat warn-card"><div className="stat-lbl">A Receber</div><div className="stat-val a">{money(resumoFinanceiro?.a_receber?.total || 0)}</div><div className="stat-sub">carteira ativa</div></div>
        <div className="stat"><div className="stat-lbl">Custo Estoque</div><div className="stat-val g">{money(resumoFinanceiro?.estoque?.custo || 0)}</div><div className="stat-sub">{resumoFinanceiro?.estoque?.veiculos || 0} veículos</div></div>
      </div>

      <div className="two-col">
        <div className="card-blk">
          <div className="card-blk-hd">Atividade Recente</div>
          <div className="act-list">
            {atividade.map((r, i) => (
              <div key={i} className="act-row">
                <div className="act-ico" style={{background:r.tipo === 'venda' ? 'var(--greenb)' : 'var(--dangerb)'}}>
                  {r.tipo === 'venda' ? '💰' : '⚠️'}
                </div>
                <div className="act-body">
                  <div className="act-title">{r.descricao}</div>
                  <div className="act-sub">{`${r.detalhe || ''} · ${money(r.valor)}`}</div>
                </div>
                <div className="act-time">{new Date(r.quando).toLocaleDateString('pt-BR')}</div>
              </div>
            ))}
            {!atividade.length && <div style={{fontSize:12,color:'var(--muted)'}}>Sem atividades recentes.</div>}
          </div>
        </div>

        <div className="card-blk">
          <div className="card-blk-hd">Alertas Financeiros</div>
          <div className="act-list">
            {alertas.map((r, i) => (
              <div key={i} className="act-row">
                <div className="act-ico" style={{background:'var(--amberb)'}}>📅</div>
                <div className="act-body">
                  <div className="act-title">{r.cliente_nome}</div>
                  <div className="act-sub">{`${r.veiculo || ''} · venc. ${new Date(r.data_vencimento).toLocaleDateString('pt-BR')}`}</div>
                </div>
                <span className="badge b-a">{money(r.valor)}</span>
              </div>
            ))}
            {!alertas.length && <div style={{fontSize:12,color:'var(--muted)'}}>Sem alertas no momento.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
