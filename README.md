# Auto+ — Gestão de Concessionárias

Frontend prototype em React + Vite.

## Stack

- **React 18** + **Vite 5**
- CSS puro (sem Tailwind, sem styled-components)
- Zero dependências extras — fácil de migrar

## Rodar local

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`

## Estrutura

```
src/
├── styles/
│   └── global.css          ← todos os tokens e classes CSS
├── components/
│   ├── Sidebar.jsx
│   ├── ui/
│   │   ├── Toast.jsx       ← Context + hook useToast()
│   │   └── Modal.jsx       ← Wrapper de modal
│   ├── screens/
│   │   ├── Painel.jsx
│   │   ├── PainelVenda.jsx ← Wizard 4 etapas
│   │   ├── Veiculos.jsx
│   │   ├── Clientes.jsx
│   │   ├── Financeiro.jsx  ← A Receber / A Pagar
│   │   ├── Pagamentos.jsx  ← Integrações
│   │   └── Config.jsx
│   └── modals/
│       └── Modals.jsx      ← NovoCliente, AddVeiculo, AddReceber, AddPagar
├── App.jsx                 ← Roteamento por estado + modals
└── main.jsx
```

## Próximos passos (backend)

- [ ] Conectar Supabase (clientes, veículos, vendas, parcelas)
- [ ] Auth com RLS multi-tenant
- [ ] API Flask no Fly.io para webhooks de pagamento
- [ ] Integração Baileys (WhatsApp) para lembretes de parcela
