import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cadastro, setCadastro] = useState({
    nome: '',
    nome_loja: '',
    cnpj: '',
    telefone: '',
    cidade: '',
    estado: '',
    email: '',
    senha: '',
  })
  const [loading, setLoading] = useState(false)
  const { signIn, signUpDealership } = useAuth()
  const toast = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, senha)
      toast('Login realizado com sucesso!')
    } catch (err) {
      toast(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await signUpDealership(cadastro)
      if (data?.session) {
        toast('Concessionária cadastrada com sucesso!')
      } else {
        toast('Cadastro realizado! Confira seu e-mail para confirmar a conta.')
      }
      setMode('login')
      setEmail(cadastro.email)
      setSenha('')
    } catch (err) {
      toast(err.message || 'Erro ao cadastrar concessionária')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-blk" style={{ padding: '30px', width: '100%', maxWidth: mode === 'cadastro' ? '560px' : '400px' }}>
        <div className="login-logo-wrap">
          <img className="login-logo" src="/logo.png" alt="Auto+ logo" />
        </div>
        <h2 className="sec-title" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          {mode === 'login' ? 'Login - Auto+' : 'Cadastro de Concessionária'}
        </h2>
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="form-grid" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="fg">
              <label className="fl">Email</label>
              <input
                type="email"
                className="fi"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="fg">
              <label className="fl">Senha</label>
              <input
                type="password"
                className="fi"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-p" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCadastro} className="form-grid">
            <div className="fg">
              <label className="fl">Nome do responsável</label>
              <input className="fi" value={cadastro.nome} onChange={e => setCadastro(v => ({ ...v, nome: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">Nome da concessionária</label>
              <input className="fi" value={cadastro.nome_loja} onChange={e => setCadastro(v => ({ ...v, nome_loja: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">CNPJ</label>
              <input className="fi" value={cadastro.cnpj} onChange={e => setCadastro(v => ({ ...v, cnpj: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">Telefone</label>
              <input className="fi" value={cadastro.telefone} onChange={e => setCadastro(v => ({ ...v, telefone: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">Cidade</label>
              <input className="fi" value={cadastro.cidade} onChange={e => setCadastro(v => ({ ...v, cidade: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">UF</label>
              <input className="fi" maxLength={2} value={cadastro.estado} onChange={e => setCadastro(v => ({ ...v, estado: e.target.value.toUpperCase() }))} required />
            </div>
            <div className="fg">
              <label className="fl">Email de acesso</label>
              <input type="email" className="fi" value={cadastro.email} onChange={e => setCadastro(v => ({ ...v, email: e.target.value }))} required />
            </div>
            <div className="fg">
              <label className="fl">Senha</label>
              <input type="password" className="fi" minLength={6} value={cadastro.senha} onChange={e => setCadastro(v => ({ ...v, senha: e.target.value }))} required />
            </div>
            <div className="fg full">
              <button type="submit" className="btn-p" style={{ marginTop: '10px', width: '100%' }} disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>
        )}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-g"
            onClick={() => setMode(mode === 'login' ? 'cadastro' : 'login')}
            disabled={loading}
          >
            {mode === 'login' ? 'Não tenho conta' : 'Já tenho conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
