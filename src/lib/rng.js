/**
 * Gerador de números pseudoaleatórios determinístico (mulberry32).
 *
 * Por que determinístico: cada questão gerada guarda a semente que a produziu.
 * Com isso conseguimos (a) reproduzir exatamente a mesma questão para revisão,
 * (b) evitar repetições controlando o espaço de sementes e (c) gerar as mesmas
 * questões no servidor no dia em que a validação migrar para o back-end.
 */

/** Hash de string -> inteiro 32 bits (xfnv1a). */
export function seedFromString(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

/** Cria um PRNG a partir de uma semente numérica ou textual. */
export function createRng(seed) {
  let a = (typeof seed === 'string' ? seedFromString(seed) : seed >>> 0) || 1
  const rng = function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Inteiro em [min, max] (inclusivo). */
  rng.int = (min, max) => Math.floor(rng() * (max - min + 1)) + min
  /** Elemento aleatório de um array. */
  rng.pick = (arr) => arr[Math.floor(rng() * arr.length)]
  /** `true` com probabilidade `p`. */
  rng.chance = (p = 0.5) => rng() < p
  /** Cópia embaralhada (Fisher-Yates). */
  rng.shuffle = (arr) => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  /** `n` elementos distintos de um array (ou todos, se n > tamanho). */
  rng.sample = (arr, n) => rng.shuffle(arr).slice(0, Math.min(n, arr.length))
  /** Inteiro em [min, max] diferente de todos os valores em `avoid`. */
  rng.intExcept = (min, max, avoid) => {
    const banned = new Set(avoid)
    for (let i = 0; i < 40; i++) {
      const v = rng.int(min, max)
      if (!banned.has(v)) return v
    }
    let v = min
    while (banned.has(v) && v <= max) v++
    return v
  }
  /** Sinal aleatório: -1 ou 1. */
  rng.sign = () => (rng() < 0.5 ? -1 : 1)

  return rng
}

/** Semente aleatória de 32 bits (usa WebCrypto quando disponível). */
export function randomSeed() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0]
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}
