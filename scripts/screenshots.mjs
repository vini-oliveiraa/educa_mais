/**
 * ============================================================================
 * PRINTS DE APRESENTAÇÃO — captura automática das telas do Educa+
 * ============================================================================
 *
 * Gera os PNGs de `docs/prints/` usados no PDF de apresentação escolar.
 *
 * Como rodar:
 *
 *   npm run build
 *   npx vite preview --port 4173       # em outro terminal (ou em background)
 *   node scripts/screenshots.mjs
 *
 * Opções:
 *   BASE_URL=http://localhost:5173  node scripts/screenshots.mjs   # usar o dev server
 *   node scripts/screenshots.mjs --only=04,13                      # recapturar só alguns
 *
 * Como funciona:
 *
 *  1. Usa o `playwright-core` (devDependency) dirigindo o **Chrome já instalado**
 *     na máquina (`channel: 'chrome'`) — nenhum browser é baixado.
 *  2. Injeta o save de demonstração (`scripts/demo-state.json`) no localStorage
 *     ANTES de o app carregar, com `addInitScript`. Sem isso a jogadora não
 *     existe, o app abre no onboarding e a cidade fica vazia.
 *  3. Navega pelo app como um aluno navegaria (cliques reais nos botões) e
 *     tira um screenshot **da página** (sem barra de endereço) em cada tela.
 *  4. Mede cada arquivo no final: PNG com menos de 20 kB é quase sempre tela
 *     em branco, então o script avisa.
 *
 * Observação sobre o quiz: a resposta certa é selada com uma chave de sessão
 * (ver src/lib/answerVault.js), então o script NÃO sabe qual alternativa é a
 * correta — ele responde ao acaso e vai repetindo missões até conseguir
 * fotografar um acerto E um erro.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright-core'

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'docs', 'prints')
const SEED_FILE = path.join(ROOT, 'scripts', 'demo-state.json')
const STORAGE_KEY = 'educa-mais:v1'
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173/'

/** Celular de referência (iPhone 12/13/14): é como o aluno usa o app. */
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }
/** Notebook de referência: é como o professor projeta na sala. */
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }

/** Altura aproximada da barra superior fixa — usada ao rolar até uma seção. */
const TOPBAR = 66

/** `--only=04,13` recaptura apenas esses prints (o resto do fluxo continua). */
const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const ONLY = onlyArg ? new Set(onlyArg.slice(7).split(',').map((s) => s.trim())) : null

/** Este print está ligado nesta execução? (respeita o --only) */
const want = (nome) => !ONLY || ONLY.has(nome.slice(0, 2))

const report = []

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Espera o `vite preview` responder antes de abrir o browser. */
async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok) return
    } catch {
      /* servidor ainda subindo */
    }
    await sleep(500)
  }
  throw new Error(`Servidor não respondeu em ${url}. Rode "npx vite preview --port 4173" antes.`)
}

/**
 * Tira o print e registra o tamanho. `settle` dá tempo para as animações de
 * entrada (fade/slide dos cards) terminarem — sem isso o card sai meio
 * transparente, no meio do fade-in.
 */
async function shot(page, name, { settle = 600 } = {}) {
  if (!want(name)) return
  await page.evaluate(() => document.fonts?.ready)
  await sleep(settle)
  const file = path.join(OUT_DIR, name)
  await page.screenshot({ path: file, caret: 'hide' })
  const size = fs.statSync(file).size
  report.push({ name, size })
  const flag = size < 20 * 1024 ? '  <-- SUSPEITO (<20 kB)' : ''
  console.log(`  ${name.padEnd(32)} ${(size / 1024).toFixed(1).padStart(7)} kB${flag}`)
}

/**
 * Rola a página até um título de seção ficar logo abaixo da barra superior.
 * `extra` desce mais um pouco (ou sobe, se negativo) para enquadrar a seção.
 */
