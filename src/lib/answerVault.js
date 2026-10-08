/**
 * ============================================================================
 * COFRE DE RESPOSTAS — por que a resposta certa não aparece no "Inspecionar"
 * ============================================================================
 *
 * Regra do projeto: em nenhum momento antes de o aluno responder pode existir,
 * no DOM, nos props do React, no estado global, no localStorage ou numa variável
 * global, qualquer marca do tipo `correta: true` ou o texto da resposta em claro.
 *
 * Como isso é garantido aqui:
 *
 *  1. CHAVE DE SESSÃO EFÊMERA
 *     Ao carregar o app sorteamos 128 bits de chave (WebCrypto). Ela vive apenas
 *     dentro do escopo deste módulo — não é exportada, não vai para o `window`,
 *     não é persistida e muda a cada F5. Sem ela, nada aqui é reversível.
 *
 *  2. A RESPOSTA VIRA UM SELO (one-way)
 *     A questão carrega só `seal` = hash_com_chave(idDaQuestão + resposta).
 *     É um valor de mão única: dá para conferir um palpite, não dá para extrair
 *     a resposta. No DevTools aparece algo como "k3f9a1x2m0q7".
 *
 *  3. O GABARITO E A EXPLICAÇÃO VIAJAM CIFRADOS
 *     O texto da resposta certa e a explicação são guardados em `locked`, um
 *     blob cifrado (XOR com keystream derivado da chave de sessão + id).
 *     Só são decifrados DEPOIS que o aluno responde — e o resultado vai para
 *     um estado local do componente de feedback, nunca para a questão.
 *
 *  4. A CONFERÊNCIA ACONTECE AQUI DENTRO
 *     O componente manda o palpite para `checkAnswer()` e recebe um booleano.
 *     Nem a função de hash nem a chave são expostas para fora do módulo.
 *
 * Limite honesto: qualquer verificação 100% no cliente é, em teoria, burlável
 * por alguém que depure o bundle passo a passo. O que isso entrega é a barreira
 * certa para o público-alvo (aluno de 11 a 15 anos olhando o Inspecionar) sem
 * custo de servidor. A blindagem definitiva é validar no back-end — e o caminho
 * já está pronto: ver `setRemoteValidator()` no fim deste arquivo e a seção
 * "Validação server-side" em docs/ARQUITETURA.md.
 */

// ---------------------------------------------------------------------------
// 1. Chave de sessão (privada ao módulo)
// ---------------------------------------------------------------------------

const KEY = (() => {
  const k = new Uint32Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(k)
  } else {
    for (let i = 0; i < 4; i++) k[i] = (Math.random() * 0xffffffff) >>> 0
  }
  return k
})()

// ---------------------------------------------------------------------------
// 2. Hash com chave (síncrono, ~1µs por questão)
// ---------------------------------------------------------------------------

function keyedHash(text) {
  let h1 = (KEY[0] ^ 0x9e3779b9) >>> 0
  let h2 = (KEY[1] ^ 0x85ebca6b) >>> 0
  let h3 = KEY[2] >>> 0
  let h4 = KEY[3] >>> 0

  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 + c, 1597334677)
    h3 = Math.imul(h3 ^ (c + i), 2246822519)
    h4 = Math.imul(h4 + Math.imul(c, i + 1), 3266489917)
    h1 = ((h1 << 13) | (h1 >>> 19)) >>> 0
    h2 = ((h2 << 7) | (h2 >>> 25)) >>> 0
  }

  h1 = (h1 ^ h3) >>> 0
  h2 = (h2 ^ h4) >>> 0
  const a = (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>> 0
  const b = (Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909)) >>> 0

  return a.toString(36).padStart(7, '0') + b.toString(36).padStart(7, '0')
}

// ---------------------------------------------------------------------------
// 3. Normalização — tolerante com o aluno, rígida com o gabarito
// ---------------------------------------------------------------------------

/**
 * "  4,50 Km " e "4.5 km" devem bater. Também aceita vírgula ou ponto decimal,
 * ignora acentos, caixa e espaços duplicados.
 */
