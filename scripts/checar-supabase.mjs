/**
 * Diagnóstico da conexão com o Supabase.
 *
 *   npm run doctor
 *
 * Responde à pergunta "está conectado?" com fatos, não com achismo: lê o
 * .env.local, confere o papel da chave, bate em cada tabela e view, e testa
 * se o login anônimo está ligado no painel.
 *
 * Nenhuma chave é impressa inteira.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TABELAS = ['turmas', 'alunos', 'progresso', 'construcoes', 'conquistas', 'respostas']
const VIEWS = ['relatorio_bncc', 'relatorio_aluno', 'relatorio_materia', 'alunos_em_atencao']

const problemas = []
const linha = (nome, estado) => console.log(`  ${nome.padEnd(34)}${estado}`)
const titulo = (t) => console.log(`\n  ${t}\n  ${'─'.repeat(52)}`)

// ------------------------------------------------------------------ .env
function lerEnv() {
  for (const arq of ['.env.local', '.env']) {
    const p = path.join(raiz, arq)
    if (!fs.existsSync(p)) continue
    const env = {}
    for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      if (!l.trim() || l.trim().startsWith('#')) continue
      const i = l.indexOf('=')
      if (i < 0) continue
      env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    }
    return { env, arq }
  }
  return { env: null, arq: null }
}

const { env, arq } = lerEnv()

console.log('\n══════════════════════════════════════════════════════════════')
console.log('  EDUCA+ · DIAGNÓSTICO DO SUPABASE')
console.log('══════════════════════════════════════════════════════════════')

if (!env) {
  console.log('\n  Nenhum .env.local encontrado — o app está em MODO LOCAL.')
  console.log('  Isso é válido: funciona offline e sem backend.')
  console.log('  Para ligar a nuvem: cp .env.example .env.local e preencha.\n')
  process.exit(0)
}

titulo(`CONFIGURAÇÃO (${arq})`)

const base = (env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '')
const key = env.VITE_SUPABASE_ANON_KEY ?? ''

linha('VITE_SUPABASE_URL', base || '❌ ausente')
if (!base) problemas.push('Defina VITE_SUPABASE_URL.')

if (!key) {
  linha('VITE_SUPABASE_ANON_KEY', '❌ ausente')
  problemas.push('Defina VITE_SUPABASE_ANON_KEY (Settings → API → chave anon).')
} else {
  linha('VITE_SUPABASE_ANON_KEY', `${key.slice(0, 10)}…${key.slice(-5)} (${key.length} chars)`)
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
    if (payload.role === 'service_role') {
      linha('papel da chave', '❌ service_role — TROQUE pela anon')
      problemas.push(
        'A chave é service_role: ela ignora toda a RLS e vai embutida no bundle do navegador. Troque pela chave anon.',
      )
    } else {
      linha('papel da chave', `${payload.role} ✓`)
    }
    if (payload.ref && !base.includes(payload.ref)) {
      linha('ref × URL', '❌ a chave é de outro projeto')
      problemas.push('A chave pertence a outro projeto Supabase.')
    }
  } catch {
    linha('papel da chave', '(formato novo, não verificável aqui)')
  }
}

// Segredos no .env. O risco depende MUITO do prefixo: o Vite só embute no
// bundle o que começa com VITE_. Sem o prefixo, a variável fica só no disco.
for (const k of Object.keys(env)) {
  if (!/PASSWORD|SERVICE_ROLE|SECRET|TOKEN/i.test(k)) continue

  if (k.startsWith('VITE_')) {
    linha(k, '❌ vai para o bundle do navegador')
    problemas.push(
      `${k} tem prefixo VITE_, então o Vite embute o valor no JavaScript entregue ao navegador — qualquer um lê no DevTools. Remova ou tire o prefixo.`,
    )
  } else if (arq === '.env.example') {
    linha(k, '❌ este arquivo é versionado')
    problemas.push(`${k} está num arquivo que vai para o git. Mova para .env.local.`)
  } else {
    linha(k, 'ℹ️  sem prefixo VITE_ — não vaza, mas é desnecessário')
  }
}

if (!base || !key) {
  resumo()
  process.exit(problemas.length ? 1 : 0)
}

const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

async function existe(nome) {
  try {
    const r = await fetch(`${base}/rest/v1/${nome}?select=*&limit=1`, { headers: h })
    if (r.status === 200) return true
    const b = await r.json().catch(() => ({}))
    if (b.code === '42P01' || /does not exist/i.test(b.message ?? '')) return false
    return `HTTP ${r.status} ${(b.message ?? '').slice(0, 44)}`
  } catch (e) {
    return `rede: ${e.message}`
  }
}

titulo('TABELAS')
let faltando = 0
for (const t of TABELAS) {
  const r = await existe(t)
  if (r === true) linha(t, '✓ existe')
  else if (r === false) {
    linha(t, '❌ não existe')
    faltando++
  } else linha(t, `⚠️  ${r}`)
}

titulo('VIEWS DE RELATÓRIO')
let faltandoView = 0
for (const v of VIEWS) {
  const r = await existe(v)
  if (r === true) linha(v, '✓ existe')
  else {
    linha(v, '❌ não existe')
    faltandoView++
  }
}

if (faltando === TABELAS.length) {
  problemas.push('Nenhuma tabela existe: rode as 4 migrations de supabase/migrations/ no SQL Editor.')
} else if (faltando || faltandoView) {
  problemas.push(`Faltam ${faltando} tabela(s) e ${faltandoView} view(s): confira se as 4 migrations rodaram, na ordem.`)
}

titulo('AUTENTICAÇÃO')
try {
  const r = await fetch(`${base}/auth/v1/signup`, { method: 'POST', headers: h, body: '{}' })
  const b = await r.json().catch(() => ({}))
  if (r.ok && b.access_token) {
    linha('login anônimo', '✓ ligado')
  } else if (/anonymous/i.test(JSON.stringify(b))) {
    linha('login anônimo', '❌ desligado no painel')
    problemas.push(
      'Login anônimo desligado. Painel → Authentication → Sign In / Providers → Anonymous sign-ins → ativar. Sem isso a tela "Entrar na turma" não funciona.',
    )
  } else {
    linha('login anônimo', `⚠️  ${b.msg ?? b.error_code ?? JSON.stringify(b).slice(0, 60)}`)
  }
} catch (e) {
  linha('login anônimo', `⚠️  rede: ${e.message}`)
}

titulo('TURMAS CADASTRADAS')
try {
  const r = await fetch(`${base}/rest/v1/turmas?select=codigo,nome,serie`, { headers: h })
  const b = await r.json().catch(() => [])
  if (Array.isArray(b) && b.length === 0) {
    linha('turmas visíveis', '0 — esperado (a RLS esconde de quem não está logado)')
    console.log('\n  Para criar a primeira turma, veja supabase/README.md § 5.')
  } else if (Array.isArray(b)) {
    b.forEach((t) => linha(t.codigo, `${t.nome} · ${t.serie}º ano`))
    problemas.push('ATENÇÃO: as turmas estão visíveis sem login — confira se a RLS foi aplicada (migration 0002).')
  }
} catch {
  /* silencioso */
}

resumo()
process.exit(problemas.length ? 1 : 0)

function resumo() {
  console.log('\n══════════════════════════════════════════════════════════════')
  if (problemas.length === 0) {
    console.log('  ✅ Tudo certo. O app vai abrir no modo nuvem.\n')
  } else {
    console.log(`  ⚠️  ${problemas.length} pendência(s):\n`)
    problemas.forEach((p, i) => console.log(`  ${i + 1}. ${p}\n`))
  }
}
