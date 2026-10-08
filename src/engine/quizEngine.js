import { createRng, randomSeed } from '../lib/rng.js'
import { sealAnswer, normalizeAnswer } from '../lib/answerVault.js'
import { loadBank } from '../data/bankLoader.js'
import { bnccInfo } from '../data/bncc.js'

/**
 * Monta uma missão: escolhe templates, gera as instâncias, embaralha as
 * alternativas e SELA a resposta antes de entregar para a interface.
 *
 * A questão que sai daqui já não contém a resposta em texto claro — ver
 * src/lib/answerVault.js.
 */

const MAX_TRIES_PER_SLOT = 6

export async function buildMission({ grade, subject, difficulty = 1, count = 8, seed }) {
  const { templatesFor, DIFFICULTY_LEVELS } = await loadBank()

  const missionSeed = seed ?? randomSeed()
  const rng = createRng(missionSeed)

  const pool = templatesFor(grade, subject)
  if (pool.length === 0) {
    return { seed: missionSeed, grade, subject, difficulty, questions: [] }
  }

  const allowed = DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS[1]
  let candidates = pool.filter((t) => allowed.includes(t.level))
  if (candidates.length < 3) candidates = pool

  // Ordem de uso dos templates: embaralha e, se precisar de mais questões do
  // que há templates, dá outra volta (o mesmo template gera outra instância).
  const order = []
  while (order.length < count) order.push(...rng.shuffle(candidates))

  const questions = []
  const usedPrompts = new Set()

  for (let slot = 0; slot < count && slot < order.length; slot++) {
    const template = order[slot]
    let question = null

    for (let attempt = 0; attempt < MAX_TRIES_PER_SLOT && !question; attempt++) {
      const instanceSeed = (missionSeed ^ (slot * 0x9e3779b1) ^ (attempt * 0x85ebca6b)) >>> 0
      question = materialize(template, instanceSeed, usedPrompts, { grade, subject })
    }

    if (question) {
      usedPrompts.add(normalizeAnswer(question.prompt))
      questions.push(question)
    }
  }

  return { seed: missionSeed, grade, subject, difficulty, questions }
}

/** Gera UMA questão a partir de um template; devolve null se a instância for inválida. */
function materialize(template, instanceSeed, usedPrompts, ctx) {
  const rng = createRng(instanceSeed)

  let raw
  try {
    raw = template.gen(rng)
  } catch {
    return null
  }
  if (!raw || !raw.prompt || raw.answer === undefined || raw.answer === null) return null

  // Enunciado repetido na mesma missão? descarta e tenta outra semente.
  if (usedPrompts.has(normalizeAnswer(raw.prompt))) return null

  const uid = `${template.id}:${instanceSeed}`
  let options = null

  if (raw.type === 'mc') {
    const seen = new Set()
    options = []
    for (const opt of raw.options ?? []) {
      const text = String(opt).trim()
      if (!text) continue
      const key = normalizeAnswer(text)
      if (seen.has(key)) continue
      seen.add(key)
      options.push(text)
    }
    // Precisa de pelo menos 2 alternativas e a correta tem de estar entre elas.
    const answerKey = normalizeAnswer(raw.answer)
    if (options.length < 2 || !options.some((o) => normalizeAnswer(o) === answerKey)) return null
    options = rng.shuffle(options)
  }

  const { seal, locked } = sealAnswer(uid, raw.answer, {
    explanation: raw.why ?? '',
  })

  const bnccPrimary = template.bncc[0]

  return {
    uid,
    templateId: template.id,
    type: raw.type,
    prompt: raw.prompt,
    support: raw.support ?? null,
    options,
    unit: raw.unit ?? null,
    // `decimal` NÃO é exposto: saber que a resposta tem casas decimais já é uma
    // pista. O teclado numérico mostra vírgula e menos em todas as questões.
    topic: template.topic,
    level: template.level,
    grade: ctx.grade,
    subject: ctx.subject,
    bncc: bnccPrimary,
    bnccText: bnccInfo(bnccPrimary).text,
    seal,
    locked,
  }
}

/**
 * Reconstrói uma missão exatamente igual a partir da semente — útil para a tela
 * de revisão e para, no futuro, o servidor recriar a mesma prova.
 */
export function replayMission({ grade, subject, difficulty, count, seed }) {
  return buildMission({ grade, subject, difficulty, count, seed })
}

/** Permite que a UI mostre a lista de matérias já com o banco a caminho. */
export { loadBank }
