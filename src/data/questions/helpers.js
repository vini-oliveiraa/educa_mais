/**
 * Ferramentas para escrever templates de questão de forma compacta.
 *
 * Um TEMPLATE não é uma questão: é uma fábrica de questões. Ele recebe um RNG
 * semeado e devolve uma INSTÂNCIA. O mesmo template de "fração de uma
 * quantidade" produz centenas de enunciados diferentes porque os números, os
 * nomes, os contextos e os distratores são sorteados.
 *
 * Campos de um template:
 *   id      identificador estável (usado para não repetir o mesmo tipo na missão)
 *   grade   6 | 7 | 8 | 9
 *   subject id da matéria
 *   bncc    código da habilidade (ou array de códigos)
 *   topic   nome curto do assunto, mostrado como chip na questão
 *   level   1 fácil · 2 médio · 3 difícil
 *   variants estimativa de instâncias distintas (só para o relatório do banco)
 *   gen(r)  função geradora
 */

import { num, gcd, reduceFraction } from '../../lib/format.js'

export { num, gcd, reduceFraction }

/** Declara um template, preenchendo os campos opcionais. */
export function tpl(def) {
  return {
    level: 1,
    variants: 1,
    ...def,
    bncc: Array.isArray(def.bncc) ? def.bncc : [def.bncc],
  }
}

/** Questão de múltipla escolha. */
export function mc({ prompt, answer, wrong, why, support }) {
  return {
    type: 'mc',
    prompt,
    answer: String(answer),
    options: [String(answer), ...wrong.map(String)],
    why,
    support,
  }
}

/** Questão de resposta digitada (o aluno escreve o número). */
export function input({ prompt, answer, why, support, unit, decimal }) {
  return {
    type: 'input',
    prompt,
    answer: String(answer),
    why,
    support,
    unit,
    decimal: decimal ?? String(answer).includes(','),
  }
}

/** Verdadeiro ou falso. */
export function tf({ prompt, answer, why, support }) {
  return {
    type: 'mc',
    prompt,
    answer: answer ? 'Verdadeiro' : 'Falso',
    options: ['Verdadeiro', 'Falso'],
    why,
    support,
  }
}

// ---------------------------------------------------------------------------
// Distratores numéricos
// ---------------------------------------------------------------------------

/**
 * Gera `count` números errados plausíveis em torno de `correct`.
 * `avoid` protege valores que apareceriam como "certos por acidente".
 */
export function numDistract(r, correct, { count = 3, spread, integer = true, min = null, avoid = [] } = {}) {
  const base = Number(correct)
  const magnitude = Math.max(1, Math.abs(base))
  const delta = spread ?? Math.max(integer ? 1 : 0.1, Math.round(magnitude * 0.25))
  const used = new Set([round(base), ...avoid.map(round)])
  const out = []
  let guard = 0

  while (out.length < count && guard++ < 160) {
    let v
    const mode = r.int(1, 4)
    if (mode === 1) v = base + r.sign() * r.int(1, Math.max(1, Math.round(delta)))
    else if (mode === 2) v = base + r.sign() * r.int(1, Math.max(2, Math.round(delta * 2)))
    else if (mode === 3) v = base * (r.chance() ? 2 : 0.5)
    else v = base + r.sign() * Math.max(1, Math.round(magnitude * (r.int(10, 45) / 100)))

    if (integer) v = Math.round(v)
    else v = Math.round(v * 100) / 100

    if (min !== null && v < min) continue
    if (!Number.isFinite(v)) continue
    const k = round(v)
    if (used.has(k)) continue
    used.add(k)
    out.push(v)
  }

  // Fallback determinístico: garante que sempre saem `count` opções distintas.
  let step = 1
  while (out.length < count) {
    const v = integer ? base + step : Math.round((base + step * 0.1) * 100) / 100
    if (!used.has(round(v)) && (min === null || v >= min)) {
      used.add(round(v))
      out.push(v)
    }
    step = step > 0 ? -step : -step + 1
  }
  return out

  function round(v) {
    return Math.round(Number(v) * 1e6) / 1e6
  }
}

/** Distratores já formatados em pt-BR. */
export function numDistractFmt(r, correct, opts = {}) {
  const decimals = opts.decimals
  return numDistract(r, correct, opts).map((v) => (decimals === undefined ? num(v) : num(v, decimals)))
}

/**
 * Pega as 3 primeiras alternativas distintas de uma lista de candidatos,
 * descartando as que coincidem com a resposta certa.
 *
 * Usado quando os distratores vêm de "erros típicos" que, para certas combinações
 * de números, colapsam na resposta correta — ex.: 2² e 2+2 dão o mesmo valor.
 * Sempre passe mais candidatos do que o necessário.
 */
export function take3(answer, candidates) {
  const out = []
  const seen = new Set([String(answer)])
  for (const c of candidates) {
    const s = String(c)
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length === 3) break
  }
  return out
}

/**
 * Escolhe `count` alternativas erradas de um pool de textos, excluindo a certa.
 */
export function pickWrong(r, pool, answer, count = 3) {
  const answerKey = normalize(answer)
  const filtered = pool.filter((p) => normalize(p) !== answerKey)
  const picked = r.sample(filtered, count)
  // Se o pool for pequeno demais, completa com variações numeradas.
  while (picked.length < count) picked.push(`${filtered[0] ?? 'Nenhuma das anteriores'} (${picked.length + 2})`)
  return picked
}

function normalize(s) {
  return String(s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// ---------------------------------------------------------------------------
// Pools de contexto reutilizáveis — dão variedade "humana" aos enunciados
// ---------------------------------------------------------------------------

export const NAMES = [
  'Ana', 'Beatriz', 'Carlos', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Heitor',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olívia', 'Pedro',
  'Rafaela', 'Samuel', 'Tainá', 'Vitor', 'Yasmin', 'Bruno', 'Clara', 'Davi',
  'Elisa', 'Gustavo', 'Helena', 'Igor', 'Júlia', 'Miguel', 'Laura', 'Théo',
]

export const PLACES = [
  'na feira', 'na papelaria', 'no mercado', 'na cantina', 'na livraria',
  'na loja de esportes', 'na padaria', 'no bazar da escola',
]

export const ITEMS = [
  { s: 'caderno', p: 'cadernos' },
  { s: 'lápis', p: 'lápis' },
  { s: 'borracha', p: 'borrachas' },
  { s: 'livro', p: 'livros' },
  { s: 'figurinha', p: 'figurinhas' },
  { s: 'bola', p: 'bolas' },
  { s: 'caneta', p: 'canetas' },
  { s: 'adesivo', p: 'adesivos' },
  { s: 'bombom', p: 'bombons' },
  { s: 'pacote de suco', p: 'pacotes de suco' },
]

export const CONTAINERS = [
  { s: 'caixa', p: 'caixas' },
  { s: 'pacote', p: 'pacotes' },
  { s: 'sacola', p: 'sacolas' },
  { s: 'estojo', p: 'estojos' },
  { s: 'cesta', p: 'cestas' },
]

export const SPORTS = ['futebol', 'vôlei', 'basquete', 'natação', 'handebol', 'skate', 'ciclismo']
export const FRUITS = ['maçãs', 'bananas', 'laranjas', 'uvas', 'mangas', 'peras', 'goiabas']
export const CITIES = ['São Paulo', 'Recife', 'Belém', 'Curitiba', 'Salvador', 'Manaus', 'Goiânia', 'Fortaleza']
