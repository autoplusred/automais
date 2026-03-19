import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  cep:        true,   // ViaCEP — preenche endereço
  fipe:       true,   // BrasilAPI FIPE — sugere preço
  placa:      false,  // Consulta por placa (requer token)
  cnpj:       true,   // BrasilAPI CNPJ
  margem:     15,     // % de margem sugerida sobre valor FIPE
  placaProvider: 'fipeapi',
}

const STORAGE_KEY = 'automais_api_config'

const Ctx = createContext(null)

export function ApiConfigProvider({ children }) {
  const [cfg, setCfg] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return { ...DEFAULTS, ...saved }
    } catch {
      return DEFAULTS
    }
  })

  const [tokens, setTokens] = useState(() => ({
    placa: localStorage.getItem('apitoken_placa') || '',
  }))

  // persiste toda vez que muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  }, [cfg])

  useEffect(() => {
    localStorage.setItem('apitoken_placa', tokens.placa)
    localStorage.setItem('placa_provider', cfg.placaProvider)
  }, [tokens, cfg.placaProvider])

  const set = (key, val) => setCfg(c => ({ ...c, [key]: val }))
  const setToken = (key, val) => setTokens(t => ({ ...t, [key]: val }))

  return (
    <Ctx.Provider value={{ cfg, set, tokens, setToken }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApiConfig = () => useContext(Ctx)
