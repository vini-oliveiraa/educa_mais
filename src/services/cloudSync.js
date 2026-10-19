/**
 * ============================================================================
 * SINCRONIZAÇÃO COM A NUVEM
 * ============================================================================
 *
 * Estratégia: **local primeiro, nuvem depois**.
 *
 * O jogo continua escrevendo no estado local e no localStorage como sempre —
 * é o que garante resposta instantânea e funcionamento no Wi-Fi ruim da
 * escola. Esta camada espelha as mudanças para o Supabase em segundo plano.
 *
 * Nenhuma função daqui lança exceção para a interface. Se a rede cair, o aluno
 * continua jogando; a falha vira um aviso no console e a próxima missão tenta
 * de novo. Perder um espelhamento é aceitável — travar a aula não é.
 *
 * O que é espelhado, e quando:
 *
 *   entrar na turma  →  entrar_na_turma()      (RPC, valida o código)
 *   abrir o app      →  carregarEstado()       (puxa tudo de uma vez)
 *   fim da missão    →  registrar_missao()     (incrementa, não sobrescreve)
 *                    +  registrar_respostas()  (lote, 1 ida só)
 *   construir        →  insert em construcoes
 *   demolir          →  delete em construcoes
 *   conquista        →  insert em conquistas
 */

import { getSupabase, cloudEnabled, mensagemDeErro } from './supabase.js'

export { cloudEnabled, mensagemDeErro }

function aviso(onde, error) {
  if (error) console.warn(`[Educa+ nuvem] ${onde}:`, error.message ?? error)
}

// ---------------------------------------------------------------- sessão

/** Garante uma sessão anônima. Retorna o user id, ou null se a nuvem está off. */
export async function garantirSessao() {
  const sb = await getSupabase()
  if (!sb) return null

  const { data: { session } } = await sb.auth.getSession()
  if (session?.user) return session.user.id

  const { data, error } = await sb.auth.signInAnonymously()
  if (error) {
    aviso('login anônimo', error)
    return null
  }
  return data.user?.id ?? null
}

/** O aluno já está vinculado a uma turma? Retorna a linha de `alunos` ou null. */
export async function alunoAtual() {
  const sb = await getSupabase()
  if (!sb) return null

  const { data: { session } } = await sb.auth.getSession()
  if (!session?.user) return null

  const { data, error } = await sb
    .from('alunos')
    .select('id, turma_id, apelido, avatar, serie, turmas(nome, serie)')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) aviso('buscar aluno', error)
  return data ?? null
}

