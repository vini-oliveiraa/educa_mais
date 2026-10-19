/**
 * Gera o PDF de apoio à apresentação.
 *
 *   node scripts/gerar-roteiro-pdf.mjs [url-do-app]
 *
 * Monta um HTML e manda o Chrome imprimir em PDF. Fazer assim, em vez de usar
 * uma biblioteca de PDF, dá controle total de tipografia e layout — e é o
 * mesmo motor que já usamos para os prints.
 *
 * Os prints vêm de docs/prints/ (gerados por scripts/screenshots.mjs). Se algum
 * faltar, o PDF sai mesmo assim, só sem aquela imagem.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import QRCode from 'qrcode'

import { PROJETO, NUMEROS, SECOES, PERGUNTAS } from './roteiro-conteudo.js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dirPrints = path.join(raiz, 'docs', 'prints')
const saida = path.join(raiz, 'docs', 'Roteiro de Apresentacao - Educa+.pdf')

const URL_APP = process.argv[2] ?? 'https://educa-mais.vercel.app'

// ---------------------------------------------------------------- utilidades

/** Converte a imagem para data URI — o PDF precisa ser autocontido. */
function imagem(nome) {
  const p = path.join(dirPrints, nome)
  if (!fs.existsSync(p)) return null
  return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`
}

/** **negrito** → <strong>. É a única marcação usada no roteiro. */
function negrito(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

const faltando = []

function blocoPrints(nomes) {
  const imgs = nomes
    .map((n) => {
      const src = imagem(n)
      if (!src) {
        faltando.push(n)
        return null
      }
      return `<img src="${src}" alt="" />`
    })
    .filter(Boolean)

  if (imgs.length === 0) return ''
  return `<div class="prints prints--${imgs.length}">${imgs.join('')}</div>`
}

// -------------------------------------------------------------------- HTML

const qr = await QRCode.toDataURL(URL_APP, {
  width: 520,
  margin: 1,
  color: { dark: '#0b1228', light: '#ffffff' },
})

const equipe = PROJETO.equipe.join(' · ')

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Nunito', system-ui, sans-serif; color: #15203f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .pagina { width: 210mm; min-height: 297mm; padding: 16mm 15mm; page-break-after: always; position: relative; display: flex; flex-direction: column; }
  .pagina:last-child { page-break-after: auto; }

  h1, h2, h3 { font-family: 'Fredoka', sans-serif; margin: 0; font-weight: 600; }

  /* ---------------------------------------------------------- capa */
  .capa { background: linear-gradient(165deg, #0a1026 0%, #111a3c 55%, #1b1240 100%); color: #fff; justify-content: center; align-items: center; text-align: center; gap: 7mm; }
  .capa__selo { display: inline-block; padding: 2.5mm 7mm; border-radius: 999px; background: linear-gradient(100deg, #29c6f7, #9b5cf6 55%, #ff3d8b); font-family: 'Fredoka'; font-size: 10pt; letter-spacing: .18em; text-transform: uppercase; font-weight: 600; }
  .capa__logo { font-family: 'Fredoka'; font-weight: 700; font-size: 58pt; line-height: 1; letter-spacing: -.02em; }
  .capa__logo span { color: #29c6f7; }
  .capa__tag { color: #29c6f7; font-family: 'Fredoka'; font-size: 16pt; font-weight: 500; }
  .capa__doc { font-family: 'Fredoka'; font-size: 20pt; color: #ffc93c; margin-top: 4mm; }
  .capa__equipe { border: 1px solid rgba(255,255,255,.22); border-radius: 5mm; padding: 5mm 8mm; max-width: 135mm; }
  .capa__equipe b { color: #ffc93c; font-size: 9.5pt; letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: 2mm; font-family: 'Fredoka'; }
  .capa__equipe p { margin: 0; font-size: 11pt; line-height: 1.6; }
  .capa__qr { background: #fff; padding: 3mm; border-radius: 4mm; width: 36mm; }
  .capa__qr img { width: 100%; display: block; }
  .capa__qrlegenda { font-size: 9pt; color: #9aa6cf; margin-top: -3mm; }

  /* ------------------------------------------------------- números */
  .numeros { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; width: 100%; max-width: 150mm; }
  .numero { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14); border-radius: 3mm; padding: 3.5mm 2mm; }
  .numero b { display: block; font-family: 'Fredoka'; font-size: 15pt; color: #ffc93c; line-height: 1.1; }
  .numero span { font-size: 8pt; color: #c3cbf0; }

  /* ------------------------------------------------------- seções */
  .cab { display: flex; align-items: center; gap: 4mm; padding-bottom: 3mm; border-bottom: 2px solid #e6eaf5; margin-bottom: 5mm; }
  .cab__n { flex: none; width: 11mm; height: 11mm; border-radius: 50%; background: linear-gradient(140deg, #29c6f7, #9b5cf6); color: #fff; font-family: 'Fredoka'; font-weight: 600; font-size: 15pt; display: flex; align-items: center; justify-content: center; }
  .cab h2 { font-size: 17pt; color: #15203f; line-height: 1.15; }

  .rotulo { font-family: 'Fredoka'; font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; color: #7b86a8; margin-bottom: 1.5mm; }

  .oque { background: #f4f6fc; border-left: 3px solid #9b5cf6; padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; font-size: 10pt; color: #44506f; margin-bottom: 5mm; }

  .roteiro { background: #fffaf0; border: 1px solid #ffd978; border-radius: 3mm; padding: 5mm 5mm 4mm; margin-bottom: 5mm; }
  .roteiro p { margin: 0 0 3mm; font-size: 11.5pt; line-height: 1.62; }
  .roteiro p:last-child { margin-bottom: 0; }
  .roteiro strong { color: #0b4f72; font-weight: 800; }

  .dica { display: flex; gap: 3mm; background: #eefaf4; border: 1px solid #9fe5c9; border-radius: 3mm; padding: 3.5mm 4mm; font-size: 9.5pt; color: #1d5c47; line-height: 1.5; }
  .dica b { font-family: 'Fredoka'; color: #11805f; }

  .prints { display: flex; gap: 4mm; justify-content: center; margin: 0 0 5mm; }
  .prints img { border: 1px solid #d9deec; border-radius: 3mm; box-shadow: 0 2mm 5mm rgba(21,32,63,.1); object-fit: contain; }
  .prints--1 img { max-height: 105mm; }
  .prints--2 img { max-height: 95mm; }
  .prints--3 img { max-height: 88mm; }

  .espaco { flex: 1; }
  .rodape { border-top: 1px solid #e6eaf5; padding-top: 2.5mm; font-size: 8pt; color: #9aa3bd; display: flex; justify-content: space-between; }

  /* ------------------------------------------------------ perguntas */
  .pergunta { border: 1px solid #e0e5f1; border-radius: 3mm; padding: 4mm; margin-bottom: 3.5mm; break-inside: avoid; }
  .pergunta h3 { font-size: 11.5pt; color: #0b4f72; margin-bottom: 2mm; }
  .pergunta p { margin: 0; font-size: 10pt; line-height: 1.55; color: #44506f; }

  .checklist { list-style: none; padding: 0; margin: 0; }
  .checklist li { display: flex; gap: 3mm; align-items: flex-start; padding: 2.5mm 0; border-bottom: 1px dashed #e6eaf5; font-size: 10.5pt; }
  .checklist li::before { content: ''; flex: none; width: 4mm; height: 4mm; margin-top: 1mm; border: 1.5px solid #29c6f7; border-radius: 1mm; }
</style>
</head>
<body>

<!-- ============================================================= CAPA -->
<section class="pagina capa">
  <span class="capa__selo">Projeto Educacional Gamificado</span>
  <div class="capa__logo">EDUCA<span>+</span></div>
  <p class="capa__tag">${PROJETO.tagline}</p>
  <div class="capa__doc">Roteiro de Apresentação</div>

  <div class="numeros">
    ${NUMEROS.map((n) => `<div class="numero"><b>${n.valor}</b><span>${n.rotulo}</span></div>`).join('')}
  </div>

  <div class="capa__qr"><img src="${qr}" alt="QR Code do aplicativo"></div>
  <p class="capa__qrlegenda">Aponte a câmera para abrir o Educa+</p>

  <div class="capa__equipe">
    <b>Equipe de desenvolvimento</b>
    <p>${equipe}</p>
  </div>
</section>

<!-- ========================================================== SEÇÕES -->
${SECOES.map(
  (s) => `
<section class="pagina">
  <div class="cab">
    <div class="cab__n">${s.n}</div>
    <h2>${s.titulo}</h2>
  </div>

  <div class="rotulo">O que falar</div>
  <div class="oque">${negrito(s.oQueFalar)}</div>

  <div class="rotulo">Roteiro — o que dizer</div>
  <div class="roteiro">
    ${s.roteiro.map((p) => `<p>${negrito(p.replace('{EQUIPE}', equipe))}</p>`).join('')}
  </div>

  ${blocoPrints(s.prints ?? [])}

  ${s.dica ? `<div class="dica"><b>Dica</b><span>${negrito(s.dica)}</span></div>` : ''}

  <div class="espaco"></div>
  <div class="rodape"><span>Educa+ · Roteiro de Apresentação</span><span>${s.n} de ${SECOES.length}</span></div>
</section>`,
).join('')}

<!-- ======================================================= PERGUNTAS -->
<section class="pagina">
  <div class="cab">
    <div class="cab__n">?</div>
    <h2>Perguntas que a banca pode fazer</h2>
  </div>
  <div class="oque">Leia antes de apresentar. Respostas curtas, com número sempre que der.</div>
  ${PERGUNTAS.map((p) => `<div class="pergunta"><h3>${p.q}</h3><p>${negrito(p.a)}</p></div>`).join('')}
  <div class="espaco"></div>
  <div class="rodape"><span>Educa+ · Roteiro de Apresentação</span><span>Perguntas</span></div>
</section>

<!-- ======================================================= CHECKLIST -->
<section class="pagina">
  <div class="cab">
    <div class="cab__n">✓</div>
    <h2>Checklist do dia da apresentação</h2>
  </div>

  <div class="rotulo">Antes de começar</div>
  <ul class="checklist">
    <li>Celular carregado e com o Educa+ já aberto numa aba</li>
    <li>Testar o QR Code com outro celular — confirmar que o link abre</li>
    <li>Fazer uma missão inteira de manhã, para o app estar "aquecido"</li>
    <li>Conferir que a cidade do avatar de demonstração está povoada</li>
    <li>Deixar o cabo ou adaptador do projetor separado</li>
    <li>Combinar quem fala cada uma das ${SECOES.length} partes</li>
  </ul>

  <div class="rotulo" style="margin-top:7mm">Durante</div>
  <ul class="checklist">
    <li>Falar a frase do produto devagar, e pausar depois dela</li>
    <li>Mostrar o app no celular, não só no slide</li>
    <li>Refazer a mesma missão para provar que as questões mudam</li>
    <li>Dizer "R$ 0,00" e esperar antes de explicar</li>
    <li>Deixar o QR Code na tela durante as perguntas</li>
  </ul>

  <div class="dica" style="margin-top:8mm">
    <b>Se algo falhar</b>
    <span>O aplicativo funciona <strong>offline</strong>. Se o Wi-Fi da escola cair no meio da demonstração, continue normalmente — e aproveite: isso é exatamente um dos diferenciais que vocês vão citar na parte 6.</span>
  </div>

  <div class="espaco"></div>
  <div class="rodape"><span>Educa+ · ${URL_APP}</span><span>Checklist</span></div>
</section>

</body>
</html>`

// ------------------------------------------------------------------ render

const navegador = await chromium.launch({ channel: 'chrome' })
const pagina = await navegador.newPage()
await pagina.setContent(html, { waitUntil: 'networkidle' })
await pagina.emulateMedia({ media: 'print' })
// Dá tempo das fontes do Google carregarem antes de imprimir.
await pagina.waitForTimeout(1200)

fs.mkdirSync(path.dirname(saida), { recursive: true })
await pagina.pdf({ path: saida, format: 'A4', printBackground: true })

// --preview salva cada página também como PNG, para conferir o layout sem
// precisar de um leitor de PDF.
if (process.argv.includes('--preview')) {
  const dirPrevia = path.join(raiz, 'docs', 'previa-roteiro')
  fs.rmSync(dirPrevia, { recursive: true, force: true })
  fs.mkdirSync(dirPrevia, { recursive: true })
  await pagina.setViewportSize({ width: 794, height: 1123 }) // A4 a 96dpi
  const paginas = await pagina.$$('.pagina')
  for (let i = 0; i < paginas.length; i++) {
    await paginas[i].screenshot({ path: path.join(dirPrevia, `pag-${String(i + 1).padStart(2, '0')}.png`) })
  }
  console.log(`Prévia: ${paginas.length} páginas em docs/previa-roteiro/`)
}

await navegador.close()

const kb = Math.round(fs.statSync(saida).size / 1024)
console.log(`PDF gerado: ${path.relative(raiz, saida)} (${kb} kB)`)
console.log(`URL no QR Code: ${URL_APP}`)
if (faltando.length) {
  console.log(`\n⚠️  Prints não encontrados (o PDF saiu sem eles):`)
  ;[...new Set(faltando)].forEach((f) => console.log(`   · docs/prints/${f}`))
}
