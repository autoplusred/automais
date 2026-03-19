import { useToast } from '../ui/Toast'

export default function Painel({ onNav }) {
  const toast = useToast()

  return (
    <div>
      {/* Alertas */}
      <div className="alert-banner pulse" onClick={() => onNav('financeiro')}>
        <div className="ab-icon">🚨</div>
        <div className="ab-body">
          <div className="ab-title">2 parcelas vencidas — total R$ 3.400</div>
          <div className="ab-sub">Carlos Mendes (R$1.800 · venc. 10/03) e Rafaela Costa (R$1.600 · venc. 12/03) · Clique para ver</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div className="warn-banner">
        <div style={{fontSize:16}}>⚠️</div>
        <div>
          <div className="wb-title">1 parcela vence em 3 dias</div>
          <div className="wb-sub">Pedro Alves — R$ 2.200 · vence em 22/03/2026</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat"><div className="stat-lbl">Receita Mês</div><div className="stat-val g">R$ 184K</div><div className="stat-sub"><span className="up">↑ 12%</span> vs mês anterior</div></div>
        <div className="stat"><div className="stat-lbl">Vendas</div><div className="stat-val b">7</div><div className="stat-sub">este mês</div></div>
        <div className="stat"><div className="stat-lbl">Veículos</div><div className="stat-val a">23</div><div className="stat-sub">em estoque</div></div>
        <div className="stat alert-card"><div className="stat-lbl">Vencido</div><div className="stat-val r">R$ 3,4K</div><div className="stat-sub">2 parcelas em atraso</div></div>
        <div className="stat warn-card"><div className="stat-lbl">A Receber / 30d</div><div className="stat-val a">R$ 21K</div><div className="stat-sub">8 parcelas futuras</div></div>
        <div className="stat"><div className="stat-lbl">Lucro Estimado</div><div className="stat-val g">R$ 62K</div><div className="stat-sub">margem 33,7%</div></div>
      </div>

      <div className="two-col">
        {/* Atividade */}
        <div className="card-blk">
          <div className="card-blk-hd">Atividade Recente</div>
          <div className="act-list">
            {[
              { ico: '💰', bg: 'var(--greenb)', title: 'Venda registrada — Corolla 2020', sub: 'Rodrigo Mendes · R$ 112.000 · Pix', time: 'hoje 14h' },
              { ico: '👤', bg: 'var(--blueb)',  title: 'Novo cliente cadastrado',          sub: 'Fernanda Lima · CPF 432.xxx.xxx-xx', time: 'hoje 11h' },
              { ico: '⚠️', bg: 'var(--dangerb)',title: 'Parcela vencida',                  sub: 'Carlos Mendes · R$ 1.800 · 9 dias de atraso', time: 'ontem' },
              { ico: '🚗', bg: 'var(--red4)',   title: 'Veículo adicionado ao estoque',    sub: 'Fiat Argo 2023 · R$ 78.500', time: 'ontem' },
              { ico: '💸', bg: 'var(--amberb)', title: 'Conta paga — Energia elétrica',    sub: 'R$ 640 · março 2026', time: '15/03' },
            ].map((r, i) => (
              <div key={i} className="act-row">
                <div className="act-ico" style={{background:r.bg}}>{r.ico}</div>
                <div className="act-body"><div className="act-title">{r.title}</div><div className="act-sub">{r.sub}</div></div>
                <div className="act-time">{r.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contas a pagar resumo */}
        <div className="card-blk">
          <div className="card-blk-hd">Contas a Pagar — Março</div>
          <div className="act-list">
            {[
              { ico:'✅', bg:'var(--greenb)', title:'Salário — Carlos (vendedor)', sub:'R$ 2.800', badge:'b-g', bl:'Pago' },
              { ico:'✅', bg:'var(--greenb)', title:'Energia elétrica',             sub:'R$ 640',  badge:'b-g', bl:'Pago' },
              { ico:'📅', bg:'var(--amberb)', title:'Aluguel da loja',              sub:'R$ 3.500 · vence 25/03', badge:'b-a', bl:'Pendente' },
              { ico:'📅', bg:'var(--amberb)', title:'Internet + telefone',          sub:'R$ 280 · vence 22/03',   badge:'b-a', bl:'Pendente' },
            ].map((r, i) => (
              <div key={i} className="act-row">
                <div className="act-ico" style={{background:r.bg}}>{r.ico}</div>
                <div className="act-body"><div className="act-title">{r.title}</div><div className="act-sub">{r.sub}</div></div>
                <span className={`badge ${r.badge}`}>{r.bl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
