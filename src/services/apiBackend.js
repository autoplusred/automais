import { supabase } from './supabase'

// Em produção, a API estará no seu domínio.
const API_URL = import.meta.env.VITE_API_URL || 'http://automais.ddns.net:5000/api'

export async function fetchWithAuth(endpoint, options = {}) {
  // Pega a sessão atual do Supabase
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Se houver usuário logado, injeta o JWT no cabeçalho
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.erro || `Erro na requisição: ${response.status}`)
  }

  return response.json()
}
