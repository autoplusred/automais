import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg]     = useState('')
  const [visible, setVis] = useState(false)

  const showToast = useCallback((text) => {
    setMsg(text)
    setVis(true)
    setTimeout(() => setVis(false), 2800)
  }, [])

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className={`toast ${visible ? 'show' : ''}`}>{msg}</div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
