import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'COLOQUE_SUA_URL_AQUI'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'COLOQUE_SUA_ANON_KEY_AQUI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
