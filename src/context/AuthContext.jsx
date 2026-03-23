import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { fetchWithAuth } from '../services/apiBackend'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ensureProvisioning = async (sessionData) => {
      if (!sessionData) return
      try {
        await fetchWithAuth('/auth/me')
      } catch (error) {
        if (error?.status === 404) {
          await fetchWithAuth('/auth/bootstrap', {
            method: 'POST',
            body: JSON.stringify({}),
          })
        } else {
          throw error
        }
      }
    }

    // Pega a sessão atual ao carregar
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session) {
          await ensureProvisioning(session)
        }
      })
      .finally(() => setLoading(false))

    // Escuta mudanças de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        try {
          await ensureProvisioning(session)
        } catch {
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signUpDealership = async (payload) => {
    const empresaId = crypto.randomUUID()
    const metadata = {
      empresa_id: empresaId,
      perfil: 'proprietario',
      nome: payload.nome,
      empresa_nome: payload.nome_loja,
      cnpj: payload.cnpj,
      telefone: payload.telefone,
      cidade: payload.cidade,
      estado: payload.estado,
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.senha,
      options: { data: metadata },
    })

    if (error) throw error

    if (data?.session) {
      await fetchWithAuth('/auth/bootstrap', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: empresaId,
          nome: payload.nome,
          empresa_nome: payload.nome_loja,
          cnpj: payload.cnpj,
          telefone: payload.telefone,
          cidade: payload.cidade,
          estado: payload.estado,
          email: payload.email,
          perfil: 'proprietario',
        }),
      })
    }

    return data
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signUpDealership }}>
      {loading ? (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          Carregando...
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
