/**
 * Smoke test de renderização.
 *
 *   npm run smoke
 *
 * Renderiza TODAS as telas no servidor (react-dom/server) com o estado do jogo
 * populado, e simula missões inteiras do começo ao fim. Não substitui testar no
 * navegador, mas pega de graça a classe de erro que mais dói: componente que
 * quebra ao montar (prop faltando, acesso a campo undefined, import errado).
 */

import { renderToString } from 'react-dom/server'

import { useGame } from '../src/store/useGame.js'
import { buildMission } from '../src/engine/quizEngine.js'
import { revealAnswer } from '../src/lib/answerVault.js'
import { BUILDINGS } from '../src/data/buildings.js'

import Onboarding from '../src/screens/Onboarding.jsx'
import Home from '../src/screens/Home.jsx'
import Subjects from '../src/screens/Subjects.jsx'
import MissionSetup from '../src/screens/MissionSetup.jsx'
import Quiz from '../src/screens/Quiz.jsx'
import Result from '../src/screens/Result.jsx'
import City from '../src/screens/City.jsx'
import Achievements from '../src/screens/Achievements.jsx'
import Profile from '../src/screens/Profile.jsx'
import AppShell from '../src/components/AppShell.jsx'

const SUBJECTS = ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'ingles']
const falhas = []
let ok = 0

/**
 * No servidor, o zustand entrega `getInitialState()` ao React — e não o estado
 * atual. Isso está certo para hidratação de verdade, mas aqui mataria o teste:
 * toda tela renderizaria o estado zerado. Como o app roda só no cliente,
 * copiamos o estado vivo para dentro do objeto de estado inicial antes de cada
 * render (é o MESMO objeto que o zustand devolve no snapshot de servidor).
 */
function sincronizarSnapshotSSR() {
  Object.assign(useGame.getInitialState(), useGame.getState())
}

function render(nome, element) {
  sincronizarSnapshotSSR()
  try {
    const html = renderToString(element)
    if (!html || html.length < 30) throw new Error('saída vazia')
    const suspeito = html.match(/.{0,60}(undefined|NaN|\[object Object\]).{0,60}/)
    if (suspeito) throw new Error(`HTML com valor suspeito: …${suspeito[0]}…`)
    ok++
    console.log(`  ✓ ${nome.padEnd(36)} ${String(html.length).padStart(7)} bytes`)
  } catch (e) {
    falhas.push({ nome, erro: e.message })
    console.log(`  ✗ ${nome.padEnd(36)} ${e.message}`)
  }
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  EDUCA+ · SMOKE TEST DE TELAS')
  console.log('══════════════════════════════════════════════════════════════\n')

  // ----------------------------------------------------- 1. sem perfil
  render('Onboarding (sem perfil)', <Onboarding />)

  // ----------------------------------------------------- 2. perfil novo
  useGame.getState().createProfile({ name: 'Ana Teste', avatar: '🦊', grade: 6 })

  render('Home (jogador novo)', <AppShell><Home /></AppShell>)
  render('Subjects', <AppShell><Subjects /></AppShell>)
  render('Achievements', <AppShell><Achievements /></AppShell>)
  render('Profile', <AppShell><Profile /></AppShell>)
  render('City (ilha vazia)', <AppShell><City /></AppShell>)

  // ------------------------------------------- 3. jogador experiente
  useGame.setState((s) => ({
    xp: 9000,
    coins: 25000,
    stats: {
      ...s.stats,
      missions: 42,
      correct: 310,
      wrong: 71,
      perfects: 9,
      masterPerfects: 2,
      bestCombo: 17,
      bySubject: Object.fromEntries(
        Object.keys(s.stats.bySubject).map((k) => [
          k,
          { missions: 7, correct: 52, wrong: 12, bestScore: 88 },
        ]),
      ),
    },
    streak: { current: 12, best: 19, lastDay: '2026-10-07' },
    achievements: ['first-mission', 'ten-correct', 'perfect', 'builder-1'],
    city: {
      buildings: BUILDINGS.slice(0, 12).map((b, i) => ({
        id: `${b.id}-${i}`,
        type: b.id,
        x: i % 9,
        y: Math.floor(i / 9),
      })),
    },
  }))

  render('Home (jogador avançado)', <AppShell><Home /></AppShell>)
  render('City (12 construções)', <AppShell><City /></AppShell>)
  render('Profile (com histórico)', <AppShell><Profile /></AppShell>)
  render('Achievements (parcial)', <AppShell><Achievements /></AppShell>)

  // ----------------------------------------------- 4. fluxo de missão
  for (const subject of SUBJECTS) {
    useGame.setState({ pendingSubject: subject })
    render(`MissionSetup · ${subject}`, <AppShell><MissionSetup /></AppShell>)
  }

  for (const grade of [6, 7, 8, 9]) {
    for (const subject of SUBJECTS) {
      for (const difficulty of [1, 2, 3]) {
        useGame.setState((s) => ({ profile: { ...s.profile, grade } }))

        const mission = await buildMission({ grade, subject, difficulty, count: 8 })
        useGame.setState({ mission, questionIndex: 0, lastAnswer: null, missionLog: [], result: null })

        const tag = `${grade}º ${subject.slice(0, 4)} n${difficulty}`
        render(`Quiz · ${tag} (enunciado)`, <Quiz />)

        // Percorre a missão inteira alternando certo/errado.
        for (let i = 0; i < mission.questions.length; i++) {
          useGame.setState({ questionIndex: i, lastAnswer: null })
          const certa = revealAnswer(mission.questions[i]).answer
          useGame.getState().answer(i % 3 === 0 ? 'resposta propositalmente errada' : certa)
          if (i === 1) render(`Quiz · ${tag} (feedback)`, <Quiz />)
        }

        useGame.getState().finishMission()
        render(`Result · ${tag}`, <Result />)
      }
    }
  }

  // ------------------------------------------------- 5. estado do jogo
  const final = useGame.getState()
  console.log('\n  Estado final do jogo simulado')
  console.log('  ────────────────────────────────────────────────────────')
  console.log(`  Moedas ................ ${final.coins.toLocaleString('pt-BR')}`)
  console.log(`  XP .................... ${final.xp.toLocaleString('pt-BR')}`)
  console.log(`  Missões ............... ${final.stats.missions}`)
  console.log(`  Acertos / erros ....... ${final.stats.correct} / ${final.stats.wrong}`)
  console.log(`  Melhor combo .......... ${final.stats.bestCombo}`)
  console.log(`  Conquistas ............ ${final.achievements.length}`)

  if (final.stats.correct === 0) falhas.push({ nome: 'economia', erro: 'nenhum acerto registrado' })
  if (final.coins <= 25000) falhas.push({ nome: 'economia', erro: 'moedas não aumentaram' })
  if (final.stats.missions <= 42) falhas.push({ nome: 'progressão', erro: 'missões não contabilizadas' })

  // --------------------------------------------------------- resumo
  console.log('\n══════════════════════════════════════════════════════════════')
  if (falhas.length === 0) {
    console.log(`  ✅ ${ok} telas renderizadas sem erro.\n`)
  } else {
    console.log(`  ❌ ${falhas.length} falha(s) em ${ok + falhas.length} renderizações:\n`)
    falhas.slice(0, 25).forEach((f) => console.log(`   · ${f.nome}: ${f.erro}`))
    console.log()
    process.exitCode = 1
  }
}

main()
