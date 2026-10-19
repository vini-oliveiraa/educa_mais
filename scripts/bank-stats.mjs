/**
 * Relatório + teste de estresse do banco de questões.
 *
 *   npm run stats
 *
 * O que ele faz:
 *   1. imprime quantos geradores e quantas variações existem por matéria/série;
 *   2. gera milhares de questões reais (passando pelo mesmo motor da interface)
 *      e verifica cada uma procurando os defeitos que mais aparecem em banco
 *      gerado por template:
 *        · enunciado com "undefined", "NaN" ou "[object Object]";
 *        · alternativa repetida ou ausente;
 *        · resposta correta fora da lista de alternativas;
 *        · selo que não confere com a própria resposta (quebraria a correção);
 *        · explicação faltando.
 *
 * Rode isso antes de versionar qualquer template novo.
 */

import { bankStats, TEMPLATES, templatesFor } from '../src/data/questions/index.js'
import { buildMission } from '../src/engine/quizEngine.js'
import { checkAnswer, revealAnswer } from '../src/lib/answerVault.js'

const SUBJECTS = ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'ingles']
const GRADES = [6, 7, 8, 9]
const DIFFICULTIES = [1, 2, 3]
const MISSIONS_PER_COMBO = 25

const SUSPICIOUS = /undefined|NaN|\[object Object\]|\bnull\b/

function line(char = '─', n = 62) {
  return char.repeat(n)
}

// ---------------------------------------------------------------- Relatório
const stats = bankStats()

console.log(`\n${line('═')}`)
console.log('  EDUCA+ · BANCO DE QUESTÕES')
console.log(line('═'))
console.log(`  Geradores (templates) ....... ${stats.templates}`)
console.log(`  Variações estimadas ......... ~${stats.variants.toLocaleString('pt-BR')}`)
console.log(`  Habilidades BNCC cobertas ... ${stats.bnccCodes}`)

console.log(`\n  Por matéria`)
console.log(`  ${line('─', 56)}`)
for (const s of SUBJECTS) {
  const d = stats.bySubject[s] ?? { templates: 0, variants: 0 }
  console.log(
    `  ${s.padEnd(12)} ${String(d.templates).padStart(3)} geradores   ~${d.variants.toLocaleString('pt-BR').padStart(9)} variações`,
  )
}

console.log(`\n  Por série`)
console.log(`  ${line('─', 56)}`)
for (const g of GRADES) {
  const d = stats.byGrade[g] ?? { templates: 0, variants: 0 }
  console.log(
    `  ${g}º ano       ${String(d.templates).padStart(3)} geradores   ~${d.variants.toLocaleString('pt-BR').padStart(9)} variações`,
  )
}

console.log(`\n  Cobertura série × matéria (nº de geradores)`)
console.log(`  ${line('─', 56)}`)
console.log(`  ${''.padEnd(8)}${SUBJECTS.map((s) => s.slice(0, 6).padStart(8)).join('')}`)
for (const g of GRADES) {
  const row = SUBJECTS.map((s) => String(templatesFor(g, s).length).padStart(8)).join('')
  console.log(`  ${`${g}º ano`.padEnd(8)}${row}`)
}

// ------------------------------------------------------------ Teste pesado
console.log(`\n${line('═')}`)
console.log('  TESTE DE GERAÇÃO')
console.log(line('═'))

const problems = []
let generated = 0
let duplicatesInMission = 0
const topicHits = new Map()
// Questão de múltipla escolha com menos de 4 alternativas não quebra nada, mas
// é mais fácil de acertar no chute. Contabilizamos por template para saber se
// é um caso raro ou um gerador com distratores que colapsam.
const poucasAlternativas = new Map()

