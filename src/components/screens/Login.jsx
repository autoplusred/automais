import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, senha)
      toast.show('Login realizado com sucesso!', 'success')
    } catch (err) {
      toast.show(err.message || 'Erro ao fazer login', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-blk" style={{ padding: '30px', width: '100%', maxWidth: '400px' }}>
        <h2 className="sec-title" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          Login - Auto+
        </h2>
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
      </div>
    </div>
  )
}
