const VEICULOS = [
  { emoji:'🚗', modelo:'Fiat Argo 1.3',       info:'2023 · 18.000 km · Flex',   preco:'R$ 78.500',  placa:'BRA2A23', status:'Disponível',  bc:'b-g', dias:'5 dias' },
  { emoji:'🚙', modelo:'Toyota Corolla XEI',  info:'2020 · 62.000 km · Flex',   preco:'R$ 112.000', placa:'CEA3B45', status:'Reservado',   bc:'b-a', dias:'2 dias' },
  { emoji:'🚘', modelo:'Honda Civic EXL',     info:'2019 · 85.000 km · Flex',   preco:'R$ 89.000',  placa:'FOR4C67', status:'Disponível',  bc:'b-g', dias:'3 dias' },
  { emoji:'🛻', modelo:'Chevrolet S10 LTZ',   info:'2021 · 45.000 km · Diesel', preco:'R$ 165.000', placa:'SAL5D89', status:'Disponível',  bc:'b-g', dias:'1 dia' },
  { emoji:'🚗', modelo:'Volkswagen Gol 1.6',  info:'2021 · 38.000 km · Flex',   preco:'R$ 52.000',  placa:'REC6E01', status:'Vendido',     bc:'b-m', dias:'14/03' },
  { emoji:'🏍️', modelo:'Honda CB 300R',       info:'2022 · 12.000 km · Flex',   preco:'R$ 24.500',  placa:'MTC0001', status:'Disponível',  bc:'b-g', dias:'8 dias' },
]

export default function Veiculos({ onOpenModal }) {
  return (
    <div>
      <div className="search-row">
        <input className="fi" placeholder="🔍  Buscar por modelo, placa, ano..." />
        <select className="fi" style={{maxWidth:160}}>
          <option>Todos os status</option>
          <option>Disponível</option><option>Reservado</option><option>Vendido</option>
        </select>
        <select className="fi" style={{maxWidth:140}}>
          <option>Todos os tipos</option>
          <option>Carros</option><option>Motos</option><option>SUV</option><option>Pickup</option>
        </select>
        <button className="btn-p" onClick={() => onOpenModal('addVeiculo')}>+ Veículo</button>
      </div>

      <div className="vg">
        {VEICULOS.map((v, i) => (
          <div key={i} className="vc">
            <div className="vc-img">
              {v.emoji}
              <div className="placa">{v.placa}</div>
            </div>
            <div className="vc-body">
              <div className="vc-modelo">{v.modelo}</div>
              <div className="vc-info">{v.info}</div>
              <div className="vc-preco">{v.preco}</div>
              <div className="vc-foot">
                <span className={`badge ${v.bc}`}>{v.status}</span>
                <span style={{fontSize:11,color:'var(--muted)'}}>{v.dias}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="vc vc-add" onClick={() => onOpenModal('addVeiculo')}>
          <div className="vc-add-inner">
            <div className="vc-add-plus">+</div>
            <div style={{fontSize:13,fontWeight:600}}>Adicionar Veículo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