for (const grade of GRADES) {
  for (const subject of SUBJECTS) {
    for (const difficulty of DIFFICULTIES) {
      for (let i = 0; i < MISSIONS_PER_COMBO; i++) {
        const mission = await buildMission({ grade, subject, difficulty, count: 8 })

        if (mission.questions.length === 0) {
          problems.push({ where: `${grade}º/${subject}/nível ${difficulty}`, issue: 'missão vazia' })
          continue
        }

        const seenPrompts = new Set()
        for (const q of mission.questions) {
          generated++
          topicHits.set(q.topic, (topicHits.get(q.topic) ?? 0) + 1)

          const where = `${q.templateId}`
          const reveal = revealAnswer(q)

          if (seenPrompts.has(q.prompt)) duplicatesInMission++
          seenPrompts.add(q.prompt)

          if (!q.prompt || q.prompt.length < 8) problems.push({ where, issue: 'enunciado vazio/curto' })
          if (SUSPICIOUS.test(q.prompt)) problems.push({ where, issue: `enunciado suspeito: "${q.prompt.slice(0, 80)}"` })
          if (q.support && SUSPICIOUS.test(q.support)) problems.push({ where, issue: 'texto de apoio suspeito' })

          if (!reveal) {
            problems.push({ where, issue: 'cofre não abriu' })
            continue
          }
          if (!reveal.answer) problems.push({ where, issue: 'resposta vazia' })
          if (SUSPICIOUS.test(String(reveal.answer))) problems.push({ where, issue: `resposta suspeita: "${reveal.answer}"` })
          if (!reveal.explanation || reveal.explanation.length < 10) problems.push({ where, issue: 'explicação ausente' })
          if (reveal.explanation && SUSPICIOUS.test(reveal.explanation)) {
            problems.push({ where, issue: `explicação suspeita: "${reveal.explanation.slice(0, 80)}"` })
          }

          // O selo tem de aceitar a própria resposta — senão a correção quebra.
          if (!checkAnswer(q, reveal.answer)) problems.push({ where, issue: 'selo não valida a resposta correta' })

          if (q.type === 'mc') {
            if (!q.options || q.options.length < 2) problems.push({ where, issue: 'menos de 2 alternativas' })
            else {
              if (q.options.length < 4) {
                poucasAlternativas.set(where, (poucasAlternativas.get(where) ?? 0) + 1)
              }
              const norm = q.options.map((o) => o.trim().toLowerCase())
              if (new Set(norm).size !== norm.length) problems.push({ where, issue: 'alternativa repetida' })
              const certas = q.options.filter((o) => checkAnswer(q, o))
              if (certas.length === 0) problems.push({ where, issue: 'nenhuma alternativa é a correta' })
              if (certas.length > 1) {
                problems.push({ where, issue: `${certas.length} alternativas corretas: ${certas.join(' | ')}` })
              }
              q.options.forEach((o) => {
                if (SUSPICIOUS.test(o)) problems.push({ where, issue: `alternativa suspeita: "${o}"` })
              })
            }
          }
        }
      }
    }
  }
}

console.log(`  Questões geradas ............ ${generated.toLocaleString('pt-BR')}`)
console.log(`  Assuntos exercitados ........ ${topicHits.size}`)
console.log(`  Repetições dentro da missão . ${duplicatesInMission}`)

const totalPoucas = [...poucasAlternativas.values()].reduce((a, b) => a + b, 0)
const pctPoucas = generated === 0 ? 0 : (100 * totalPoucas) / generated
console.log(`  MC com menos de 4 alternativas ${totalPoucas} (${pctPoucas.toFixed(1)}%)`)

// Acima de 2% é sinal de gerador com distratores que colapsam, não de azar.
if (pctPoucas > 2) {
  console.log(`
  ⚠️  Geradores com distratores insuficientes:`)
  ;[...poucasAlternativas.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([id, n]) => console.log(`   ${String(n).padStart(5)}x  ${id}`))
  console.log(`   Use take3() com mais candidatos nesses templates.`)
}

// Agrupa os problemas por tipo para o relatório não virar um muro de texto.
const grouped = new Map()
for (const p of problems) {
  const key = `${p.where} → ${p.issue.replace(/"[^"]*"/, '"…"')}`
  grouped.set(key, (grouped.get(key) ?? 0) + 1)
}

if (problems.length === 0) {
  console.log(`\n  ✅ Nenhum problema encontrado em ${generated.toLocaleString('pt-BR')} questões.\n`)
} else {
  console.log(`\n  ⚠️  ${problems.length} ocorrências em ${grouped.size} tipos de problema:\n`)
  ;[...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .forEach(([key, count]) => console.log(`   ${String(count).padStart(5)}×  ${key}`))

  const exemplos = problems.slice(0, 5)
  console.log(`\n  Exemplos completos:`)
  exemplos.forEach((p) => console.log(`   · [${p.where}] ${p.issue}`))
  console.log()
  process.exitCode = 1
}

// Geradores que nunca apareceram — sinal de filtro de nível/série errado.
const nunca = TEMPLATES.filter((t) => !topicHits.has(t.topic))
if (nunca.length > 0) {
  console.log(`  ℹ️  ${nunca.length} gerador(es) não foram sorteados nesta amostra:`)
  nunca.slice(0, 15).forEach((t) => console.log(`   · ${t.id} (${t.grade}º, ${t.subject}, nível ${t.level})`))
  console.log()
}
