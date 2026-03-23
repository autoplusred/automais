import { useEffect, useState } from 'react'
import { useToast } from '../ui/Toast'
import { useApiSettings } from '../../context/ApiSettings'
import { fetchWithAuth } from '../../services/apiBackend'

function Toggle({ enabled, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width:40,height:22,borderRadius:11,
      background: enabled ? 'var(--green)' : 'var(--muted2)',
      cursor:'pointer',position:'relative',
      transition:'background .2s',flexShrink:0,
    }}>
      <div style={{
        position:'absolute',top:3,
        left: enabled ? 21 : 3,
        width:16,height:16,borderRadius:'50%',
        background:'#fff',transition:'left .2s',
      }} />
    </div>
  )
}

const APIS = [
  {
    key:'cep', icon:'📮', title:'CEP Automático', provider:'BrasilAPI',
    desc:'Preenche rua, bairro, cidade e estado automaticamente no cadastro do cliente ao digitar o CEP.',
    free:true, link:'https://brasilapi.com.br',
  },
  {
    key:'fipe', icon:'📊', title:'Tabela FIPE', provider:'BrasilAPI + Parallelum',
    desc:'No cadastro de veículo, permite selecionar marca/modelo/ano e buscar o valor FIPE de referência automaticamente.',
    free:true, link:'https://brasilapi.com.br',
  },
  {
    key:'placa', icon:'🔍', title:'Consulta por Placa', provider:'fipeapi.com.br',
    desc:'Digita a placa e preenche tudo: marca, modelo, ano, chassi, cor, combustível e valor FIPE. Cadastre-se em fipeapi.com.br para obter o token gratuito.',
    free:false, tokenKey:'placa_token', link:'https://fipeapi.com.br',
  },
]