export function normalizeAnswer(value) {
  const s = String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')

  let t = s.replace(/\s/g, '')

  // Formato pt-BR com separador de milhar ("1.962,50", "1.250").
  // O primeiro grupo nunca começa com 0, o que evita confundir "0.125" com 125.
  if (/^-?[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '')

  // Vírgula vira ponto decimal ("4,5" -> "4.5"). "4.5" já chega pronto.
  t = t.replace(',', '.')

  if (/^-?\d+(\.\d+)?$/.test(t)) {
    const n = Number(t)
    // Round para matar ruído de ponto flutuante; -0 vira 0.
    if (Number.isFinite(n)) return String(Math.round(n * 1e6) / 1e6 + 0)
  }
  return s
}

// ---------------------------------------------------------------------------
// 4. Cifra do gabarito/explicação (XOR com keystream derivado da chave)
// ---------------------------------------------------------------------------

function keystream(salt, length) {
  let s = (KEY[0] ^ keyedHashNumeric(salt)) >>> 0
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s = s >>> 0
    out[i] = (s ^ KEY[(i + 1) & 3]) & 0xff
  }
  return out
}

function keyedHashNumeric(text) {
  let h = (KEY[3] ^ 0x811c9dc5) >>> 0
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function bytesToB64(bytes) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    out += B64[a >> 2]
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)]
    out += b === undefined ? '' : B64[((b & 15) << 2) | ((c ?? 0) >> 6)]
    out += c === undefined ? '' : B64[c & 63]
  }
  return out
}

function b64ToBytes(str) {
  const out = []
  for (let i = 0; i < str.length; i += 4) {
    const a = B64.indexOf(str[i])
    const b = B64.indexOf(str[i + 1])
    const c = str[i + 2] ? B64.indexOf(str[i + 2]) : -1
    const d = str[i + 3] ? B64.indexOf(str[i + 3]) : -1
    out.push(((a << 2) | (b >> 4)) & 0xff)
    if (c >= 0) out.push(((b << 4) | (c >> 2)) & 0xff)
    if (d >= 0) out.push(((c << 6) | d) & 0xff)
  }
  return Uint8Array.from(out)
}

function lock(salt, payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const ks = keystream(salt, bytes.length)
  const mixed = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) mixed[i] = bytes[i] ^ ks[i]
  return bytesToB64(mixed)
}

function unlock(salt, blob) {
  try {
    const mixed = b64ToBytes(blob)
    const ks = keystream(salt, mixed.length)
    const bytes = new Uint8Array(mixed.length)
    for (let i = 0; i < mixed.length; i++) bytes[i] = mixed[i] ^ ks[i]
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// 5. API pública do cofre
// ---------------------------------------------------------------------------

/**
 * Sela uma questão. Recebe o objeto "cru" do gerador (com a resposta em claro)
 * e devolve a versão segura — a única que chega aos componentes.
 *
 * @param {string} uid        identificador único desta instância de questão
 * @param {string} answer     resposta correta em texto
 * @param {object} secrets    { explanation, answerLabel, ... } revelado só depois
 * @returns {{ seal: string, locked: string }}
 */
export function sealAnswer(uid, answer, secrets = {}) {
  return {
    seal: keyedHash(uid + '' + normalizeAnswer(answer)),
    locked: lock(uid, { answer, ...secrets }),
  }
}

/**
 * Confere um palpite. Nenhum dado sensível sai daqui — só `true`/`false`.
 *
 * @param {{ uid: string, seal: string }} question
 * @param {string} guess
 */
export function checkAnswer(question, guess) {
  if (!question || !question.seal) return false
  return keyedHash(question.uid + '' + normalizeAnswer(guess)) === question.seal
}

/**
 * Abre o cofre. Só deve ser chamado DEPOIS que o aluno responde.
 * @returns {{ answer: string, explanation?: string } | null}
 */
export function revealAnswer(question) {
  if (!question || !question.locked) return null
  return unlock(question.uid, question.locked)
}

// ---------------------------------------------------------------------------
// 6. Ponte para validação no servidor (fase 2)
// ---------------------------------------------------------------------------

let remoteValidator = null

/**
 * Pluga um validador remoto. Quando definido, `checkAnswerAsync` passa a
 * perguntar ao servidor em vez de conferir localmente — sem tocar na UI.
 *
 * Exemplo de uso (Supabase Edge Function / Cloudflare Worker):
 *
 *   setRemoteValidator(async (uid, guess) => {
 *     const r = await fetch('/api/check', {
 *       method: 'POST',
 *       headers: { 'content-type': 'application/json' },
 *       body: JSON.stringify({ uid, guess }),
 *     })
 *     const { correct } = await r.json()
 *     return correct
 *   })
 */
export function setRemoteValidator(fn) {
  remoteValidator = typeof fn === 'function' ? fn : null
}

export async function checkAnswerAsync(question, guess) {
  if (remoteValidator) {
    try {
      return await remoteValidator(question.uid, guess)
    } catch {
      // Sem rede: cai para a conferência local em vez de travar a missão.
      return checkAnswer(question, guess)
    }
  }
  return checkAnswer(question, guess)
}
