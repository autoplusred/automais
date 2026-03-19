import { createContext, useContext, useState, useCallback } from 'react'

const DEFAULTS = {
  fipe:          true,   // BrasilAPI FIPE — preço de referência
  cep:           true,   // BrasilAPI CEP — preenche endereço
  placa:         false,  // Consulta por Placa — preenche ficha do veículo
  fipeHistorico: false,  // Histórico FIPE — valorização/desvalorização
}

const STORAGE_KEY = 'automais_api_config'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

const ApiCtx = createContext(null)

export function ApiConfigProvider({ children }) {
  const [cfg, setCfg] = useState(load)

  const toggle = useCallback((key) => {
    setCfg(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return <ApiCtx.Provider value={{ cfg, toggle }}>{children}</ApiCtx.Provider>
}

export const useApiConfig = () => useContext(ApiCtx)