export default function Config() {
  const toast = useToast()
  const { settings, toggle, getToken, setToken } = useApiSettings()
  const [empresaMeta, setEmpresaMeta] = useState({
    id: '',
    plano: 'basico',
    ativo: true,
    criadoEm: '',
    responsavel: '',
    responsavelEmail: '',
  })
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
  })
  const [salvando, setSalvando] = useState(false)
  const toggleApi = async (apiKey) => {
    const ativo = !settings[apiKey]?.enabled
    toggle(apiKey)
    try {
      await fetchWithAuth('/config/api-toggle', {
        method: 'PUT',
        body: JSON.stringify({ api: apiKey, ativo }),
      })
    } catch {
    }
  }

  useEffect(() => {
    const carregar = async () => {
      try {
        const [cfg, me] = await Promise.all([
          fetchWithAuth('/config/'),
          fetchWithAuth('/auth/me'),
        ])
        setEmpresa({
          nome: cfg.empresa_nome || '',
          cnpj: cfg.cnpj || '',
          telefone: cfg.telefone || '',
          email: cfg.email || '',
          cep: cfg.cep || '',
          logradouro: cfg.logradouro || '',
          numero: cfg.numero || '',
          bairro: cfg.bairro || '',
          cidade: cfg.cidade || '',
          estado: cfg.estado || '',
        })
        setEmpresaMeta({
          id: cfg.empresa_id || me.empresa_id || '',
          plano: cfg.plano || 'basico',
          ativo: cfg.ativo !== false,
          criadoEm: cfg.criado_em || '',
          responsavel: me.nome || '',
          responsavelEmail: me.email || '',
        })
      } catch {
      }
    }
    carregar()
  }, [])

  const saveEmpresa = async () => {
    try {
      setSalvando(true)
      await fetchWithAuth('/config/', {
        method: 'PUT',
        body: JSON.stringify(empresa),
      })
      toast('Dados da empresa salvos!')
    } catch (err) {
      toast(err.message || 'Erro ao salvar dados')
    } finally {
      setSalvando(false)
    }
  }

  const cadastroCompleto = Boolean(
    empresa.nome && empresa.cnpj && empresa.telefone && empresa.email && empresa.cidade && empresa.estado,
  )
  const dataCriacao = empresaMeta.criadoEm ? new Date(empresaMeta.criadoEm).toLocaleDateString('pt-BR') : '-'

  return (
    <div>
      <div style={{background:'var(--glass)',border:'1px solid var(--border)',borderRadius:13,padding:22,marginBottom:14}}>
        <div className="sec-title" style={{marginBottom:8}}>Painel de Cadastro da Empresa</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:12}}>
          <span className={`badge ${empresaMeta.ativo ? 'b-g' : 'b-m'}`}>{empresaMeta.ativo ? 'Empresa ativa' : 'Empresa inativa'}</span>
          <span className="badge b-a">{`Plano ${String(empresaMeta.plano || 'basico').toUpperCase()}`}</span>
          <span className={`badge ${cadastroCompleto ? 'b-g' : 'b-m'}`}>{cadastroCompleto ? 'Cadastro completo' : 'Cadastro incompleto'}</span>
        </div>
        <div className="form-grid">
          <div className="fg"><div className="fl">ID da Empresa</div><input className="fi" value={empresaMeta.id} readOnly /></div>
          <div className="fg"><div className="fl">Responsável</div><input className="fi" value={empresaMeta.responsavel} readOnly /></div>
          <div className="fg"><div className="fl">E-mail do Responsável</div><input className="fi" value={empresaMeta.responsavelEmail} readOnly /></div>
          <div className="fg"><div className="fl">Criada em</div><input className="fi" value={dataCriacao} readOnly /></div>
        </div>
      </div>

      <div style={{background:'var(--glass)',border:'1px solid var(--border)',borderRadius:13,padding:22,marginBottom:14}}>
        <div className="sec-title" style={{marginBottom:14}}>Minha Empresa</div>
        <div className="form-grid">
          <div className="fg"><div className="fl">Nome da Loja</div><input className="fi" value={empresa.nome} onChange={e => setEmpresa(v => ({ ...v, nome: e.target.value }))} /></div>
          <div className="fg"><div className="fl">CNPJ</div><input className="fi" value={empresa.cnpj} onChange={e => setEmpresa(v => ({ ...v, cnpj: e.target.value }))} /></div>
          <div className="fg"><div className="fl">WhatsApp Comercial</div><input className="fi" value={empresa.telefone} onChange={e => setEmpresa(v => ({ ...v, telefone: e.target.value }))} /></div>
          <div className="fg"><div className="fl">E-mail</div><input className="fi" value={empresa.email} onChange={e => setEmpresa(v => ({ ...v, email: e.target.value }))} /></div>
          <div className="fg"><div className="fl">CEP</div><input className="fi" value={empresa.cep} onChange={e => setEmpresa(v => ({ ...v, cep: e.target.value }))} /></div>
          <div className="fg"><div className="fl">Número</div><input className="fi" value={empresa.numero} onChange={e => setEmpresa(v => ({ ...v, numero: e.target.value }))} /></div>
          <div className="fg"><div className="fl">Bairro</div><input className="fi" value={empresa.bairro} onChange={e => setEmpresa(v => ({ ...v, bairro: e.target.value }))} /></div>
          <div className="fg"><div className="fl">Cidade</div><input className="fi" value={empresa.cidade} onChange={e => setEmpresa(v => ({ ...v, cidade: e.target.value }))} /></div>
          <div className="fg"><div className="fl">UF</div><input className="fi" maxLength={2} value={empresa.estado} onChange={e => setEmpresa(v => ({ ...v, estado: e.target.value.toUpperCase() }))} /></div>
          <div className="fg full"><div className="fl">Logradouro</div><input className="fi" value={empresa.logradouro} onChange={e => setEmpresa(v => ({ ...v, logradouro: e.target.value }))} /></div>
        </div>
        <button className="btn-p" onClick={saveEmpresa} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
      </div>

      {/* ── APIs Externas ── */}
      <div style={{background:'var(--glass)',border:'1px solid var(--border)',borderRadius:13,padding:22,marginBottom:14}}>
        <div className="sec-title" style={{marginBottom:4}}>APIs Externas</div>
        <p style={{fontSize:12,color:'var(--muted)',marginBottom:18,lineHeight:1.6}}>
          Ligue ou desligue cada integração a qualquer momento. As gratuitas funcionam imediatamente — as que precisam de token têm link de cadastro.
        </p>

        {APIS.map((api, i) => (
          <div key={api.key} style={{
            padding:'16px 0',
            borderBottom: i < APIS.length-1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
              <div style={{
                width:38,height:38,borderRadius:10,
                background:'var(--bg3)',border:'1px solid var(--border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:16,flexShrink:0,
              }}>{api.icon}</div>

              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                  <span style={{fontSize:14,fontWeight:600}}>{api.title}</span>
                  <span style={{
                    fontSize:9.5,fontWeight:700,letterSpacing:.8,
                    padding:'2px 7px',borderRadius:8,
                    background: api.free ? 'var(--greenb)' : 'var(--amberb)',
                    color: api.free ? 'var(--green)' : 'var(--amber)',
                  }}>{api.free ? 'GRÁTIS' : 'FREEMIUM'}</span>
                  <a href={api.link} target="_blank" rel="noreferrer"
                    style={{fontSize:11,color:'var(--muted)',textDecoration:'none',marginLeft:'auto'}}>
                    {api.provider} ↗
                  </a>
                </div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>
                  {api.desc}
                </div>

                {api.tokenKey && settings[api.key]?.enabled && (
                  <div style={{display:'flex',gap:8,marginTop:10,alignItems:'center'}}>
                    <input
                      className="fi"
                      type="password"
                      placeholder="Cole seu token aqui..."
                      defaultValue={getToken(api.tokenKey)}
                      onBlur={e => { setToken(api.tokenKey, e.target.value); if(e.target.value) toast('Token salvo!') }}
                      style={{flex:1,fontSize:12,padding:'7px 11px'}}
                    />
                    <a href={api.link} target="_blank" rel="noreferrer"
                      style={{fontSize:12,color:'var(--blue)',whiteSpace:'nowrap',textDecoration:'none'}}>
                      Cadastrar grátis →
                    </a>
                  </div>
                )}
              </div>

              <Toggle enabled={!!settings[api.key]?.enabled} onToggle={() => toggleApi(api.key)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
