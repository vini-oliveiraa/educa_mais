/** Formatação em pt-BR usada nos enunciados e na interface. */

/** Número com vírgula decimal e separador de milhar. 1234.5 -> "1.234,5" */
export function num(value, decimals) {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  if (decimals === undefined) {
    const abs = Math.abs(n)
    const auto = Number.isInteger(n) ? 0 : abs < 1 ? 3 : 2
    return n.toLocaleString('pt-BR', { maximumFractionDigits: auto })
  }
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Inteiro compacto para HUD: 1250 -> "1,2 mil" */
export function compact(value) {
  const n = Number(value) || 0
  if (n < 1000) return String(n)
  if (n < 1000000) return `${num(Math.round(n / 100) / 10, 1)} mil`
  return `${num(Math.round(n / 100000) / 10, 1)} mi`
}

/** Dinheiro em reais. 12.5 -> "R$ 12,50" */
export function money(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Fração textual. (3, 4) -> "3/4" */
export function frac(a, b) {
  return `${a}/${b}`
}

/** Maior divisor comum. */
export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

/** Menor múltiplo comum. */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

/** Reduz uma fração: (6, 8) -> [3, 4] */
export function reduceFraction(a, b) {
  const d = gcd(a, b)
  return [a / d, b / d]
}

/** Plural simples: (2, 'ponto', 'pontos') -> "2 pontos" */
export function plural(n, one, many) {
  return `${num(n)} ${Math.abs(n) === 1 ? one : many}`
}

/** "+15" / "-3" */
export function signed(n) {
  return (n >= 0 ? '+' : '') + num(n)
}

/** Lista em português: ['a','b','c'] -> "a, b e c" */
export function listPt(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

/** Chave do dia local (YYYY-MM-DD) — base das missões diárias e do ofensivo. */
export function dayKey(date = new Date()) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 10)
}

/** Diferença em dias entre duas chaves de dia. */
export function daysBetween(keyA, keyB) {
  const a = new Date(`${keyA}T00:00:00`)
  const b = new Date(`${keyB}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

/** Data legível: "7 de outubro" */
export function prettyDate(key) {
  const d = new Date(`${key}T00:00:00`)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}
