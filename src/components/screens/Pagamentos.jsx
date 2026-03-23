import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../ui/Toast'
import { fetchWithAuth } from '../../services/apiBackend'

const INTEGRACOES = [
  { logo:'💚', name:'Mercado Pago', tokenKey:'mercadopago_token', desc:'Pix, cartão, boleto, link de pagamento' },
  { logo:'🔵', name:'PagSeguro', tokenKey:'pagseguro_token', desc:'Cartão, Pix, débito, presencial' },
  { logo:'🟠', name:'Asaas', tokenKey:'asaas_token', desc:'Pix, boleto, cartão, recorrente, NF-e' },
  { logo:'🏦', name:'BV Financeira', tokenKey:'bv_token', desc:'Crédito veicular, CDC, leasing' },
]

export default function Pagamentos() {
  const toast = useToast()
  const [cfg, setCfg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true)
        const data = await fetchWithAuth('/config/')
        setCfg(data)
      } catch {
        setCfg(null)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const gateways = useMemo(
    () => INTEGRACOES.map((item) => ({
      ...item,
      conectado: !!cfg?.[item.tokenKey],
    })),
    [cfg],
  )

  const apis = useMemo(() => ([
    { logo:'📊', name:'Tabela FIPE', enabled: !!cfg?.api_fipe },
    { logo:'📮', name:'Consulta CEP', enabled: !!cfg?.api_cep },
    { logo:'🔍', name:'Consulta Placa', enabled: !!cfg?.api_placa },
  ]), [cfg])

  const conectadas = gateways.filter((g) => g.conectado).length

  return (
    <div>
      <p style={{fontSize:13.5,color:'var(--muted)',marginBottom:18,lineHeight:1.6}}>
        Status real das integrações de pagamento da sua empresa. Para conectar ou alterar tokens, use a tela de Configurações.
      </p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14}}>
        <span className="badge b-g">{`${conectadas}/${gateways.length} gateways conectados`}</span>
        <span className="badge b-a">{`${apis.filter((a) => a.enabled).length}/${apis.length} APIs habilitadas`}</span>
      </div>

      <div className="sec-title">Gateways Ativos</div>
      <div className="pg-grid">
        {loading && <div style={{fontSize:13,color:'var(--muted)',padding:10}}>Carregando integrações...</div>}
        {!loading && gateways.map((p) => (
          <div key={p.name} className={`pg-card ${p.conectado ? 'conn' : ''}`}>
            <div className="pg-logo">{p.logo}</div>
            <div className="pg-name">{p.name}</div>
            <div className="pg-desc">{p.desc}</div>
            {p.conectado
              ? <button className="btn-g pg-btn" onClick={() => toast(`${p.name} já está configurado`)}>Conectado</button>
              : <button className="btn-p pg-btn" onClick={() => toast(`Configure o token de ${p.name} em Configurações`)}>
                  Pendente
                </button>
            }
          </div>
        ))}
      </div>

      <div className="sec-title" style={{marginTop:18}}>APIs Operacionais</div>
      <div className="pg-grid">
        {!loading && apis.map((api) => (
          <div key={api.name} className={`pg-card ${api.enabled ? 'conn' : ''}`}>
            <div className="pg-logo">{api.logo}</div>
            <div className="pg-name">{api.name}</div>
            <div className="pg-desc">{api.enabled ? 'Habilitada para uso no sistema' : 'Desabilitada na configuração atual'}</div>
            <button className={`${api.enabled ? 'btn-g' : 'btn-p'} pg-btn`} onClick={() => toast('Gerencie no painel de Configurações')}>
              {api.enabled ? 'Ativa' : 'Inativa'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
