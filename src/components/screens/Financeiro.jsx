import { useState } from 'react'
import { useToast } from '../ui/Toast'

export default function Financeiro({ onOpenModal }) {
  const toast = useToast()
  const [tab, setTab] = useState('receber')

  return (
    <div>
      <div className="stats-grid" style={{marginBottom:18}}>
        <div className="stat"><div className="stat-lbl">Total a Receber</div><div className="stat-val g">R$ 24.600</div><div className="stat-sub">8 parcelas ativas</div></div>
        <div className="stat alert-card"><div className="stat-lbl">Vencido</div><div className="stat-val r">R$ 3.400</div><div className="stat-sub">2 parcelas em atraso</div></div>
        <div className="stat"><div className="stat-lbl">Total a Pagar/mês</div><div className="stat-val a">R$ 11.320</div><div className="stat-sub">salários + despesas</div></div>
        <div className="stat"><div className="stat-lbl">Saldo Previsto</div><div className="stat-val g">R$ 13.280</div><div className="stat-sub">receber − pagar</div></div>
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
              <div className="ab-title">2 parcelas vencidas · R$ 3.400,00</div>
              <div className="ab-sub">Acione o cliente ou registre o recebimento manualmente</div>
            </div>
          </div>
          <div className="tbl-wrap">
            {[
              { ico:'🔴', bg:'var(--dangerb)', desc:'Carlos Mendes · Etios 2021',    meta:'Parcela 3/18 · venceu em 10/03/2026', val:'R$ 1.800', venc:'9 dias em atraso',    vc:'vencida',  btn:true },
              { ico:'🔴', bg:'var(--dangerb)', desc:'Rafaela Costa · Gol 2021',      meta:'Parcela 2/12 · venceu em 12/03/2026', val:'R$ 1.600', venc:'7 dias em atraso',    vc:'vencida',  btn:true },
              { ico:'⚠️', bg:'var(--amberb)', desc:'Pedro Alves · Sandero 2020',    meta:'Parcela 5/24 · vence em 22/03/2026',  val:'R$ 2.200', venc:'em 3 dias',            vc:'proxima',  lembrar:true },
              { ico:'💚', bg:'var(--greenb)', desc:'Rodrigo Mendes · Corolla 2020',  meta:'Parcela 1/1 · À vista · 14/03/2026',  val:'R$ 112.000', venc:'Recebido',          vc:'ok' },
              { ico:'📅', bg:'var(--blueb)',  desc:'Fernanda Lima · Argo 2023',      meta:'Parcela 2/12 · vence em 01/04/2026',  val:'R$ 2.100', venc:'em 13 dias',           vc:'' },
            ].map((r, i) => (
              <div key={i} className="conta-row">
                <div className="conta-ico" style={{background:r.bg}}>{r.ico}</div>
                <div className="conta-body">
                  <div className="conta-desc">{r.desc}</div>
                  <div className="conta-meta">{r.meta}</div>
                </div>
                <div className="conta-right">
                  <div className="conta-val receber">{r.val}</div>
                  <div className={`conta-venc ${r.vc==='vencida'?'vencida':r.vc==='proxima'?'proxima':''}`}
                    style={r.vc==='ok'?{color:'var(--green)'}:{}}>{r.venc}</div>
                </div>
                {r.btn && <button className="btn-p" style={{marginLeft:10,fontSize:12,padding:'6px 12px'}} onClick={() => toast('Recebimento registrado!')}>Recebido</button>}
                {r.lembrar && <button className="btn-g" style={{marginLeft:10,fontSize:12,padding:'6px 12px'}} onClick={() => toast('Lembrete enviado por WhatsApp!')}>Lembrar</button>}
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <button className="btn-p" onClick={() => onOpenModal('addReceber')}>+ Registrar Recebimento</button>
          </div>
        </div>
      )}

      {tab === 'pagar' && (
        <div>
          <div className="sec-title">Despesas Fixas Mensais</div>
          <div className="tbl-wrap" style={{marginBottom:16}}>
            {[
              { ico:'✅', bg:'var(--greenb)', desc:'Salário — Carlos (vendedor)', meta:'Recorrente · pago em 05/03',        val:'R$ 2.800', venc:'Pago',        vc:'ok' },
              { ico:'✅', bg:'var(--greenb)', desc:'Energia elétrica',            meta:'ENEL · pago em 15/03',              val:'R$ 640',   venc:'Pago',        vc:'ok' },
              { ico:'📅', bg:'var(--amberb)', desc:'Aluguel da loja',             meta:'Vence em 25/03/2026',               val:'R$ 3.500', venc:'em 6 dias',   vc:'proxima', btn:true },
              { ico:'📅', bg:'var(--amberb)', desc:'Internet + Telefone',         meta:'Vivo Empresas · vence 22/03',       val:'R$ 280',   venc:'em 3 dias',   vc:'proxima', btn:true },
              { ico:'📅', bg:'var(--amberb)', desc:'Água',                        meta:'CAGECE · vence 28/03',              val:'R$ 180',   venc:'em 9 dias',   vc:'proxima', btn:true },
            ].map((r, i) => (
              <div key={i} className="conta-row">
                <div className="conta-ico" style={{background:r.bg}}>{r.ico}</div>
                <div className="conta-body">
                  <div className="conta-desc">{r.desc}</div>
                  <div className="conta-meta">{r.meta}</div>
                </div>
                <div className="conta-right">
                  <div className="conta-val pagar">{r.val}</div>
                  <div className={`conta-venc ${r.vc==='proxima'?'proxima':''}`}
                    style={r.vc==='ok'?{color:'var(--green)'}:{}}>{r.venc}</div>
                </div>
                {r.btn && <button className="btn-p" style={{marginLeft:10,fontSize:12,padding:'6px 12px'}} onClick={() => toast('Pagamento registrado!')}>Pago</button>}
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button className="btn-p" onClick={() => onOpenModal('addPagar')}>+ Lançar Despesa</button>
          </div>
        </div>
      )}
    </div>
  )
}
