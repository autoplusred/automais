import { useState } from 'react'
import { ToastProvider } from './components/ui/Toast'
import { ApiSettingsProvider } from './context/ApiSettings'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Painel       from './components/screens/Painel'
import PainelVenda  from './components/screens/PainelVenda'
import Veiculos     from './components/screens/Veiculos'
import Clientes     from './components/screens/Clientes'
import Financeiro   from './components/screens/Financeiro'
import Pagamentos   from './components/screens/Pagamentos'
import Config       from './components/screens/Config'
import Login        from './components/screens/Login'
import {
  ModalNovoCliente,
  ModalAddVeiculo,
  ModalAddReceber,
  ModalAddPagar,
} from './components/modals/Modals'

const PAGE_TITLES = {
  painel:     'Painel Geral',
  venda:      'Painel de Venda',
  veiculos:   'Veículos',
  clientes:   'Clientes',
  financeiro: 'Financeiro',
  pagamentos: 'Integrações',
  config:     'Configurações',
}

function Inner() {
  const [page, setPage]   = useState('painel')
  const [sbOpen, setSb]   = useState(false)
  const [modal, setModal] = useState(null)
  
  const { user, loading } = useAuth()

  const openModal  = (id) => setModal(id)
  const closeModal = ()   => setModal(null)

  const screens = {
    painel:     <Painel onNav={setPage} />,
    venda:      <PainelVenda onOpenModal={openModal} />,
    veiculos:   <Veiculos onOpenModal={openModal} />,
    clientes:   <Clientes onOpenModal={openModal} />,
    financeiro: <Financeiro onOpenModal={openModal} />,
    pagamentos: <Pagamentos />,
    config:     <Config />,
  }

  // Se quiser proteger as rotas do frontend:
  // Se não estiver logado, poderia retornar uma tela de Login aqui.
  if (!loading && !user) return <Login />

  return (
    <>
      <div className="app">
        <Sidebar
          active={page}
          onNav={setPage}
          sidebarOpen={sbOpen}
          onClose={() => setSb(false)}
        />
        <div className="main">
          <div className="topbar">
            <div className="topbar-l">
              <button className="hamburger" onClick={() => setSb(o => !o)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div className="pg-title">{PAGE_TITLES[page]}</div>
            </div>
            <div className="topbar-r">
              <button className="btn-bell">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <div className="bell-dot" />
              </button>
            </div>
          </div>
          <div className="content">
            {screens[page]}
          </div>
        </div>
      </div>

      <ModalNovoCliente open={modal === 'novoCliente'} onClose={closeModal} />
      <ModalAddVeiculo  open={modal === 'addVeiculo'}  onClose={closeModal} />
      <ModalAddReceber  open={modal === 'addReceber'}  onClose={closeModal} />
      <ModalAddPagar    open={modal === 'addPagar'}    onClose={closeModal} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ApiSettingsProvider>
        <ToastProvider>
          <Inner />
        </ToastProvider>
      </ApiSettingsProvider>
    </AuthProvider>
  )
}
