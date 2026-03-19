const CLIENTES = [
  { initials:'RO', name:'Rodrigo Mendes',      meta:'CPF 432.xxx.xxx-xx · (85) 99999-1234',  val:'R$ 112K', lbl:'última compra',    valColor:'' },
  { initials:'BE', name:'Beatriz Santos',       meta:'CPF 321.xxx.xxx-xx · (85) 98888-4567',  val:'R$ 89K',  lbl:'1 veículo',         valColor:'' },
  { initials:'CA', name:'Carlos Mendes',        meta:'CPF 210.xxx.xxx-xx · (88) 97777-8901',  val:'R$ 1,8K', lbl:'em atraso',         valColor:'var(--danger)', alert: 'parcela vencida' },
  { initials:'PE', name:'Pedro Alves',          meta:'CPF 109.xxx.xxx-xx · (88) 96666-2345',  val:'R$ 2,2K', lbl:'vence 22/03',       valColor:'var(--amber)' },
  { initials:'FE', name:'Fernanda Lima',        meta:'CPF 098.xxx.xxx-xx · (85) 95555-6789',  val:'R$ 78,5K',lbl:'pago em dia',       valColor:'' },
]

export default function Clientes({ onOpenModal }) {
  return (
    <div>
      <div className="search-row">
        <input className="fi" placeholder="🔍  Buscar por nome, CPF, telefone..." />
        <button className="btn-p" onClick={() => onOpenModal('novoCliente')}>+ Novo Cliente</button>
      </div>
      <div className="tbl-wrap">
        {CLIENTES.map((c, i) => (
          <div key={i} className="cli-row">
            <div className="cli-av">{c.initials}</div>
            <div className="cli-body">
              <div className="cli-name">{c.name}</div>
              <div className="cli-meta">
                {c.meta}
                {c.alert && <span style={{color:'var(--danger)',fontWeight:600}}> · {c.alert}</span>}
              </div>
            </div>
            <div className="cli-val">
              <div className="v" style={c.valColor ? {color:c.valColor} : {}}>{c.val}</div>
              <div className="lbl">{c.lbl}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
