import { useToast } from '../ui/Toast'

const GW_BR = [
  { logo:'💚', name:'Mercado Pago',    desc:'Pix, cartão, boleto, link de pagamento', conn:true },
  { logo:'🔵', name:'PagSeguro',       desc:'Cartão, Pix, débito, presencial' },
  { logo:'🟠', name:'Asaas',           desc:'Pix, boleto, cartão, recorrente, NF-e' },
  { logo:'🔵', name:'Cielo',           desc:'Maquininha + online, todas as bandeiras' },
  { logo:'🟢', name:'Rede (Itaú)',     desc:'Cartão crédito/débito, Pix, maquininha' },
  { logo:'🟡', name:'GetNet (Santander)', desc:'Cartão, Pix, online e presencial' },
  { logo:'🟣', name:'Vindi',           desc:'Recorrente, boleto, Pix, BolePix, NF-e' },
  { logo:'🔷', name:'Transfeera',      desc:'Pix + boleto combinados, B2B' },
  { logo:'🟤', name:'PayU Brasil',     desc:'Pix, cartão, boleto, Google Pay' },
]

const GW_FIN = [
  { logo:'🏦', name:'BV Financeira',        desc:'Crédito veicular, CDC, leasing', conn:true },
  { logo:'🏦', name:'Santander Auto',       desc:'Financiamento com simulação online' },
  { logo:'🏦', name:'Itaú Crédito Auto',    desc:'CDC, leasing, refinanciamento' },
  { logo:'🏦', name:'Bradesco Financ.',     desc:'Financiamento veicular via API' },
]

const GW_INTL = [
  { logo:'🟣', name:'Stripe',   desc:'Pix, cartões BRL, internacional' },
  { logo:'🔵', name:'PayPal',   desc:'Carteira digital, cartão, internacional' },
  { logo:'⚫', name:'Adyen',    desc:'250+ métodos, enterprise, Pix' },
]

const GW_WALLET = [
  { logo:'🍎', name:'Apple Pay',   desc:'Via Stripe ou Adyen' },
  { logo:'🔍', name:'Google Pay',  desc:'Via Stripe, PayU ou Adyen' },
  { logo:'⚡', name:'Pix Direto',  desc:'Chave Pix da sua conta bancária' },
]

function PgSection({ title, items, onConnect }) {
  return (
    <>
      <div className="sec-title">{title}</div>
      <div className="pg-grid">
        {items.map((p, i) => (
          <div key={i} className={`pg-card ${p.conn ? 'conn' : ''}`}>
            <div className="pg-logo">{p.logo}</div>
            <div className="pg-name">{p.name}</div>
            <div className="pg-desc">{p.desc}</div>
            {p.conn
              ? <button className="btn-g pg-btn" onClick={() => onConnect(`Configurações do ${p.name}`)}>Configurar</button>
              : <button className="btn-p pg-btn" onClick={() => onConnect(`Conectando ${p.name}...`)}>Conectar</button>
            }
          </div>
        ))}
      </div>
    </>
  )
}

export default function Pagamentos() {
  const toast = useToast()
  return (
    <div>
      <p style={{fontSize:13.5,color:'var(--muted)',marginBottom:18,lineHeight:1.6}}>
        Conecte as plataformas de pagamento que você já usa. Cada uma estará disponível como opção na hora de registrar uma venda.
      </p>
      <PgSection title="Gateways Brasileiros"           items={GW_BR}     onConnect={toast} />
      <PgSection title="Financeiras / Crédito Veicular" items={GW_FIN}    onConnect={toast} />
      <PgSection title="Internacionais com Suporte ao Brasil" items={GW_INTL} onConnect={toast} />
      <PgSection title="Carteiras Digitais"             items={GW_WALLET} onConnect={toast} />
    </div>
  )
}
