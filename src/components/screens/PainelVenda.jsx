import { useEffect, useState } from 'react'
import { useToast } from '../ui/Toast'
import { fetchWithAuth } from '../../services/apiBackend'

const PGTOS = [
  { icon: '⚡', name: 'Pix', code: 'pix', desc: 'Transferência instantânea' },
  { icon: '💳', name: 'Cartão de Crédito', code: 'cartao', desc: 'Parcelado ou à vista' },
  { icon: '🏦', name: 'Boleto Bancário', code: 'boleto', desc: 'Vencimento em até 30 dias' },
  { icon: '🤝', name: 'Financiamento', code: 'financiamento', desc: 'Banco / Financeira parceira' },
  { icon: '💵', name: 'Dinheiro', code: 'dinheiro', desc: 'Pagamento em espécie' },
  { icon: '🔄', name: 'Troca + Complemento', code: 'troca', desc: 'Veículo + diferença' },
]

export default function PainelVenda({ onOpenModal }) {
  const toast = useToast()
  const [step, setStep]         = useState(1)
  const [cpf, setCpf]           = useState('')
  const [cliente, setCliente]   = useState(null) // null|false|obj
  const [searchingCliente, setSearchingCliente] = useState(false)
  const [veiculos, setVeiculos] = useState([])
  const [veiculo, setVeiculo]   = useState(0)
  const [pgto, setPgto]         = useState(0)
  const [valor, setValor]       = useState('')
  const [dataVenda, setData]    = useState(new Date().toISOString().slice(0, 10))
  const [parcelas, setParcelas] = useState('À vista')
  const [entrada, setEntrada]   = useState('')
  const [obs, setObs]           = useState('')
  const [saving, setSaving]     = useState(false)

  function formatCpf(v) {
    let s = v.replace(/\D/g, '')
    if (s.length > 9)      s = s.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
    else if (s.length > 6) s = s.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    else if (s.length > 3) s = s.replace(/(\d{3})(\d{0,3})/, '$1.$2')
    setCpf(s)
  }

  useEffect(() => {
    const clean = cpf.replace(/\D/g, '')
    if (clean.length !== 11) {
      setCliente(null)
      return
    }
    const run = async () => {
      setSearchingCliente(true)
      try {
        const data = await fetchWithAuth(`/clientes/cpf/${clean}`)
        setCliente(data?.cliente || false)
      } catch {
        setCliente(false)
      } finally {
        setSearchingCliente(false)
      }
    }
    run()
  }, [cpf])

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchWithAuth('/veiculos/?status=disponivel&limite=100')
        setVeiculos(data.veiculos || [])
        if (data.veiculos?.length) {
          const v = data.veiculos[0]
          setValor(Number(v.preco_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        }
      } catch {
        setVeiculos([])
      }
    }
    run()
  }, [])

  useEffect(() => {
    const v = veiculos[veiculo]
    if (v) {
      setValor(Number(v.preco_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    }
  }, [veiculo, veiculos])

  function parseMoney(v) {
    const clean = String(v || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Number(clean || 0)
  }

  async function confirmarVenda() {
    if (!cliente?.id) {
      toast('Selecione um cliente válido')
      return
    }
    if (!veiculos[veiculo]?.id) {
      toast('Selecione um veículo disponível')
      return
    }
    try {
      setSaving(true)
      const parcelasNum = parcelas === 'À vista' ? 1 : Number(parcelas.replace('x', '')) || 1
      await fetchWithAuth('/vendas/', {
        method: 'POST',
        body: JSON.stringify({
          veiculo_id: veiculos[veiculo].id,
          cliente_id: cliente.id,
          valor_venda: parseMoney(valor),
          valor_entrada: parseMoney(entrada),
          forma_pagamento: PGTOS[pgto].code,
          parcelas: parcelasNum,
          data_venda: dataVenda,
          observacoes: obs,
        }),
      })
      toast('✅ Venda registrada com sucesso!')
      setStep(1)
      setCpf('')
      setCliente(null)
    } catch (err) {
      toast(err.message || 'Erro ao registrar venda')
    } finally {
      setSaving(false)
    }
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
                <div className="cpf-found-av">{(cliente.nome || '').slice(0, 2).toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div className="cpf-found-name">{cliente.nome}</div>
                  <div className="cpf-found-meta">{cliente.email || cliente.telefone || 'Cliente encontrado'}</div>
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
            {searchingCliente && (
              <div style={{marginTop:8,fontSize:12,color:'var(--muted)'}}>Buscando cliente...</div>
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
              <div style={{fontSize:12,color:'var(--muted)'}}>Mostrando apenas veículos disponíveis em estoque</div>
            </div>
            <div className="vsel-grid">
              {veiculos.map((v, i) => (
                <div key={i} className={`vsel-card ${veiculo === i ? 'selected' : ''}`} onClick={() => setVeiculo(i)}>
                  <div className="vsel-img">{v.tipo === 'Moto' ? '🏍️' : '🚗'}</div>
                  <div className="vsel-info">
                    <div className="vsel-modelo">{v.marca} {v.modelo}</div>
                    <div className="vsel-det">{v.ano_modelo || '—'} · {(v.km || 0).toLocaleString('pt-BR')} km · {v.placa || 'SEM PLACA'}</div>
                    <div className="vsel-preco">{Number(v.preco_venda || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                </div>
              ))}
              {!veiculos.length && (
                <div style={{fontSize:12,color:'var(--muted)'}}>Nenhum veículo disponível para venda.</div>
              )}
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
              ['Cliente',           cliente?.nome || 'Cliente selecionado'],
              ['Veículo',           veiculos[veiculo] ? `${veiculos[veiculo].marca} ${veiculos[veiculo].modelo}` : '—'],
              ['Placa',             veiculos[veiculo]?.placa || '—'],
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
            <button className="btn-p" onClick={confirmarVenda} disabled={saving}>{saving ? 'Registrando...' : '✅ Registrar Venda'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