async function scrollToSection(page, text, extra = 0) {
  await page.evaluate(
    ([needle, offset]) => {
      const nodes = [...document.querySelectorAll('h1, h2, h3, .section-title, .card__title')]
      const el = nodes.find((n) => n.textContent.includes(needle))
      if (!el) return
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' })
    },
    [text, TOPBAR - extra],
  )
  await sleep(250)
}

async function scrollTop(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await sleep(150)
}

async function scrollBottom(page) {
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await sleep(150)
}

/** Espera os toasts de recompensa desaparecerem (eles se auto-fecham em 3,4 s). */
async function waitToastsGone(page) {
  try {
    await page.waitForFunction(() => !document.querySelector('.toasts'), null, { timeout: 6000 })
  } catch {
    /* algum toast ficou: segue o jogo */
  }
}

/** Abre um contexto já com o save de demonstração plantado no localStorage. */
async function openSeeded(browser, device, seed) {
  const context = await browser.newContext({
    ...device,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'dark',
  })
  const page = await context.newPage()

  await page.addInitScript(
    ([key, data]) => {
      // O save guarda o dia das missões diárias. Se a data do arquivo não for
      // "hoje", o app zera os contadores do dia e as barras aparecem vazias —
      // então reescrevemos a data do save com o dia local do navegador.
      const now = new Date()
      const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      data.state.today.day = today
      data.state.streak.lastDay = today
      localStorage.setItem(key, JSON.stringify(data))
    },
    [STORAGE_KEY, seed],
  )

  await page.goto(BASE_URL, { waitUntil: 'load' })
  await page.waitForSelector('.hero__name', { timeout: 20000 })
  return { context, page }
}

/** Clica N vezes no botão de aproximar da cidade (cada clique = +0,2 de escala). */
async function zoomCidade(page, vezes) {
  for (let i = 0; i < vezes; i++) {
    await page.getByRole('button', { name: 'Aproximar' }).click()
    await sleep(250)
  }
}

/** Clica num botão pelo texto visível (a navegação inferior é feita de botões). */
const nav = (page, label) => page.getByRole('button', { name: label }).first().click()

// ---------------------------------------------------------------------------
// Fluxo do quiz
// ---------------------------------------------------------------------------

/**
 * Responde uma missão inteira (8 questões) tirando os prints que ainda faltam.
 * `need` é um Set com os sufixos pendentes ('05', '06', '07', '08').
 * Devolve na tela de resultado.
 */
async function playMission(page, need, suffix = '') {
  for (let q = 0; q < 20; q++) {
    // Fim da missão?
    if (await page.locator('.result').count()) break

    await page.waitForSelector('.qcard', { timeout: 20000 })
    await sleep(500) // animação q-in (0,32 s)

    const numeric = (await page.locator('.numpad').count()) > 0

    if (numeric) {
      // Digita um palpite no teclado próprio do app (ordem das teclas:
      // 1..9, vírgula, 0, menos) só para o visor não aparecer vazio.
      const keys = page.locator('.numpad button')
      await keys.nth(3).click() // 4
      await keys.nth(1).click() // 2
      await sleep(250)
      if (need.has('06')) {
        await scrollBottom(page)
        await shot(page, `06-quiz-numerico${suffix}.png`)
        need.delete('06')
      }
      await page.getByRole('button', { name: 'Confirmar resposta' }).click()
    } else {
      if (need.has('05')) {
        await scrollTop(page)
        await shot(page, `05-quiz-multipla${suffix}.png`)
        need.delete('05')
      }
      // Não há como saber a alternativa certa (a resposta é selada): escolhe
      // uma ao acaso — os erros também interessam, para o print de feedback.
      const options = page.locator('button.option')
      const total = await options.count()
      await options.nth(Math.floor(Math.random() * total)).click()
    }

    await page.waitForSelector('.feedback', { timeout: 10000 })
    await sleep(600) // animação do feedback + cores nas alternativas

    const acertou = (await page.locator('.feedback--ok').count()) > 0
    if (acertou && need.has('07')) {
      await scrollBottom(page)
      await shot(page, `07-feedback-acerto${suffix}.png`)
      need.delete('07')
    }
    // O print de erro sai de uma questão de múltipla escolha: ela mostra a
    // alternativa marcada em vermelho e a certa em verde. Na questão digitada
    // o teclado some depois de responder e sobra meia tela vazia.
    if (!acertou && !numeric && need.has('08')) {
      await scrollBottom(page)
      await shot(page, `08-feedback-erro${suffix}.png`)
      need.delete('08')
    }

    await page.locator('.feedback button').last().click() // "Próxima" / "Ver resultado"
  }

  await page.waitForSelector('.result', { timeout: 20000 })
}

