import { useAuth } from '../context/AuthContext'

export default function Sidebar({ active, onNav, sidebarOpen, onClose }) {
  const { user, signOut } = useAuth()
  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'
  const perfil = user?.user_metadata?.perfil || 'Proprietário'
  const initials = nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const items = [
    { id: 'painel',     icon: PainelIcon,   label: 'Painel Geral' },
    { id: 'venda',      icon: VendaIcon,    label: 'Painel de Venda' },
    { id: 'veiculos',   icon: CarIcon,      label: 'Veículos' },
    { id: 'clientes',   icon: ClienteIcon,  label: 'Clientes' },
  ]
  const finItems = [
    { id: 'financeiro', icon: FinIcon,      label: 'A Pagar / Receber', badge: '3' },
    { id: 'pagamentos', icon: PgtoIcon,     label: 'Integrações' },
  ]
  const sysItems = [
    { id: 'config', icon: ConfigIcon, label: 'Configurações' },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
    }
  }

  const NavItem = ({ item }) => (
    <div
      className={`nav-item ${active === item.id ? 'active' : ''}`}
      onClick={() => { onNav(item.id); onClose(); }}
    >
      <item.icon />
      {item.label}
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </div>
  )

  return (
    <>
      <div className={`sb-overlay ${sidebarOpen ? 'open' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-wrap">
            <img className="brand-logo" src="/logo.png" alt="Auto+ logo" />
            <div className="logo-txt">Auto+<span>Gestão Simplificada</span></div>
          </div>
        </div>

        <div className="nav-section">
          {items.map(i => <NavItem key={i.id} item={i} />)}
        </div>

        <div className="nav-section">
          <div className="nav-lbl">Financeiro</div>
          {finItems.map(i => <NavItem key={i.id} item={i} />)}
        </div>

        <div className="nav-section">
          <div className="nav-lbl">Sistema</div>
          {sysItems.map(i => <NavItem key={i.id} item={i} />)}
        </div>

        <div className="sidebar-footer">
          <div className="user-wrap">
            <div className="user-av">{initials}</div>
            <div>
              <div className="user-name">{nome}</div>
              <div className="user-role">{perfil}</div>
            </div>
          </div>
          <button className="btn-g" style={{width:'100%',marginTop:10}} onClick={handleLogout}>Sair</button>
        </div>
      </nav>
    </>
  )
}

/* ── SVG icons ── */
const PainelIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const VendaIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
const CarIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2H5z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
const ClienteIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
const FinIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
const PgtoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
const ConfigIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
