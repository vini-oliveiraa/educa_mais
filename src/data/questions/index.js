import matematica6 from './matematica6.js'
import matematica7 from './matematica7.js'
import matematica8 from './matematica8.js'
import matematica9 from './matematica9.js'
import portugues from './portugues.js'
import ciencias from './ciencias.js'
import historia from './historia.js'
import geografia from './geografia.js'
import ingles from './ingles.js'

/**
 * Registro central dos templates de questão.
 *
 * Cada entrada é uma FÁBRICA de questões, não uma questão pronta — ver
 * ./helpers.js. O número de questões distintas que o banco consegue produzir é
 * a soma das variações de cada template (campo `variants`), não a contagem de
 * templates.
 */
export const TEMPLATES = [
  ...matematica6,
  ...matematica7,
  ...matematica8,
  ...matematica9,
  ...portugues,
  ...ciencias,
  ...historia,
  ...geografia,
  ...ingles,
]

// Índice grade:subject -> templates (montado uma vez, no import)
const INDEX = new Map()
for (const t of TEMPLATES) {
  const key = `${t.grade}:${t.subject}`
  if (!INDEX.has(key)) INDEX.set(key, [])
  INDEX.get(key).push(t)
}

/** Templates de uma série/matéria. */
export function templatesFor(grade, subject) {
  return INDEX.get(`${grade}:${subject}`) ?? []
}

/** Níveis de dificuldade liberados em cada modo de missão. */
export const DIFFICULTY_LEVELS = {
  1: [1, 2],
  2: [1, 2, 3],
  3: [2, 3],
}

/** Quantos assuntos (tópicos BNCC) distintos existem numa série/matéria. */
export function topicsFor(grade, subject) {
  const set = new Map()
  for (const t of templatesFor(grade, subject)) {
    if (!set.has(t.topic)) set.set(t.topic, { topic: t.topic, bncc: new Set(), levels: new Set() })
    const entry = set.get(t.topic)
    t.bncc.forEach((c) => entry.bncc.add(c))
    entry.levels.add(t.level)
  }
  return [...set.values()].map((e) => ({
    topic: e.topic,
    bncc: [...e.bncc],
    levels: [...e.levels].sort(),
  }))
}

/** Relatório do banco — usado na tela "Sobre" e no script scripts/bank-stats.mjs. */
export function bankStats() {
  const bySubject = {}
  const byGrade = {}
  let variants = 0

  for (const t of TEMPLATES) {
    bySubject[t.subject] = bySubject[t.subject] ?? { templates: 0, variants: 0 }
    bySubject[t.subject].templates++
    bySubject[t.subject].variants += t.variants

    byGrade[t.grade] = byGrade[t.grade] ?? { templates: 0, variants: 0 }
    byGrade[t.grade].templates++
    byGrade[t.grade].variants += t.variants

    variants += t.variants
  }

  const bnccCodes = new Set()
  TEMPLATES.forEach((t) => t.bncc.forEach((c) => bnccCodes.add(c)))

  return {
    templates: TEMPLATES.length,
    variants,
    bnccCodes: bnccCodes.size,
    bySubject,
    byGrade,
  }
}
