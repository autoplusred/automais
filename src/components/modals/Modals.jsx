import { useState, useEffect, useCallback } from 'react'
import Modal from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { useApiSettings } from '../../context/ApiSettings'
import { fetchCep, fetchFipeMarcas, fetchFipeModelos, fetchFipeAnos, fetchFipePreco, fetchPlaca } from '../../services/api'

/* ══════════════════════════════════════════════
   MODAL NOVO CLIENTE — com CEP automático
══════════════════════════════════════════════ */
export function ModalNovoCliente({ open, onClose }) {
  const toast = useToast()
  const { isEnabled } = useApiSettings()
  const cepEnabled = isEnabled('cep')

  const [cep, setCep]         = useState('')
  const [cepStatus, setStatus]= useState(null) // null | 'loading' | 'ok' | 'error'
  const [addr, setAddr]       = useState({ street:'', neighborhood:'', city:'', state:'' })

  async function handleCep(value) {
    const clean = value.replace(/\D/g,'')
    setCep(value)
    if (!cepEnabled || clean.length !== 8) return
    setStatus('loading')
    try {
      const data = await fetchCep(clean)
      setAddr({
        street:       data.street       || '',
        neighborhood: data.neighborhood || '',
        city:         data.city         || '',
        state:        data.state        || '',
      })
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  function formatCepInput(v) {
    let s = v.replace(/\D/g,'')
    if (s.length > 5) s = s.slice(0,5) + '-' + s.slice(5,8)
    handleCep(s)
  }

  function reset() {
    setCep(''); setStatus(null); setAddr({ street:'', neighborhood:'', city:'', state:'' })
  }

  return (
    <Modal title="Cadastro de Cliente" open={open} onClose={() => { onClose(); reset() }} wide>

      <SectionLbl>Dados Pessoais</SectionLbl>
      <div className="form-grid">
        <div className="fg full"><div className="fl">Nome Completo</div><input className="fi" placeholder="Nome e sobrenome" /></div>
        <div className="fg"><div className="fl">CPF</div><input className="fi" placeholder="000.000.000-00" /></div>
        <div className="fg"><div className="fl">RG</div><input className="fi" placeholder="0000000 SSP/CE" /></div>
        <div className="fg"><div className="fl">CNH (se houver)</div><input className="fi" placeholder="Número da CNH" /></div>
        <div className="fg"><div className="fl">Data de Nascimento</div><input className="fi" type="date" /></div>
        <div className="fg"><div className="fl">Estado Civil</div>
          <select className="fi"><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option></select>
        </div>
      </div>

      <SectionLbl>Contato</SectionLbl>
      <div className="form-grid">
        <div className="fg"><div className="fl">WhatsApp / Celular</div><input className="fi" placeholder="(00) 00000-0000" /></div>
        <div className="fg"><div className="fl">Telefone Fixo</div><input className="fi" placeholder="(00) 0000-0000 (opcional)" /></div>
        <div className="fg full"><div className="fl">E-mail</div><input className="fi" placeholder="email@exemplo.com" /></div>
      </div>

      <SectionLbl>Endereço</SectionLbl>
      <div className="form-grid">
        {/* CEP com status */}
        <div className="fg">
          <div className="fl" style={{display:'flex',alignItems:'center',gap:6}}>
            CEP
            {cepEnabled && (
              <span style={{fontSize:9,fontWeight:700,letterSpacing:.5,background:'var(--greenb)',color:'var(--green)',padding:'1px 5px',borderRadius:5}}>
                AUTO
              </span>
            )}
          </div>
          <div style={{position:'relative'}}>
            <input
              className="fi"
              placeholder="00000-000"
              maxLength={9}
              value={cep}
              onChange={e => formatCepInput(e.target.value)}
              style={{ paddingRight: cepStatus ? 34 : 13 }}
            />
            {cepStatus === 'loading' && <Spinner />}
            {cepStatus === 'ok'      && <StatusIcon ok />}
            {cepStatus === 'error'   && <StatusIcon />}
          </div>
        </div>
        <div className="fg">
          <div className="fl">Estado</div>
          <select className="fi" value={addr.state} onChange={e => setAddr(a=>({...a,state:e.target.value}))}>
            {['','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="fg full">
          <div className="fl">Cidade</div>
          <input className="fi" placeholder="Fortaleza" value={addr.city} onChange={e => setAddr(a=>({...a,city:e.target.value}))} />
        </div>
        <div className="fg full">
          <div className="fl">Bairro</div>
          <input className="fi" placeholder="Bairro" value={addr.neighborhood} onChange={e => setAddr(a=>({...a,neighborhood:e.target.value}))} />
        </div>
        <div className="fg full">
          <div className="fl">Rua / Logradouro</div>
          <input className="fi" placeholder="Av. / Rua / Travessa..." value={addr.street} onChange={e => setAddr(a=>({...a,street:e.target.value}))} />
        </div>
        <div className="fg"><div className="fl">Número</div><input className="fi" placeholder="Nº" /></div>
        <div className="fg"><div className="fl">Complemento</div><input className="fi" placeholder="Apto, casa, bloco..." /></div>
      </div>

      <SectionLbl>Renda / Financeiro</SectionLbl>
      <div className="form-grid">
        <div className="fg"><div className="fl">Profissão</div><input className="fi" placeholder="Ex: Autônomo, CLT..." /></div>
        <div className="fg"><div className="fl">Renda Mensal (R$)</div><input className="fi" placeholder="0.000,00" /></div>
        <div className="fg full"><div className="fl">Referências / Obs.</div><textarea className="fi ta" placeholder="Nome de referência, indicação por..." /></div>
      </div>

      <div className="modal-actions">
        <button className="btn-g" onClick={() => { onClose(); reset() }}>Cancelar</button>
        <button className="btn-p" onClick={() => { onClose(); reset(); toast('✅ Cliente cadastrado!') }}>Cadastrar</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL ADD VEÍCULO — placa lookup + FIPE
══════════════════════════════════════════════ */
export function ModalAddVeiculo({ open, onClose }) {
  const toast = useToast()
  const { isEnabled, getToken } = useApiSettings()
  const fipeEnabled  = isEnabled('fipe')
  const placaEnabled = isEnabled('placa')

  // Placa lookup
  const [placa, setPlaca]         = useState('')
  const [placaStatus, setPlacaSt] = useState(null)

  // Campos preenchidos
  const [tipo, setTipo]           = useState('carros')
  const [form, setForm]           = useState({
    modelo:'', versao:'', anoFab:'', anoMod:'', renavam:'', chassi:'',
    km:'', combustivel:'Flex', cambio:'Manual', cor:'', tipoV:'Hatch',
    custoPrev:'', vendaPrev:'', obs:'',
  })

  // FIPE cascading
  const [marcas, setMarcas]       = useState([])
  const [modelos, setModelos]     = useState([])
  const [anos, setAnos]           = useState([])
  const [selMarca, setSelMarca]   = useState('')
  const [selModelo, setSelModelo] = useState('')
  const [selAno, setSelAno]       = useState('')
  const [fipePreco, setFipePreco] = useState(null)
  const [fipeLoading, setFipeLoad]= useState(false)

  // Carrega marcas quando abre e FIPE está ligado
  useEffect(() => {
    if (open && fipeEnabled) {
      fetchFipeMarcas(tipo).then(setMarcas).catch(() => {})
    }
  }, [open, fipeEnabled, tipo])

  // Carrega modelos quando marca muda
  useEffect(() => {
    if (!selMarca || !fipeEnabled) return
    setModelos([]); setSelModelo(''); setAnos([]); setSelAno(''); setFipePreco(null)
    fetchFipeModelos(tipo, selMarca).then(setModelos).catch(() => {})
  }, [selMarca, tipo, fipeEnabled])

  // Carrega anos quando modelo muda
  useEffect(() => {
    if (!selModelo || !fipeEnabled) return
    setAnos([]); setSelAno(''); setFipePreco(null)
    fetchFipeAnos(tipo, selMarca, selModelo).then(setAnos).catch(() => {})
  }, [selModelo, selMarca, tipo, fipeEnabled])

  // Busca preço quando ano muda
  useEffect(() => {
    if (!selAno || !fipeEnabled) return
    setFipeLoad(true); setFipePreco(null)
    fetchFipePreco(tipo, selMarca, selModelo, selAno)
      .then(d => { setFipePreco(d); setFipeLoad(false) })
      .catch(() => setFipeLoad(false))
  }, [selAno, selMarca, selModelo, tipo, fipeEnabled])

  // Consulta placa
  async function handlePlacaBlur(value) {
    const clean = value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()
    if (!placaEnabled || clean.length < 7) return
    const token = getToken('placa_token')
    if (!token) { toast('⚠️ Configure o token da consulta de placa em Configurações'); return }
    setPlacaSt('loading')
    try {
      const d = await fetchPlaca(clean, token)
      setForm(f => ({
        ...f,
        modelo:     d.modelo     || f.modelo,
        versao:     d.versao     || f.versao,
        anoFab:     String(d.anoFabricacao || f.anoFab),
        anoMod:     String(d.anoModelo     || f.anoMod),
        chassi:     d.chassi     || f.chassi,
        cor:        d.cor        || f.cor,
        combustivel:d.combustivel|| f.combustivel,
        custoPrev:  d.valorFipe  ? String(d.valorFipe).replace(/[^\d,]/g,'') : f.custoPrev,
      }))
      setPlacaSt('ok')
      toast('✅ Dados preenchidos pela placa!')
    } catch {
      setPlacaSt('error')
      toast('❌ Placa não encontrada ou token inválido')
    }
  }

  function reset() {
    setPlaca(''); setPlacaSt(null)
    setForm({modelo:'',versao:'',anoFab:'',anoMod:'',renavam:'',chassi:'',km:'',combustivel:'Flex',cambio:'Manual',cor:'',tipoV:'Hatch',custoPrev:'',vendaPrev:'',obs:''})
    setSelMarca(''); setSelModelo(''); setSelAno(''); setFipePreco(null)
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(p=>({...p,[key]:e.target.value})) })

  return (
    <Modal title="+ Novo Veículo" open={open} onClose={() => { onClose(); reset() }}>

      {/* ── Consulta por Placa ── */}
      {placaEnabled && (
        <div style={{background:'var(--red4)',border:'1px solid var(--border2)',borderRadius:10,padding:'12px 14px',marginBottom:16}}>
          <div style={{fontSize:11.5,fontWeight:600,color:'#ff8080',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
            🔍 Consulta por Placa
            <span style={{fontSize:9.5,background:'var(--amberb)',color:'var(--amber)',padding:'1px 6px',borderRadius:6,fontWeight:700}}>FREEMIUM</span>
          </div>
          <div style={{position:'relative',display:'flex',gap:8}}>
            <input
              className="fi"
              placeholder="Digite a placa — BRA2A23"
              maxLength={8}
              value={placa}
              onChange={e => setPlaca(e.target.value.toUpperCase())}
              onBlur={e => handlePlacaBlur(e.target.value)}
              style={{flex:1,letterSpacing:2,fontWeight:700,textTransform:'uppercase'}}
            />
            {placaStatus === 'loading' && <div style={{display:'flex',alignItems:'center',padding:'0 8px',color:'var(--muted)',fontSize:12}}>Buscando...</div>}
            {placaStatus === 'ok'      && <div style={{display:'flex',alignItems:'center',padding:'0 8px',color:'var(--green)',fontSize:12}}>✓ Preenchido</div>}
            {placaStatus === 'error'   && <div style={{display:'flex',alignItems:'center',padding:'0 8px',color:'var(--danger)',fontSize:12}}>Não encontrado</div>}
          </div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:6}}>Preenche marca, modelo, ano, chassi, cor e valor FIPE automaticamente.</div>
        </div>
      )}

      {/* ── Tipo de veículo ── */}
      <div className="fg" style={{marginBottom:14}}>
        <div className="fl">Tipo de Veículo</div>
        <div style={{display:'flex',gap:6}}>
          {[['carros','🚗 Carro'],['motos','🏍️ Moto'],['caminhoes','🚚 Caminhão']].map(([val,lbl]) => (
            <button key={val}
              className={tipo === val ? 'btn-p' : 'btn-g'}
              style={{flex:1,fontSize:12,padding:'7px 0'}}
              onClick={() => { setTipo(val); setSelMarca(''); setSelModelo(''); setSelAno(''); setFipePreco(null) }}
            >{lbl}</button>
          ))}
        </div>
      </div>

      {/* ── FIPE cascading ── */}
      {fipeEnabled && (
        <div style={{background:'rgba(74,158,255,0.04)',border:'1px solid rgba(74,158,255,0.2)',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
          <div style={{fontSize:11.5,fontWeight:600,color:'var(--blue)',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
            📊 Tabela FIPE
            <span style={{fontSize:9.5,background:'var(--greenb)',color:'var(--green)',padding:'1px 6px',borderRadius:6,fontWeight:700}}>GRÁTIS</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            <div className="fg">
              <div className="fl">Marca</div>
              <select className="fi" style={{fontSize:12}} value={selMarca} onChange={e => setSelMarca(e.target.value)}>
                <option value="">Selecionar...</option>
                {marcas.map(m => <option key={m.valor} value={m.valor}>{m.nome}</option>)}
              </select>
            </div>
            <div className="fg">
              <div className="fl">Modelo</div>
              <select className="fi" style={{fontSize:12}} value={selModelo} onChange={e => setSelModelo(e.target.value)} disabled={!selMarca}>
                <option value="">Selecionar...</option>
                {modelos.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
              </select>
            </div>
            <div className="fg">
              <div className="fl">Ano</div>
              <select className="fi" style={{fontSize:12}} value={selAno} onChange={e => setSelAno(e.target.value)} disabled={!selModelo}>
                <option value="">Selecionar...</option>
                {anos.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {fipeLoading && (
            <div style={{marginTop:10,fontSize:12,color:'var(--muted)'}}>Buscando preço FIPE...</div>
          )}
          {fipePreco && (
            <div style={{marginTop:12,background:'var(--greenb)',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:11,color:'var(--green)',fontWeight:700,letterSpacing:.5}}>VALOR FIPE · {fipePreco.referenceMonth}</div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:'var(--font-condensed)',color:'var(--green)'}}>{fipePreco.price}</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>{fipePreco.brand} {fipePreco.model} · {fipePreco.fipeCode}</div>
              </div>
              <button className="btn-g" style={{fontSize:11,padding:'5px 10px'}}
                onClick={() => {
                  const val = fipePreco.price.replace(/[^\d,]/g,'')
                  setForm(f => ({...f, vendaPrev: val}))
                  toast('Valor FIPE copiado para preço de venda!')
                }}>
                Usar como base →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Dados do veículo ── */}
      <div className="form-grid">
        <div className="fg"><div className="fl">Marca / Modelo</div><input className="fi" placeholder="Ex: Fiat Argo" {...f('modelo')} /></div>
        <div className="fg"><div className="fl">Versão</div><input className="fi" placeholder="Ex: 1.3 Drive Flex" {...f('versao')} /></div>
        <div className="fg"><div className="fl">Ano Fabricação</div><input className="fi" type="number" placeholder="2023" {...f('anoFab')} /></div>
        <div className="fg"><div className="fl">Ano Modelo</div><input className="fi" type="number" placeholder="2024" {...f('anoMod')} /></div>
        <div className="fg"><div className="fl">Placa</div>
          <input className="fi" placeholder="AAA0A00" value={placa || ''} onChange={e => setPlaca(e.target.value.toUpperCase())} />
        </div>
        <div className="fg"><div className="fl">Renavam</div><input className="fi" placeholder="00000000000" {...f('renavam')} /></div>
        <div className="fg"><div className="fl">Chassi</div><input className="fi" placeholder="9BWZZZ377VT..." {...f('chassi')} /></div>
        <div className="fg"><div className="fl">Kilometragem</div><input className="fi" type="number" placeholder="18.000" {...f('km')} /></div>
        <div className="fg"><div className="fl">Combustível</div>
          <select className="fi" {...f('combustivel')}><option>Flex</option><option>Gasolina</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option></select>
        </div>
        <div className="fg"><div className="fl">Câmbio</div>
          <select className="fi" {...f('cambio')}><option>Manual</option><option>Automático</option><option>CVT</option></select>
        </div>
        <div className="fg"><div className="fl">Cor</div><input className="fi" placeholder="Branco perolizado" {...f('cor')} /></div>
        <div className="fg"><div className="fl">Tipo</div>
          <select className="fi" value={form.tipoV} onChange={e => setForm(p=>({...p,tipoV:e.target.value}))}>
            <option>Hatch</option><option>Sedan</option><option>SUV</option><option>Pickup</option><option>Moto</option><option>Outro</option>
          </select>
        </div>
        <div className="fg"><div className="fl">Preço de Custo (R$)</div><input className="fi" placeholder="0,00" {...f('custoPrev')} /></div>
        <div className="fg"><div className="fl">Preço de Venda (R$)</div><input className="fi" placeholder="0,00" {...f('vendaPrev')} /></div>
        <div className="fg full"><div className="fl">Observações / Opcionais</div><textarea className="fi ta" placeholder="IPVA pago, vidros elétricos, rodas de liga..." {...f('obs')} /></div>
      </div>

      <div className="modal-actions">
        <button className="btn-g" onClick={() => { onClose(); reset() }}>Cancelar</button>
        <button className="btn-p" onClick={() => { onClose(); reset(); toast('Veículo adicionado ao estoque!') }}>Cadastrar</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL REGISTRAR RECEBIMENTO
══════════════════════════════════════════════ */
export function ModalAddReceber({ open, onClose }) {
  const toast = useToast()
  return (
    <Modal title="+ Registrar Recebimento" open={open} onClose={onClose}>
      <div className="form-grid">
        <div className="fg full"><div className="fl">Descrição</div><input className="fi" placeholder="Ex: Parcela 3/18 — Carlos Mendes / Etios" /></div>
        <div className="fg"><div className="fl">Valor (R$)</div><input className="fi" placeholder="0,00" /></div>
        <div className="fg"><div className="fl">Data de Recebimento</div><input className="fi" type="date" defaultValue="2026-03-19" /></div>
        <div className="fg"><div className="fl">Forma de Pagamento</div>
          <select className="fi"><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option><option>TED/DOC</option></select>
        </div>
        <div className="fg"><div className="fl">Número da Parcela</div><input className="fi" placeholder="Ex: 3/18" /></div>
        <div className="fg full"><div className="fl">Observações</div><textarea className="fi ta" placeholder="Anotações sobre este recebimento..." /></div>
      </div>
      <div className="modal-actions">
        <button className="btn-g" onClick={onClose}>Cancelar</button>
        <button className="btn-p" onClick={() => { onClose(); toast('Recebimento registrado!') }}>Confirmar</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL LANÇAR DESPESA
══════════════════════════════════════════════ */
export function ModalAddPagar({ open, onClose }) {
  const toast = useToast()
  return (
    <Modal title="+ Lançar Despesa" open={open} onClose={onClose}>
      <div className="form-grid">
        <div className="fg full"><div className="fl">Descrição</div><input className="fi" placeholder="Ex: Conta de energia, salário, aluguel..." /></div>
        <div className="fg"><div className="fl">Categoria</div>
          <select className="fi"><option>Salário</option><option>Aluguel</option><option>Energia</option><option>Água</option><option>Internet</option><option>Combustível</option><option>Manutenção</option><option>Imposto</option><option>Outro</option></select>
        </div>
        <div className="fg"><div className="fl">Valor (R$)</div><input className="fi" placeholder="0,00" /></div>
        <div className="fg"><div className="fl">Vencimento</div><input className="fi" type="date" /></div>
        <div className="fg"><div className="fl">Recorrente?</div>
          <select className="fi"><option>Não, pagamento único</option><option>Mensal</option><option>Anual</option></select>
        </div>
        <div className="fg"><div className="fl">Forma de Pagamento</div>
          <select className="fi"><option>Pix</option><option>Débito automático</option><option>Boleto</option><option>Dinheiro</option></select>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-g" onClick={onClose}>Cancelar</button>
        <button className="btn-p" onClick={() => { onClose(); toast('Despesa lançada!') }}>Lançar</button>
      </div>
    </Modal>
  )
}

/* ── Helpers ───────────────────────────── */
function SectionLbl({ children }) {
  return <div className="modal-section-lbl">{children}</div>
}

function Spinner() {
  return (
    <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
      width:14,height:14,borderRadius:'50%',
      border:'2px solid var(--muted2)',borderTopColor:'var(--muted)',
      animation:'spin .6s linear infinite',
    }}/>
  )
}

function StatusIcon({ ok }) {
  return (
    <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
      fontSize:14,color: ok ? 'var(--green)' : 'var(--danger)',
    }}>{ok ? '✓' : '✗'}</div>
  )
}

/* inject spinner keyframe once */
if (typeof document !== 'undefined' && !document.getElementById('spin-kf')) {
  const s = document.createElement('style')
  s.id = 'spin-kf'
  s.textContent = '@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }'
  document.head.appendChild(s)
}