// ---------------------------------------------------------------------------
// Captura — celular (prioridade)
// ---------------------------------------------------------------------------

async function capturaMobile(browser, seed) {
  console.log('\n[celular 390x844 @2x]')

  // ---------------------------------------------------- 01 · onboarding
  // Contexto SEM o save: é a única forma de ver a primeira tela do app.
  const limpo = await browser.newContext({ ...MOBILE, locale: 'pt-BR', colorScheme: 'dark' })
  const virgem = await limpo.newPage()
  await virgem.goto(BASE_URL, { waitUntil: 'load' })
  await virgem.waitForSelector('.onb__panel')
  await virgem.fill('#nome', 'Beatriz')
  await virgem.getByRole('button', { name: 'Avatar 🦊' }).click()
  await shot(virgem, '01-onboarding.png', { settle: 900 })
  await limpo.close()

  // ---------------------------------------------------- app com progresso
  const { context, page } = await openSeeded(browser, MOBILE, seed)

  await shot(page, '02-home.png', { settle: 900 })

  // ---------------------------------------------------- 03 · matérias
  await nav(page, 'Entrar em uma missão')
  await page.waitForSelector('.subject-card')
  await shot(page, '03-materias.png')

  // ---------------------------------------------------- 04 · setup da missão
  await page.locator('.subject-card', { hasText: 'Matemática' }).first().click()
  await page.waitForSelector('.chip--bncc', { timeout: 20000 })
  // Enquadra a página do meio para baixo: níveis de missão + recompensas +
  // "Iniciar missão" + o começo da lista de habilidades da BNCC.
  await scrollToSection(page, 'O que pode cair nesta missão', -320)
  await shot(page, '04-missao-setup.png')

  // ---------------------------------------------------- 05 a 09 · missão
  await scrollTop(page)
  // nível do meio: mistura questões fáceis e difíceis
  await page.locator('.grade-opt', { hasText: 'Aventureiro' }).click()
  await nav(page, 'Iniciar missão')

  // O script não sabe a resposta certa (ela é selada com chave de sessão):
  // responde ao acaso e repete a missão até fotografar acerto E erro.
  const need = new Set(['05', '06', '07', '08'])
  const MAX_MISSOES = 6
  let melhor = -1
  for (let tentativa = 1; tentativa <= MAX_MISSOES; tentativa++) {
    await playMission(page, need, '')

    // Como as respostas são chutadas, a nota varia muito. Fica o print da
    // melhor missão jogada: uma tela de resultado 1/8 não ilustra bem o jogo.
    const acertos = await page
      .locator('.result__score')
      .first()
      .evaluate((el) => parseInt(el.textContent, 10))
    if (acertos > melhor) {
      melhor = acertos
      await waitToastsGone(page)
      await scrollTop(page)
      await shot(page, '09-resultado.png', { settle: 800 })
    }
    // Repete enquanto faltar print de quiz ou enquanto a melhor nota for
    // fraca demais para ilustrar a tela de resultado.
    const notaBoa = melhor >= 4 || !want('09-resultado.png')
    if ((need.size === 0 && notaBoa) || tentativa === MAX_MISSOES) break
    console.log(
      `  (melhor nota: ${melhor}/8 · prints que faltam: ${[...need].join(', ') || 'nenhum'} — jogando de novo)`,
    )
    await nav(page, 'Jogar de novo')
  }
  if (need.size > 0) console.log(`  !! não consegui capturar: ${[...need].join(', ')}`)

  // As missões jogadas acima mexeram nas moedas, nas estatísticas e nas
  // conquistas. Para as telas de progresso vale um contexto novo, com os
  // números redondos do save de demonstração.
  await context.close()
  const limpo2 = await openSeeded(browser, MOBILE, seed)
  const page2 = limpo2.page

  // ---------------------------------------------------- 10 · cidade
  await nav(page2, 'Meu Mundo')
  await page2.waitForSelector('.city__svg', { timeout: 20000 })
  await sleep(900) // sprites isométricos entram com fade
  await zoomCidade(page2, 2) // a ilha nasce pequena no quadro; aproxima a câmera
  await shot(page2, '10-cidade.png', { settle: 900 })

  // ---------------------------------------------------- 11 · loja
  await nav(page2, 'Loja do jogo')
  await page2.waitForSelector('.sheet .shop-grid')
  await shot(page2, '11-loja.png', { settle: 900 })
  await page2.keyboard.press('Escape')
  await sleep(400)

  // ---------------------------------------------------- 12 · conquistas
  await nav(page2, 'Troféus')
  await page2.waitForSelector('.ach--on')
  await shot(page2, '12-conquistas.png')

  // ---------------------------------------------------- 13 · perfil
  await nav(page2, 'Perfil')
  await page2.waitForSelector('.stat-line')
  // +36 px: sem isso a última matéria (Inglês) fica escondida atrás da
  // navegação inferior.
  await scrollToSection(page2, 'Suas estatísticas', 36)
  await shot(page2, '13-perfil.png')

  await limpo2.context.close()
}

