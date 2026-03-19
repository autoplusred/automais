import { useToast } from '../ui/Toast'
import { useApiSettings } from '../../context/ApiSettings'

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

  return (
    <div>
      <div style={{background:'var(--glass)',border:'1px solid var(--border)',borderRadius:13,padding:22,marginBottom:14}}>
        <div className="sec-title" style={{marginBottom:14}}>Minha Empresa</div>
        <div className="form-grid">
          <div className="fg"><div className="fl">Nome da Loja</div><input className="fi" defaultValue="JP Automóveis" /></div>
          <div className="fg"><div className="fl">CNPJ</div><input className="fi" defaultValue="12.345.678/0001-90" /></div>
          <div className="fg"><div className="fl">WhatsApp Comercial</div><input className="fi" defaultValue="(85) 99999-0000" /></div>
          <div className="fg"><div className="fl">E-mail</div><input className="fi" defaultValue="contato@jpautomóveis.com.br" /></div>
          <div className="fg full"><div className="fl">Endereço</div><input className="fi" defaultValue="Av. Bezerra de Menezes, 1500 — Fortaleza — CE" /></div>
        </div>
        <button className="btn-p" onClick={() => toast('Dados salvos!')}>Salvar</button>
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

              <Toggle enabled={!!settings[api.key]?.enabled} onToggle={() => toggle(api.key)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Integrações de serviços ── */}
      <div style={{background:'var(--glass)',border:'1px solid var(--border)',borderRadius:13,padding:22}}>
        <div className="sec-title" style={{marginBottom:14}}>Integrações de Serviços</div>
        {[
          {name:'WhatsApp Business',    desc:'Leads automáticos + lembretes de parcela', active:true},
          {name:'OLX / iCarros',        desc:'Sincronizar estoque automaticamente'},
          {name:'Instagram / Facebook', desc:'Publicar veículos direto no feed'},
        ].map((item,i,arr) => (
          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
            <div>
              <div style={{fontSize:13.5,fontWeight:500}}>{item.name}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{item.desc}</div>
            </div>
            {item.active
              ? <span className="badge b-g">Ativo</span>
              : <button className="btn-g" style={{fontSize:12,padding:'6px 13px'}} onClick={() => toast(`Em breve: ${item.name}`)}>Conectar</button>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
