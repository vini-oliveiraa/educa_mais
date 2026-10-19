/**
 * Cliente Supabase — opcional e carregado sob demanda.
 *
 * O app funciona em dois modos, decididos por variável de ambiente:
 *
 *   SEM VITE_SUPABASE_URL  →  modo local (localStorage). É o modo da demo:
 *                             zero backend, offline, nenhum dado sai do device.
 *   COM VITE_SUPABASE_URL  →  modo nuvem: login anônimo + código de turma,
 *                             progresso sincronizado, painel do professor.
 *
 * O `import()` dinâmico é de propósito: quem roda em modo local não baixa os
 * ~40 kB do SDK. Ele só entra no bundle de quem configurou a nuvem.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Há credenciais configuradas? Decide o modo do app inteiro. */
export const cloudEnabled = Boolean(url && anonKey)

let clientPromise = null

/** @returns {Promise<import('@supabase/supabase-js').SupabaseClient|null>} */
export function getSupabase() {
  if (!cloudEnabled) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // O aluno nunca clica num link de confirmação: a sessão é anônima.
          detectSessionInUrl: false,
        },
      }),
    )
  }
  return clientPromise
}

/**
 * Traduz o erro do Postgres para uma frase que um aluno de 11 anos entende.
 * Os códigos vêm dos `raise exception ... using errcode` das migrations.
 */
export function mensagemDeErro(error) {
  if (!error) return ''
  const texto = error.message ?? String(error)

  if (error.code === 'P0002' || /código de turma inválido/i.test(texto)) {
    return 'Código de turma não encontrado. Confira as letras com seu professor.'
  }
  if (error.code === 'P0003' || /já existe um/i.test(texto)) {
    return 'Esse apelido já está em uso na turma. Escolha outro.'
  }
  if (/apelido precisa ter/i.test(texto)) {
    return 'O apelido precisa ter pelo menos 2 letras.'
  }
  if (/fetch|network|failed to fetch/i.test(texto)) {
    return 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  }
  return texto
}
