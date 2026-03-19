import { createContext, useContext, useState, useCallback } from 'react'

const DEFAULTS = {
  fipe:       { enabled: true,  label: 'FIPE / BrasilAPI',        desc: 'Sugere valor de mercado no cadastro de veículo',   free: true },
  cep:        { enabled: true,  label: 'CEP Automático',           desc: 'Preenche endereço pelo CEP no cadastro de cliente', free: true },
  placa:      { enabled: false, label: 'Consulta por Placa',       desc: 'Preenche dados do veículo pela placa automaticamente', free: false, tokenKey: 'placa_token' },
}

const Ctx = createContext(null)

function loadState() {
  try {
    const saved = localStorage.getItem('automais_api_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = { ...DEFAULTS }
      Object.keys(merged).forEach(k => {
        if (parsed[k] !== undefined) merged[k] = { ...merged[k], ...parsed[k] }
      })
      return merged
    }
  } catch {}
  return DEFAULTS
}

export function ApiSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadState)
  const [tokens, setTokensState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('automais_api_tokens') || '{}') } catch { return {} }
  })

  const toggle = useCallback((key) => {
    setSettings(prev => {
      const next = { ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }
      localStorage.setItem('automais_api_settings', JSON.stringify(next))
      return next
    })
  }, [])

  const setToken = useCallback((key, value) => {
    setTokensState(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('automais_api_tokens', JSON.stringify(next))
      return next
    })
  }, [])

  const getToken = useCallback((key) => tokens[key] || '', [tokens])

  const isEnabled = useCallback((key) => settings[key]?.enabled ?? false, [settings])

  return (
    <Ctx.Provider value={{ settings, toggle, setToken, getToken, isEnabled }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApiSettings = () => useContext(Ctx)