/** Entra numa turma pelo código. Lança erro — esta é a única que a UI trata. */
export async function entrarNaTurma({ codigo, apelido, avatar, serie }) {
  const sb = await getSupabase()
  if (!sb) throw new Error('Modo nuvem não está configurado.')

  await garantirSessao()

  const { data, error } = await sb.rpc('entrar_na_turma', {
    p_codigo: codigo,
    p_apelido: apelido,
    p_avatar: avatar,
    p_serie: serie ?? null,
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function sair() {
  const sb = await getSupabase()
  if (sb) await sb.auth.signOut()
}

// ------------------------------------------------------------- carregar

/**
 * Puxa tudo que o store precisa, em paralelo.
 * Retorna no MESMO formato do estado persistido, para hidratar direto.
 */
export async function carregarEstado() {
  const sb = await getSupabase()
  if (!sb) return null

  const { data: { session } } = await sb.auth.getSession()
  const uid = session?.user?.id
  if (!uid) return null

  const [aluno, progresso, construcoes, conquistas] = await Promise.all([
    sb.from('alunos').select('apelido, avatar, serie, turma_id').eq('id', uid).maybeSingle(),
    sb.from('progresso').select('*').eq('aluno_id', uid).maybeSingle(),
    sb.from('construcoes').select('id, tipo, x, y').eq('aluno_id', uid),
    sb.from('conquistas').select('conquista_id').eq('aluno_id', uid),
  ])

  aviso('carregar aluno', aluno.error)
  aviso('carregar progresso', progresso.error)
  aviso('carregar construções', construcoes.error)
  aviso('carregar conquistas', conquistas.error)

  if (!aluno.data) return null

  const p = progresso.data ?? {}

  return {
    profile: {
      name: aluno.data.apelido,
      avatar: aluno.data.avatar,
      grade: aluno.data.serie,
      turmaId: aluno.data.turma_id,
      createdAt: Date.now(),
    },
    coins: p.moedas ?? 0,
    xp: p.xp ?? 0,
    streak: {
      current: p.ofensiva_atual ?? 0,
      best: p.ofensiva_recorde ?? 0,
      lastDay: p.ultimo_dia ?? null,
    },
    statsParciais: {
      missions: p.missoes ?? 0,
      correct: p.acertos ?? 0,
      wrong: p.erros ?? 0,
      perfects: p.gabaritos ?? 0,
      bestCombo: p.melhor_combo ?? 0,
    },
    city: {
      buildings: (construcoes.data ?? []).map((b) => ({
        id: String(b.id),
        type: b.tipo,
        x: b.x,
        y: b.y,
      })),
    },
    achievements: (conquistas.data ?? []).map((c) => c.conquista_id),
  }
}

// --------------------------------------------------------------- escrita

/**
 * Fecha a missão na nuvem: soma os ganhos e grava as respostas em lote.
 * `log` é o missionLog do store.
 */
export async function salvarMissao({ moedas, xp, acertos, erros, gabaritou, combo, log, materia, serie, nivel }) {
  const sb = await getSupabase()
  if (!sb) return

  try {
    const { error } = await sb.rpc('registrar_missao', {
      p_moedas: Math.max(0, Math.round(moedas)),
      p_xp: Math.max(0, Math.round(xp)),
      p_acertos: acertos,
      p_erros: erros,
      p_gabaritou: Boolean(gabaritou),
      p_combo: combo ?? 0,
    })
    aviso('registrar missão', error)

    const itens = (log ?? []).map((l) => ({
      template_id: l.templateId ?? l.uid?.split(':')[0] ?? 'desconhecido',
      bncc: l.bncc,
      materia,
      serie,
      nivel,
      // O uid é "templateId:semente" — a semente permite reconstruir a questão.
      semente: Number(l.uid?.split(':')[1] ?? 0),
      acertou: l.correct,
      segundos: l.segundos ?? null,
    }))

    if (itens.length > 0) {
      const { error: errResp } = await sb.rpc('registrar_respostas', { p_itens: itens })
      aviso('registrar respostas', errResp)
    }
  } catch (e) {
    aviso('salvarMissao', e)
  }
}

export async function salvarConstrucao({ type, x, y }) {
  const sb = await getSupabase()
  if (!sb) return null
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return null
    const { data, error } = await sb
      .from('construcoes')
      .insert({ aluno_id: session.user.id, tipo: type, x, y })
      .select('id')
      .single()
    aviso('salvar construção', error)
    return data?.id ? String(data.id) : null
  } catch (e) {
    aviso('salvarConstrucao', e)
    return null
  }
}

export async function removerConstrucao({ x, y }) {
  const sb = await getSupabase()
  if (!sb) return
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return
    const { error } = await sb
      .from('construcoes')
      .delete()
      .eq('aluno_id', session.user.id)
      .eq('x', x)
      .eq('y', y)
    aviso('remover construção', error)
  } catch (e) {
    aviso('removerConstrucao', e)
  }
}

export async function salvarConquistas(ids) {
  const sb = await getSupabase()
  if (!sb || !ids?.length) return
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return
    const { error } = await sb
      .from('conquistas')
      .upsert(
        ids.map((conquista_id) => ({ aluno_id: session.user.id, conquista_id })),
        { onConflict: 'aluno_id,conquista_id', ignoreDuplicates: true },
      )
    aviso('salvar conquistas', error)
  } catch (e) {
    aviso('salvarConquistas', e)
  }
}

/** Atualiza apelido, avatar e série quando o aluno edita o perfil. */
export async function salvarPerfil({ name, avatar, grade }) {
  const sb = await getSupabase()
  if (!sb) return
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return
    const { error } = await sb
      .from('alunos')
      .update({ apelido: name, avatar, serie: grade, visto_em: new Date().toISOString() })
      .eq('id', session.user.id)
    aviso('salvar perfil', error)
  } catch (e) {
    aviso('salvarPerfil', e)
  }
}
