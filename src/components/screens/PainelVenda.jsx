import { useState } from 'react'
import { useToast } from '../ui/Toast'

// Mock DB
const CLIENTES_DB = {
  '43200000099': { name: 'Rodrigo Mendes', meta: 'CPF verificado · (85) 99999-1234 · 2 compras anteriores', initials: 'RM' },
  '32100000088': { name: 'Beatriz Santos', meta: 'CPF verificado · (85) 98888-4567 · 1 compra anterior',   initials: 'BE' },
}

const VEICULOS = [
  { emoji: '🚙', modelo: 'Corolla XEI 2020',   det: '62.000 km · Flex · BRA2A23',   preco: 'R$ 112.000' },
  { emoji: '🚗', modelo: 'Fiat Argo 2023',      det: '18.000 km · Flex · CEA3B45',   preco: 'R$ 78.500' },
  { emoji: '🚘', modelo: 'Honda Civic 2019',    det: '85.000 km · Flex · FOR4C67',   preco: 'R$ 89.000' },
  { emoji: '🛻', modelo: 'Chevrolet S10 2021',  det: '45.000 km · Diesel · SAL5D89', preco: 'R$ 165.000' },
]

const PGTOS = [
  { icon: '⚡', name: 'Pix',                desc: 'Transferência instantânea' },
  { icon: '💳', name: 'Cartão de Crédito',  desc: 'Parcelado ou à vista' },
  { icon: '🏦', name: 'Boleto Bancário',    desc: 'Vencimento em até 30 dias' },
  { icon: '🤝', name: 'Financiamento',      desc: 'Banco / Financeira parceira' },
  { icon: '💵', name: 'Dinheiro',           desc: 'Pagamento em espécie' },
  { icon: '🔄', name: 'Troca + Complemento', desc: 'Veículo + diferença' },
]

