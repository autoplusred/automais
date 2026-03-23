import { useState, useEffect, useCallback } from 'react'
import Modal from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { useApiSettings } from '../../context/ApiSettings'
import { fetchCep, fetchFipeMarcas, fetchFipeModelos, fetchFipeAnos, fetchFipePreco, fetchPlaca } from '../../services/api'
import { fetchWithAuth } from '../../services/apiBackend'
import { supabase } from '../../services/supabase'

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
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({
    nome: '',
    cpf: '',
    rg: '',
    cnh: '',
    data_nascimento: '',
    estado_civil: 'Solteiro(a)',
    telefone: '',
    telefone_fixo: '',
    email: '',
    numero: '',
    complemento: '',
    profissao: '',
    renda_mensal: '',
    observacoes: '',
  })

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
    setForm({
      nome: '',
      cpf: '',
      rg: '',
      cnh: '',
      data_nascimento: '',
      estado_civil: 'Solteiro(a)',
      telefone: '',
      telefone_fixo: '',
      email: '',
      numero: '',
      complemento: '',
      profissao: '',
      renda_mensal: '',
      observacoes: '',
    })
  }

  const parseMoney = (v) => {
    const clean = String(v || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Number(clean || 0)
  }

  const submit = async () => {
    if (!form.nome.trim()) {
      toast('Nome é obrigatório')
      return
    }
    try {
      setSaving(true)
      await fetchWithAuth('/clientes/', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          renda_mensal: parseMoney(form.renda_mensal),
          cep,
          logradouro: addr.street,
          bairro: addr.neighborhood,
          cidade: addr.city,
          estado: addr.state,
        }),
      })
      onClose()
      reset()
      toast('✅ Cliente cadastrado!')
    } catch (err) {
      toast(err.message || 'Erro ao cadastrar cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Cadastro de Cliente" open={open} onClose={() => { onClose(); reset() }} wide>

      <SectionLbl>Dados Pessoais</SectionLbl>
      <div className="form-grid">
        <div className="fg full"><div className="fl">Nome Completo</div><input className="fi" placeholder="Nome e sobrenome" value={form.nome} onChange={e => setForm(v => ({ ...v, nome: e.target.value }))} /></div>
        <div className="fg"><div className="fl">CPF</div><input className="fi" placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm(v => ({ ...v, cpf: e.target.value }))} /></div>
        <div className="fg"><div className="fl">RG</div><input className="fi" placeholder="0000000 SSP/CE" value={form.rg} onChange={e => setForm(v => ({ ...v, rg: e.target.value }))} /></div>
        <div className="fg"><div className="fl">CNH (se houver)</div><input className="fi" placeholder="Número da CNH" value={form.cnh} onChange={e => setForm(v => ({ ...v, cnh: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Data de Nascimento</div><input className="fi" type="date" value={form.data_nascimento} onChange={e => setForm(v => ({ ...v, data_nascimento: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Estado Civil</div>
          <select className="fi" value={form.estado_civil} onChange={e => setForm(v => ({ ...v, estado_civil: e.target.value }))}><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option></select>
        </div>
      </div>

      <SectionLbl>Contato</SectionLbl>
      <div className="form-grid">
        <div className="fg"><div className="fl">WhatsApp / Celular</div><input className="fi" placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm(v => ({ ...v, telefone: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Telefone Fixo</div><input className="fi" placeholder="(00) 0000-0000 (opcional)" value={form.telefone_fixo} onChange={e => setForm(v => ({ ...v, telefone_fixo: e.target.value }))} /></div>
        <div className="fg full"><div className="fl">E-mail</div><input className="fi" placeholder="email@exemplo.com" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} /></div>
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
        <div className="fg"><div className="fl">Número</div><input className="fi" placeholder="Nº" value={form.numero} onChange={e => setForm(v => ({ ...v, numero: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Complemento</div><input className="fi" placeholder="Apto, casa, bloco..." value={form.complemento} onChange={e => setForm(v => ({ ...v, complemento: e.target.value }))} /></div>
      </div>

      <SectionLbl>Renda / Financeiro</SectionLbl>
      <div className="form-grid">
        <div className="fg"><div className="fl">Profissão</div><input className="fi" placeholder="Ex: Autônomo, CLT..." value={form.profissao} onChange={e => setForm(v => ({ ...v, profissao: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Renda Mensal (R$)</div><input className="fi" placeholder="0.000,00" value={form.renda_mensal} onChange={e => setForm(v => ({ ...v, renda_mensal: e.target.value }))} /></div>
        <div className="fg full"><div className="fl">Referências / Obs.</div><textarea className="fi ta" placeholder="Nome de referência, indicação por..." value={form.observacoes} onChange={e => setForm(v => ({ ...v, observacoes: e.target.value }))} /></div>
      </div>

      <div className="modal-actions">
        <button className="btn-g" onClick={() => { onClose(); reset() }}>Cancelar</button>
        <button className="btn-p" onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL ADD VEÍCULO — placa lookup + FIPE
══════════════════════════════════════════════ */
export function ModalAddVeiculo({ open, onClose, onSuccess }) {
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
    marca:'', modelo:'', versao:'', anoFab:'', anoMod:'', renavam:'', chassi:'',
    km:'', combustivel:'Flex', cambio:'Manual', cor:'', tipoV:'Hatch',
    custoPrev:'', vendaPrev:'', obs:'',
  })
  const [fotos, setFotos]         = useState([])
  const [saving, setSaving]       = useState(false)

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
      .then(d => {
        setFipePreco(d)
        setForm(v => ({
          ...v,
          marca: d?.brand || v.marca,
          modelo: d?.model || v.modelo,
          anoFab: d?.modelYear ? String(d.modelYear) : v.anoFab,
          anoMod: d?.modelYear ? String(d.modelYear) : v.anoMod,
          custoPrev: d?.price ? String(d.price).replace('R$','').trim() : v.custoPrev,
        }))
        setFipeLoad(false)
      })
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
        marca:      d.marca      || f.marca,
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
    setForm({marca:'',modelo:'',versao:'',anoFab:'',anoMod:'',renavam:'',chassi:'',km:'',combustivel:'Flex',cambio:'Manual',cor:'',tipoV:'Hatch',custoPrev:'',vendaPrev:'',obs:''})
    setSelMarca(''); setSelModelo(''); setSelAno(''); setFipePreco(null)
    setFotos([])
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(p=>({...p,[key]:e.target.value})) })
  const parseMoney = (v) => {
    if (v === null || v === undefined) return 0
    const clean = String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Number(clean || 0)
  }

  const MAX_FOTOS = 10
  const MAX_FOTO_MB = 8
  const MAX_TOTAL_MB = 30

  const validExt = (name = '') => {
    const ext = String(name).toLowerCase().split('.').pop()
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') return ext
    return null
  }

  const validateFotos = () => {
    if (!fotos.length) return
    if (fotos.length > MAX_FOTOS) throw new Error(`Selecione no máximo ${MAX_FOTOS} fotos por veículo`)
    const totalBytes = fotos.reduce((acc, file) => acc + (file?.size || 0), 0)
    for (const file of fotos) {
      if (!file?.type?.startsWith('image/')) throw new Error(`Arquivo inválido: ${file?.name || 'sem nome'}`)
      const ext = validExt(file?.name)
      if (!ext) throw new Error(`Formato não suportado: ${file?.name || 'arquivo'}`)
      if ((file.size || 0) > MAX_FOTO_MB * 1024 * 1024) throw new Error(`A foto ${file.name} excede ${MAX_FOTO_MB}MB`)
    }
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) throw new Error(`Total de fotos excede ${MAX_TOTAL_MB}MB`)
  }

  const uploadFotos = async () => {
    if (!fotos.length) return []
    validateFotos()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Sessão inválida para upload de fotos')
    const bucket = import.meta.env.VITE_SUPABASE_VEHICLE_BUCKET || 'veiculos'
    const empresaId = session.user?.user_metadata?.empresa_id || session.user?.app_metadata?.empresa_id || 'sem_empresa'
    const uploaded = []
    const uploadedPaths = []
    const dataPath = new Date().toISOString().slice(0, 10)
    try {
      for (const file of fotos) {
        const ext = validExt(file.name) || 'jpg'
        const filePath = `${empresaId}/${session.user.id}/${dataPath}/${Date.now()}-${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false })
        if (error) throw new Error(`Falha no upload de ${file.name}: ${error.message}`)
        uploadedPaths.push(filePath)
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
        if (data?.publicUrl) uploaded.push(data.publicUrl)
      }
    } catch (err) {
      if (uploadedPaths.length) await supabase.storage.from(bucket).remove(uploadedPaths)
      throw err
    }
    return uploaded
  }

  const handleCreate = async () => {
    try {
      setSaving(true)
      let marcaNome = form.marca
      let modeloNome = form.modelo
      if (fipeEnabled && selMarca && selModelo) {
        marcaNome = marcas.find(m => String(m.valor) === String(selMarca))?.nome || marcaNome
        modeloNome = modelos.find(m => String(m.code) === String(selModelo))?.name || modeloNome
      }
      if (!marcaNome || !modeloNome) {
        toast('Preencha marca e modelo do veículo')
        return
      }
      const fotosUrls = await uploadFotos()
      const obsFotos = fotosUrls.length ? `${form.obs ? `${form.obs}\n\n` : ''}Fotos:\n${fotosUrls.join('\n')}` : form.obs
      await fetchWithAuth('/veiculos/', {
        method: 'POST',
        body: JSON.stringify({
          placa,
          renavam: form.renavam,
          chassi: form.chassi,
          fipe_codigo: fipePreco?.fipeCode,
          fipe_marca: fipePreco?.brand,
          fipe_marca_cod: selMarca || null,
          fipe_modelo: fipePreco?.model,
          fipe_modelo_cod: selModelo || null,
          fipe_ano_cod: selAno || null,
          fipe_preco: parseMoney((fipePreco?.price || '').replace('R$', '').trim()),
          fipe_referencia: fipePreco?.referenceMonth || null,
          marca: marcaNome,
          modelo: modeloNome,
          versao: form.versao,
          tipo: form.tipoV,
          ano_fabricacao: form.anoFab || null,
          ano_modelo: form.anoMod || null,
          km: form.km || 0,
          cor: form.cor,
          combustivel: form.combustivel,
          cambio: form.cambio,
          preco_custo: parseMoney(form.custoPrev),
          preco_venda: parseMoney(form.vendaPrev),
          observacoes: obsFotos,
        }),
      })
      onClose()
      reset()
      if (onSuccess) onSuccess()
      toast('Veículo cadastrado com sucesso!')
    } catch (err) {
      toast(err.message || 'Erro ao cadastrar veículo')
    } finally {
      setSaving(false)
    }
  }

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
              onClick={() => {
                setTipo(val)
                setSelMarca('')
                setSelModelo('')
                setSelAno('')
                setFipePreco(null)
                setForm(v => ({ ...v, tipoV: val === 'motos' ? 'Moto' : val === 'caminhoes' ? 'Caminhão' : 'Hatch' }))
              }}
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
        <div className="fg"><div className="fl">Marca</div><input className="fi" placeholder="Ex: Fiat" {...f('marca')} /></div>
        <div className="fg"><div className="fl">Modelo</div><input className="fi" placeholder="Ex: Argo" {...f('modelo')} /></div>
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
        <div className="fg full">
          <div className="fl">Fotos do Veículo</div>
          <input
            className="fi"
            type="file"
            accept="image/*"
            multiple
            onChange={e => setFotos(Array.from(e.target.files || []))}
          />
          {!!fotos.length && <div style={{fontSize:11,color:'var(--muted)',marginTop:6}}>{fotos.length} arquivo(s) selecionado(s)</div>}
        </div>
        <div className="fg full"><div className="fl">Observações / Opcionais</div><textarea className="fi ta" placeholder="IPVA pago, vidros elétricos, rodas de liga..." {...f('obs')} /></div>
      </div>

      <div className="modal-actions">
        <button className="btn-g" onClick={() => { onClose(); reset() }}>Cancelar</button>
        <button className="btn-p" onClick={handleCreate} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL REGISTRAR RECEBIMENTO
══════════════════════════════════════════════ */
export function ModalAddReceber({ open, onClose, onSuccess }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parcelas, setParcelas] = useState([])
  const [parcelaId, setParcelaId] = useState('')
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10))
  const [forma, setForma] = useState('pix')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!open) return
    const carregar = async () => {
      try {
        setLoading(true)
        const data = await fetchWithAuth('/financeiro/parcelas?limite=100')
        const pendentes = (data.parcelas || []).filter((p) => p.status === 'pendente' || p.status === 'vencido')
        setParcelas(pendentes)
        setParcelaId(pendentes[0]?.id || '')
      } catch {
        setParcelas([])
        setParcelaId('')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [open])

  const confirm = async () => {
    if (!parcelaId) {
      toast('Selecione uma parcela')
      return
    }
    try {
      setSaving(true)
      await fetchWithAuth(`/financeiro/parcelas/${parcelaId}/receber`, {
        method: 'POST',
        body: JSON.stringify({
          data_pagamento: dataPagamento,
          forma_pagamento: forma,
          observacoes,
        }),
      })
      if (onSuccess) onSuccess()
      onClose()
      toast('Recebimento registrado!')
    } catch (err) {
      toast(err.message || 'Erro ao registrar recebimento')
    } finally {
      setSaving(false)
    }
  }

  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Modal title="+ Registrar Recebimento" open={open} onClose={onClose}>
      <div className="form-grid">
        <div className="fg full">
          <div className="fl">Parcela</div>
          <select className="fi" value={parcelaId} onChange={(e) => setParcelaId(e.target.value)} disabled={loading || !parcelas.length}>
            {!parcelas.length && <option value="">{loading ? 'Carregando parcelas...' : 'Nenhuma parcela pendente'}</option>}
            {parcelas.map((p) => (
              <option key={p.id} value={p.id}>
                {`${p.cliente_nome || 'Cliente'} · ${p.veiculo || 'Veículo'} · ${money(p.valor)} · ${p.numero}/${p.total}`}
              </option>
            ))}
          </select>
        </div>
        <div className="fg"><div className="fl">Data de Recebimento</div><input className="fi" type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} /></div>
        <div className="fg"><div className="fl">Forma de Pagamento</div>
          <select className="fi" value={forma} onChange={(e) => setForma(e.target.value)}>
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="boleto">Boleto</option>
            <option value="ted">TED/DOC</option>
          </select>
        </div>
        <div className="fg full"><div className="fl">Observações</div><textarea className="fi ta" placeholder="Anotações sobre este recebimento..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
      </div>
      <div className="modal-actions">
        <button className="btn-g" onClick={onClose}>Cancelar</button>
        <button className="btn-p" onClick={confirm} disabled={saving || !parcelas.length}>{saving ? 'Salvando...' : 'Confirmar'}</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MODAL LANÇAR DESPESA
══════════════════════════════════════════════ */
export function ModalAddPagar({ open, onClose, onSuccess }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    descricao: '',
    categoria: 'outro',
    valor: '',
    data_vencimento: '',
    recorrente: 'nao',
    forma_pagamento: 'pix',
    observacoes: '',
  })

  const parseMoney = (v) => {
    const clean = String(v || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Number(clean || 0)
  }

  const submit = async () => {
    if (!form.descricao.trim()) {
      toast('Descrição é obrigatória')
      return
    }
    if (!form.data_vencimento) {
      toast('Informe o vencimento')
      return
    }
    try {
      setSaving(true)
      await fetchWithAuth('/financeiro/contas', {
        method: 'POST',
        body: JSON.stringify({
          descricao: form.descricao,
          categoria: form.categoria,
          valor: parseMoney(form.valor),
          data_vencimento: form.data_vencimento,
          recorrente: form.recorrente,
          forma_pagamento: form.forma_pagamento,
          observacoes: form.observacoes,
        }),
      })
      if (onSuccess) onSuccess()
      onClose()
      setForm({
        descricao: '',
        categoria: 'outro',
        valor: '',
        data_vencimento: '',
        recorrente: 'nao',
        forma_pagamento: 'pix',
        observacoes: '',
      })
      toast('Despesa lançada!')
    } catch (err) {
      toast(err.message || 'Erro ao lançar despesa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="+ Lançar Despesa" open={open} onClose={onClose}>
      <div className="form-grid">
        <div className="fg full"><div className="fl">Descrição</div><input className="fi" placeholder="Ex: Conta de energia, salário, aluguel..." value={form.descricao} onChange={(e) => setForm(v => ({ ...v, descricao: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Categoria</div>
          <select className="fi" value={form.categoria} onChange={(e) => setForm(v => ({ ...v, categoria: e.target.value }))}>
            <option value="salario">Salário</option>
            <option value="aluguel">Aluguel</option>
            <option value="energia">Energia</option>
            <option value="agua">Água</option>
            <option value="internet">Internet</option>
            <option value="combustivel">Combustível</option>
            <option value="manutencao">Manutenção</option>
            <option value="imposto">Imposto</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="fg"><div className="fl">Valor (R$)</div><input className="fi" placeholder="0,00" value={form.valor} onChange={(e) => setForm(v => ({ ...v, valor: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Vencimento</div><input className="fi" type="date" value={form.data_vencimento} onChange={(e) => setForm(v => ({ ...v, data_vencimento: e.target.value }))} /></div>
        <div className="fg"><div className="fl">Recorrente?</div>
          <select className="fi" value={form.recorrente} onChange={(e) => setForm(v => ({ ...v, recorrente: e.target.value }))}>
            <option value="nao">Não, pagamento único</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        <div className="fg"><div className="fl">Forma de Pagamento</div>
          <select className="fi" value={form.forma_pagamento} onChange={(e) => setForm(v => ({ ...v, forma_pagamento: e.target.value }))}>
            <option value="pix">Pix</option>
            <option value="debito_automatico">Débito automático</option>
            <option value="boleto">Boleto</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>
        <div className="fg full"><div className="fl">Observações</div><textarea className="fi ta" placeholder="Detalhes adicionais..." value={form.observacoes} onChange={(e) => setForm(v => ({ ...v, observacoes: e.target.value }))} /></div>
      </div>
      <div className="modal-actions">
        <button className="btn-g" onClick={onClose}>Cancelar</button>
        <button className="btn-p" onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Lançar'}</button>
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