// ---------------------------------------------------------------------------
// Captura — desktop (só as quatro telas pedidas)
// ---------------------------------------------------------------------------

async function capturaDesktop(browser, seed) {
  console.log('\n[desktop 1440x900]')
  const { context, page } = await openSeeded(browser, DESKTOP, seed)

  await shot(page, '02-home-desktop.png', { settle: 900 })

  // Missão só para fotografar a questão de múltipla escolha no desktop.
  await nav(page, 'Entrar em uma missão')
  await page.waitForSelector('.subject-card')
  await page.locator('.subject-card', { hasText: 'Matemática' }).first().click()
  await page.waitForSelector('.chip--bncc', { timeout: 20000 })
  await page.locator('.grade-opt', { hasText: 'Aventureiro' }).click()
  await nav(page, 'Iniciar missão')
  await playMission(page, new Set(['05']), '-desktop')

  // Contexto novo: a missão jogada acima sujaria as moedas e as estatísticas.
  await context.close()
  const limpo = await openSeeded(browser, DESKTOP, seed)
  const page2 = limpo.page

  await nav(page2, 'Meu Mundo')
  await page2.waitForSelector('.city__svg', { timeout: 20000 })
  await sleep(900)
  await zoomCidade(page2, 2)
  await shot(page2, '10-cidade-desktop.png', { settle: 900 })

  await nav(page2, 'Perfil')
  await page2.waitForSelector('.stat-line')
  await scrollToSection(page2, 'Suas estatísticas')
  await shot(page2, '13-perfil-desktop.png')

  await limpo.context.close()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'))

  console.log(`Servidor: ${BASE_URL}`)
  await waitForServer(BASE_URL)

  // `channel: 'chrome'` usa o Chrome instalado na máquina — não baixa browser.
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    await capturaMobile(browser, seed)
    await capturaDesktop(browser, seed)
  } finally {
    await browser.close()
  }

  console.log('\nResumo:')
  for (const { name, size } of report) {
    console.log(`  ${name.padEnd(32)} ${(size / 1024).toFixed(1).padStart(7)} kB`)
  }
  const suspeitos = report.filter((r) => r.size < 20 * 1024)
  if (suspeitos.length) {
    console.log(`\nATENÇÃO: ${suspeitos.map((s) => s.name).join(', ')} abaixo de 20 kB.`)
  }
  console.log(`\n${report.length} prints em docs/prints/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
