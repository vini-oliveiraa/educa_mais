/**
 * ============================================================================
 * PERSISTÊNCIA — adaptador plugável
 * ============================================================================
 *
 * Hoje: `LocalAdapter` (localStorage). Zero backend, zero custo, funciona
 * offline e não coleta dado nenhum de menor de idade — o que, para uma demo em
 * sala de aula, é a opção mais segura do ponto de vista da LGPD.
 *
 * Limitações conhecidas: o progresso fica preso ao navegador daquele
 * dispositivo e some se o aluno limpar os dados do site.
 *
 * Quando migrar para um banco real, só este arquivo muda. A recomendação de
 * custo-benefício está em docs/ARQUITETURA.md › "Banco de dados".
 */

const KEY = 'educa-mais:v1'

export const LocalAdapter = {
  name: 'local',
  getItem(name) {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value)
    } catch {
      // Modo anônimo ou cota cheia: o jogo continua, só não salva.
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignora */
    }
  },
}

/**
 * Esqueleto do adaptador remoto. Implemente os três métodos (podem ser async
 * — o `persist` do zustand aceita Promise) e troque `activeAdapter`.
 *
 * Exemplo com Supabase:
 *
 *   import { createClient } from '@supabase/supabase-js'
 *   const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
 *
 *   export const SupabaseAdapter = {
 *     name: 'supabase',
 *     async getItem() {
 *       const { data: { user } } = await sb.auth.getUser()
 *       if (!user) return null
 *       const { data } = await sb.from('save_states').select('state').eq('user_id', user.id).single()
 *       return data ? JSON.stringify(data.state) : null
 *     },
 *     async setItem(_name, value) {
 *       const { data: { user } } = await sb.auth.getUser()
 *       if (!user) return
 *       await sb.from('save_states').upsert({ user_id: user.id, state: JSON.parse(value) })
 *     },
 *     async removeItem() {
 *       const { data: { user } } = await sb.auth.getUser()
 *       if (user) await sb.from('save_states').delete().eq('user_id', user.id)
 *     },
 *   }
 */
export const RemoteAdapterStub = null

let activeAdapter = LocalAdapter

export function setAdapter(adapter) {
  if (adapter) activeAdapter = adapter
}

export function getAdapterName() {
  return activeAdapter.name
}

/** Storage no formato esperado pelo middleware `persist` do zustand. */
export const storage = {
  getItem: (name) => activeAdapter.getItem(name),
  setItem: (name, value) => activeAdapter.setItem(name, value),
  removeItem: (name) => activeAdapter.removeItem(name),
}

export const STORAGE_KEY = KEY

/** Exporta o save como JSON — o aluno pode levar o progresso para outro device. */
export function exportSave() {
  return activeAdapter.getItem(KEY) ?? '{}'
}

/** Importa um save exportado. Devolve true se o JSON era válido. */
export function importSave(json) {
  try {
    JSON.parse(json)
    activeAdapter.setItem(KEY, json)
    return true
  } catch {
    return false
  }
}