export default function PainelVenda({ onOpenModal }) {
  const toast = useToast()
  const [step, setStep]         = useState(1)
  const [cpf, setCpf]           = useState('')
  const [cliente, setCliente]   = useState(null)
  const [veiculo, setVeiculo]   = useState(0)
  const [pgto, setPgto]         = useState(0)
  const [valor, setValor]       = useState('112.000,00')
  const [dataVenda, setData]    = useState('2026-03-19')
  const [parcelas, setParcelas] = useState('À vista')
  const [entrada, setEntrada]   = useState('')
  const [obs, setObs]           = useState('')

  function formatCpf(v) {
    let s = v.replace(/\D/g, '')
    if (s.length > 9)      s = s.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
    else if (s.length > 6) s = s.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    else if (s.length > 3) s = s.replace(/(\d{3})(\d{0,3})/, '$1.$2')
    setCpf(s)
    const clean = s.replace(/\D/g, '')
    if (clean.length === 11) setCliente(CLIENTES_DB[clean] || false)
    else setCliente(null)
  }

  function confirmarVenda() {
    toast('✅ Venda registrada com sucesso!')
    setTimeout(() => { setStep(1); setCpf(''); setCliente(null) }, 400)
  }

  const fmtDate = (d) => { const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}` }

  const STEPS = ['Cliente', 'Veículo', 'Pagamento', 'Confirmar']

  return (
    <div>
      {/* Steps */}
      <div className="wizard-steps">
        {STEPS.map((lbl, i) => (
          <>
            <div key={i} className={`wstep ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <div className="wstep-num">{step > i+1 ? '✓' : i+1}</div>
              <div className="wstep-lbl">{lbl}</div>
            </div>
            {i < STEPS.length - 1 && <div key={`l${i}`} className={`wstep-line ${step > i+1 ? 'done' : ''}`} />}
          </>
        ))}
      </div>

      {/* ── STEP 1: CLIENTE ── */}
      {step === 1 && (
        <div>
          <div className="wizard-box">
            <div className="wiz-title">Identificar Cliente</div>
            <div className="fg">
              <div className="fl">Buscar por CPF</div>
              <input
                className="fi search-cpf"
                placeholder="000.000.000-00"
                maxLength={14}
                value={cpf}
                onChange={e => formatCpf(e.target.value)}
              />
            </div>

            {cliente && (
              <div className="cpf-result show">
                <div className="cpf-found-av">{cliente.initials}</div>
                <div style={{flex:1}}>
                  <div className="cpf-found-name">{cliente.name}</div>
                  <div className="cpf-found-meta">{cliente.meta}</div>
                </div>
                <button className="btn-p" onClick={() => setStep(2)}>Selecionar →</button>
              </div>
            )}

            {cliente === false && (
              <div className="cpf-not-found show">
                <span style={{fontSize:18}}>🔍</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--amber)'}}>CPF não encontrado no cadastro</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>Cadastre este cliente para continuar</div>
                </div>
                <button className="btn-p" onClick={() => onOpenModal('novoCliente')}>+ Cadastrar</button>
              </div>
            )}
          </div>

          <div style={{textAlign:'center',margin:'8px 0',color:'var(--muted)',fontSize:13}}>— ou —</div>
          <div className="wizard-box" style={{padding:'16px 24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:14,fontWeight:600}}>Novo cliente sem CPF buscado</div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Cadastre antes de registrar a venda</div>
              </div>
              <button className="btn-p" onClick={() => onOpenModal('novoCliente')}>+ Novo Cliente</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: VEÍCULO ── */}
      {step === 2 && (
        <div>
          <div className="wizard-box">
            <div className="wiz-title">Selecionar Veículo</div>
            <div className="search-row" style={{marginBottom:14}}>
              <input className="fi" placeholder="🔍  Filtrar por modelo, placa..." style={{maxWidth:280}} />
            </div>
            <div className="vsel-grid">
              {VEICULOS.map((v, i) => (
                <div key={i} className={`vsel-card ${veiculo === i ? 'selected' : ''}`} onClick={() => setVeiculo(i)}>
                  <div className="vsel-img">{v.emoji}</div>
                  <div className="vsel-info">
                    <div className="vsel-modelo">{v.modelo}</div>
                    <div className="vsel-det">{v.det}</div>
                    <div className="vsel-preco">{v.preco}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button className="btn-g" onClick={() => setStep(1)}>← Voltar</button>
            <button className="btn-p" onClick={() => setStep(3)}>Próximo →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: PAGAMENTO ── */}
      {step === 3 && (
        <div>
          <div className="wizard-box">
            <div className="wiz-title">Forma de Pagamento</div>
            <div className="pgto-grid">
              {PGTOS.map((p, i) => (
                <div key={i} className={`pgto-card ${pgto === i ? 'selected' : ''}`} onClick={() => setPgto(i)}>
                  <div className="pgto-icon">{p.icon}</div>
                  <div className="pgto-name">{p.name}</div>
                  <div className="pgto-desc">{p.desc}</div>
                </div>
              ))}
            </div>
            <div className="div-bar" />
            <div className="form-grid">
              <div className="fg">
                <div className="fl">Valor da Venda (R$)</div>
                <input className="fi large" value={valor} onChange={e => setValor(e.target.value)} />
              </div>
              <div className="fg">
                <div className="fl">Data da Venda</div>
                <input className="fi large" type="date" value={dataVenda} onChange={e => setData(e.target.value)} />
              </div>
              <div className="fg">
                <div className="fl">Parcelas</div>
                <select className="fi" value={parcelas} onChange={e => setParcelas(e.target.value)}>
                  {['À vista','2x','3x','6x','12x','18x','24x','36x','48x'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="fg">
                <div className="fl">Entrada (R$)</div>
                <input className="fi" placeholder="0,00 (opcional)" value={entrada} onChange={e => setEntrada(e.target.value)} />
              </div>
              <div className="fg full">
                <div className="fl">Observações da venda</div>
                <textarea className="fi ta" placeholder="Ex: cliente trouxe HB20 2018 na troca..." value={obs} onChange={e => setObs(e.target.value)} />
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button className="btn-g" onClick={() => setStep(2)}>← Voltar</button>
            <button className="btn-p" onClick={() => setStep(4)}>Revisar Venda →</button>
          </div>
        </div>
      )}

      {/* ── STEP 4: CONFIRMAR ── */}
      {step === 4 && (
        <div>
          <div className="wizard-box">
            <div className="wiz-title">Resumo da Venda</div>
            {[
              ['Cliente',           cliente?.name || 'Cliente selecionado'],
              ['Veículo',           VEICULOS[veiculo].modelo],
              ['Placa',             VEICULOS[veiculo].det.split('·')[2]?.trim() || '—'],
              ['Forma de Pagamento', PGTOS[pgto].name],
              ['Parcelas',          parcelas],
              ['Data da Venda',     fmtDate(dataVenda)],
            ].map(([l, v]) => (
              <div key={l} className="resumo-row">
                <div className="rl">{l}</div>
                <div className="rv">{v}</div>
              </div>
            ))}
            <div className="resumo-row total">
              <div className="rl">Valor Total</div>
              <div className="rv">R$ {valor}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button className="btn-g" onClick={() => setStep(3)}>← Corrigir</button>
            <button className="btn-p" onClick={confirmarVenda}>✅ Registrar Venda</button>
          </div>
        </div>
      )}
    </div>
  )
}
