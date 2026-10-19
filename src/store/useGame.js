import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { storage, STORAGE_KEY } from '../services/persistence.js'
import * as cloud from '../services/cloudSync.js'
import { buildMission } from '../engine/quizEngine.js'
import { rewardForAnswer, missionBonus, dailyMissionsFor, dailyProgress } from '../engine/progression.js'
import { checkAnswer, revealAnswer } from '../lib/answerVault.js'
import { dayKey, daysBetween } from '../lib/format.js'
import { levelFromXp, ACHIEVEMENTS, SUBJECTS, QUESTIONS_PER_MISSION, ECONOMY } from '../data/game.js'
import { BUILDING_BY_ID, cityBonuses, GRID_SIZE } from '../data/buildings.js'

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

const emptyBySubject = () =>
  Object.fromEntries(SUBJECTS.map((s) => [s.id, { missions: 0, correct: 0, wrong: 0, bestScore: 0 }]))

const emptyToday = (day) => ({
  day,
  correct: 0,
  missions: 0,
  perfects: 0,
  builds: 0,
  combo: 0,
  subjects: [],
  subjectMissions: {},
  claimed: [],
})

const INITIAL = {
  profile: null, // { name, avatar, grade, createdAt }
  coins: 0,
  xp: 0,
  stats: {
    missions: 0,
    correct: 0,
    wrong: 0,
    perfects: 0,
    masterPerfects: 0,
    bestCombo: 0,
    bySubject: emptyBySubject(),
  },
  streak: { current: 0, best: 0, lastDay: null },
  today: emptyToday(dayKey()),
  city: { buildings: [] },
  achievements: [],
  settings: { sound: true },
}

// Estado de sessão (não persiste)
const SESSION = {
  // 'local' | 'checking' | 'needs-login' | 'ready' | 'offline'
  cloudStatus: cloud.cloudEnabled ? 'checking' : 'local',
  screen: 'home',
  pendingSubject: null, // matéria escolhida, aguardando o nível da missão
  missionLoading: false, // banco de questões sendo baixado/gerado
  mission: null,
  questionIndex: 0,
  missionGains: { coins: 0, xp: 0 }, // acumulado da missão atual, para o espelho na nuvem
  lastAnswer: null, // { correct, reveal, gains, guess }
  missionLog: [], // histórico da missão atual, para a tela de revisão
  result: null,
  toasts: [],
  buildMode: null, // id da edificação selecionada na loja
  confetti: 0,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGame = create(
  persist(
    (set, get) => ({
      ...INITIAL,
      ...SESSION,

      // ---------------------------------------------------------- nuvem
      /**
       * Decide o modo do app na abertura.
       *   'local'       — sem Supabase configurado: tudo no localStorage.
       *   'needs-login' — nuvem ligada, mas o aluno ainda não entrou na turma.
       *   'ready'       — sessão ativa e estado já puxado do servidor.
       */
      initCloud: async () => {
        if (!cloud.cloudEnabled) {
          set({ cloudStatus: 'local' })
          return
        }
        set({ cloudStatus: 'checking' })
        try {
          await cloud.garantirSessao()
          const aluno = await cloud.alunoAtual()
          if (!aluno) {
            set({ cloudStatus: 'needs-login' })
            return
          }
          await get().hydrateFromCloud()
        } catch (e) {
          // Sem rede na abertura: cai para o que está salvo no device.
          console.warn('[Educa+ nuvem] init:', e?.message ?? e)
          set({ cloudStatus: get().profile ? 'offline' : 'needs-login' })
        }
      },

      /** Puxa o estado do servidor e sobrescreve o local. */
      hydrateFromCloud: async () => {
        const remoto = await cloud.carregarEstado()
        if (!remoto) {
          set({ cloudStatus: 'needs-login' })
          return
        }
        set((s) => ({
          profile: remoto.profile,
          coins: remoto.coins,
          xp: remoto.xp,
          streak: remoto.streak,
          city: remoto.city,
          achievements: remoto.achievements,
          // O servidor é dono dos totais; o detalhamento por matéria continua
          // local (dá para derivar de `respostas`, mas não vale a consulta).
          stats: { ...s.stats, ...remoto.statsParciais },
          cloudStatus: 'ready',
          screen: 'home',
        }))
      },

      /** Entra numa turma pelo código. Propaga o erro para a tela de login. */
      joinClass: async ({ codigo, apelido, avatar, serie }) => {
        await cloud.entrarNaTurma({ codigo, apelido, avatar, serie })
        await get().hydrateFromCloud()
        get().toast(`Bem-vindo, ${apelido}!`, 'gold', '🎉')
      },

      /** Sai da turma e volta para a tela de entrada. */
      leaveClass: async () => {
        await cloud.sair()
        set({ ...INITIAL, today: emptyToday(dayKey()), ...SESSION, cloudStatus: 'needs-login' })
      },

      // ---------------------------------------------------- navegação / UI
      go: (screen) => set({ screen, lastAnswer: null }),

      toast: (text, tone = 'gold', icon = '✨') =>
        set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), text, tone, icon }] })),

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      fireConfetti: () => set((s) => ({ confetti: s.confetti + 1 })),

      // ---------------------------------------------------- perfil
      createProfile: ({ name, avatar, grade }) => {
        set({
          profile: { name: name.trim() || 'Explorador', avatar, grade, createdAt: Date.now() },
          coins: 120, // capital inicial: dá para plantar duas árvores e ver a cidade reagir
          xp: 0,
          screen: 'home',
        })
        get().toast('Bem-vindo ao Educa+! Você ganhou 120 moedas para começar.', 'gold', '🎁')
      },

      setGrade: (grade) =>
        set((s) => ({ profile: s.profile ? { ...s.profile, grade } : s.profile })),

      updateProfile: (patch) => {
        set((s) => ({ profile: s.profile ? { ...s.profile, ...patch } : s.profile }))
        const p = get().profile
        if (p) cloud.salvarPerfil(p)
      },

      resetProgress: () => {
        set({ ...INITIAL, today: emptyToday(dayKey()), ...SESSION, screen: 'onboarding' })
      },

      // ---------------------------------------------------- missões
      pickSubject: (subject) => set({ pendingSubject: subject, screen: 'setup' }),

      startMission: async (subject, difficulty) => {
        const { profile, missionLoading } = get()
        if (!profile || missionLoading) return

        set({ missionLoading: true })
        try {
          const mission = await buildMission({
            grade: profile.grade,
            subject,
            difficulty,
            count: QUESTIONS_PER_MISSION,
          })
          if (mission.questions.length === 0) {
            get().toast('Ainda não há questões para essa combinação.', 'pink', '😕')
            return
          }
          set({
            mission: { ...mission, startedAt: Date.now() },
            questionIndex: 0,
            missionGains: { coins: 0, xp: 0 },
            lastAnswer: null,
            missionLog: [],
            result: null,
            screen: 'quiz',
          })
        } catch {
          get().toast('Não foi possível carregar as questões. Tente de novo.', 'pink', '⚠️')
        } finally {
          set({ missionLoading: false })
        }
      },

      /** Confere o palpite, credita moedas/XP na hora e guarda o feedback. */
      answer: (guess) => {
        const state = get()
        const { mission, questionIndex, lastAnswer } = state
        if (!mission || lastAnswer) return // já respondeu esta questão

        const question = mission.questions[questionIndex]
        const correct = checkAnswer(question, guess)
        const reveal = revealAnswer(question) // só agora o gabarito é aberto

        const combo = correct ? state.today.combo + 1 : 0
        const bonus = cityBonuses(state.city.buildings)

        let gains = { coins: 0, xp: 0 }
        if (correct) {
          gains = rewardForAnswer({
            difficulty: mission.difficulty,
            combo: combo - 1, // o combo só multiplica a partir do 2º acerto seguido
            streakDays: state.streak.current,
            cityBonus: bonus,
          })
        }

        set((s) => ({
          coins: s.coins + gains.coins,
          xp: s.xp + gains.xp,
          missionGains: {
            coins: s.missionGains.coins + gains.coins,
            xp: s.missionGains.xp + gains.xp,
          },
          lastAnswer: { correct, guess, reveal, gains },
          missionLog: [
            ...s.missionLog,
            {
              uid: question.uid,
              templateId: question.templateId,
              prompt: question.prompt,
              topic: question.topic,
              bncc: question.bncc,
              correct,
              guess,
              answer: reveal?.answer ?? '',
              explanation: reveal?.explanation ?? '',
            },
          ],
          today: {
            ...s.today,
            combo,
            correct: s.today.correct + (correct ? 1 : 0),
          },
          stats: {
            ...s.stats,
            correct: s.stats.correct + (correct ? 1 : 0),
            wrong: s.stats.wrong + (correct ? 0 : 1),
            bestCombo: Math.max(s.stats.bestCombo, combo),
            bySubject: {
              ...s.stats.bySubject,
              [mission.subject]: {
                ...s.stats.bySubject[mission.subject],
                correct: s.stats.bySubject[mission.subject].correct + (correct ? 1 : 0),
                wrong: s.stats.bySubject[mission.subject].wrong + (correct ? 0 : 1),
              },
            },
          },
        }))

        if (correct && combo > 0 && combo % 5 === 0) {
          get().toast(`${combo} acertos seguidos! Combo x${(1 + (combo - 1) * ECONOMY.comboStep).toFixed(2)}`, 'pink', '🔥')
        }

        return { correct, reveal, gains }
      },

      next: () => {
        const { mission, questionIndex } = get()
        if (!mission) return
        if (questionIndex + 1 >= mission.questions.length) {
          get().finishMission()
        } else {
          set({ questionIndex: questionIndex + 1, lastAnswer: null })
        }
      },

      abandonMission: () => set({ mission: null, missionLog: [], lastAnswer: null, screen: 'home' }),

      finishMission: () => {
        const state = get()
        const { mission, missionLog } = state
        if (!mission) return

        const total = mission.questions.length
        const correct = missionLog.filter((l) => l.correct).length
        const today = rollToToday(state.today)
        const firstOfDay = today.missions === 0

        const bonus = missionBonus({ correct, total, difficulty: mission.difficulty, firstOfDay })

        // Ofensiva: só conta uma vez por dia, na primeira missão concluída.
        let streak = state.streak
        if (firstOfDay) {
          const hoje = dayKey()
          const diff = streak.lastDay ? daysBetween(streak.lastDay, hoje) : null
          const current = diff === 1 ? streak.current + 1 : diff === 0 ? streak.current : 1
          streak = { current, best: Math.max(streak.best, current), lastDay: hoje }
        }

        const subject = mission.subject
        const scorePct = total ? Math.round((correct / total) * 100) : 0

        const nextToday = {
          ...today,
          missions: today.missions + 1,
          perfects: today.perfects + (bonus.perfect ? 1 : 0),
          subjects: today.subjects.includes(subject) ? today.subjects : [...today.subjects, subject],
          subjectMissions: {
            ...today.subjectMissions,
            [subject]: (today.subjectMissions[subject] ?? 0) + 1,
          },
        }

        set((s) => ({
          coins: s.coins + bonus.coins,
          xp: s.xp + bonus.xp,
          streak,
          today: nextToday,
          stats: {
            ...s.stats,
            missions: s.stats.missions + 1,
            perfects: s.stats.perfects + (bonus.perfect ? 1 : 0),
            masterPerfects: s.stats.masterPerfects + (bonus.perfect && mission.difficulty === 3 ? 1 : 0),
            bySubject: {
              ...s.stats.bySubject,
              [subject]: {
                ...s.stats.bySubject[subject],
                missions: s.stats.bySubject[subject].missions + 1,
                bestScore: Math.max(s.stats.bySubject[subject].bestScore, scorePct),
              },
            },
          },
          result: {
            subject,
            difficulty: mission.difficulty,
            correct,
            total,
            bonus,
            log: missionLog,
            streak: streak.current,
          },
          mission: null,
          lastAnswer: null,
          screen: 'result',
        }))

        if (bonus.perfect) get().fireConfetti()
        get().checkAchievements()

        // Espelha na nuvem (no-op em modo local). Deliberadamente sem await:
        // a tela de resultado não espera a rede.
        cloud.salvarMissao({
          moedas: state.missionGains.coins + bonus.coins,
          xp: state.missionGains.xp + bonus.xp,
          acertos: correct,
          erros: total - correct,
          gabaritou: bonus.perfect,
          combo: get().stats.bestCombo,
          log: missionLog,
          materia: subject,
          serie: state.profile?.grade ?? mission.grade,
          nivel: mission.difficulty,
        })
      },

      // ---------------------------------------------------- cidade
      selectBuild: (typeId) => set((s) => ({ buildMode: s.buildMode === typeId ? null : typeId })),

      placeBuilding: (x, y) => {
        const state = get()
        const typeId = state.buildMode
        if (!typeId) return false

        const def = BUILDING_BY_ID[typeId]
        if (!def) return false

        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false
        if (state.city.buildings.some((b) => b.x === x && b.y === y)) {
          get().toast('Esse terreno já está ocupado.', 'pink', '🚧')
          return false
        }
        if (state.coins < def.cost) {
          get().toast(`Faltam ${def.cost - state.coins} moedas para construir ${def.name}.`, 'pink', '💰')
          return false
        }
        if (levelFromXp(state.xp) < def.unlock) {
          get().toast(`${def.name} libera no nível ${def.unlock}.`, 'pink', '🔒')
          return false
        }

        const today = rollToToday(state.today)
        set((s) => ({
          coins: s.coins - def.cost,
          city: { ...s.city, buildings: [...s.city.buildings, { id: `${typeId}-${Date.now()}`, type: typeId, x, y }] },
          today: { ...today, builds: today.builds + 1 },
        }))
        get().toast(`${def.name} construída!`, 'green', '🏗️')
        get().checkAchievements()
        cloud.salvarConstrucao({ type: typeId, x, y })
        return true
      },

      demolish: (buildingId) => {
        const state = get()
        const b = state.city.buildings.find((x) => x.id === buildingId)
        if (!b) return
        const def = BUILDING_BY_ID[b.type]
        const refund = Math.round((def?.cost ?? 0) * ECONOMY.sellRefund)
        set((s) => ({
          coins: s.coins + refund,
          city: { ...s.city, buildings: s.city.buildings.filter((x) => x.id !== buildingId) },
        }))
        get().toast(`${def?.name ?? 'Construção'} demolida. +${refund} moedas.`, 'gold', '🧨')
        cloud.removerConstrucao({ x: b.x, y: b.y })
      },

      // ---------------------------------------------------- missões diárias
      claimDaily: (missionId) => {
        const state = get()
        const today = rollToToday(state.today)
        if (today.claimed.includes(missionId)) return

        const mission = dailyMissionsFor(today.day).find((m) => m.id === missionId)
        if (!mission) return
        if (dailyProgress(mission, today) < mission.goal) return

        set((s) => ({
          coins: s.coins + mission.reward,
          today: { ...today, claimed: [...today.claimed, missionId] },
        }))
        get().toast(`Missão diária concluída! +${mission.reward} moedas`, 'gold', '🎯')
        get().checkAchievements()
      },

      // ---------------------------------------------------- conquistas
      checkAchievements: () => {
        const s = get()
        const snapshot = {
          stats: s.stats,
          streak: s.streak,
          city: s.city,
          coins: s.coins,
          level: levelFromXp(s.xp),
        }
        const novas = ACHIEVEMENTS.filter(
          (a) => !s.achievements.includes(a.id) && a.check(snapshot),
        )
        if (novas.length === 0) return

        set({ achievements: [...s.achievements, ...novas.map((a) => a.id)] })
        novas.forEach((a) => get().toast(`Conquista desbloqueada: ${a.name}`, 'gold', a.icon))
        cloud.salvarConquistas(novas.map((a) => a.id))
      },

      // ---------------------------------------------------- manutenção do dia
      refreshDay: () => {
        const s = get()
        const rolled = rollToToday(s.today)
        if (rolled !== s.today) set({ today: rolled })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => storage),
      // Só o progresso é salvo. Missão em andamento e UI ficam fora de propósito:
      // se o aluno fechar no meio da prova, ele recomeça — e não dá para
      // "congelar" uma questão difícil para pesquisar a resposta.
      partialize: (s) => ({
        profile: s.profile,
        coins: s.coins,
        xp: s.xp,
        stats: s.stats,
        streak: s.streak,
        today: s.today,
        city: s.city,
        achievements: s.achievements,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.today = rollToToday(state.today)
        state.screen = state.profile ? 'home' : 'onboarding'
      },
    },
  ),
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Zera os contadores do dia quando a data muda. */
function rollToToday(today) {
  const hoje = dayKey()
  if (today && today.day === hoje) return today
  return emptyToday(hoje)
}

// ---------------------------------------------------------------------------
// Seletores
// ---------------------------------------------------------------------------

export const selectLevel = (s) => levelFromXp(s.xp)
export const selectCurrentQuestion = (s) => s.mission?.questions[s.questionIndex] ?? null

// Para bônus da cidade, as telas selecionam `s.city.buildings` (referência
// estável) e chamam `cityBonuses()` — um seletor que devolvesse objeto novo
// reexecutaria a cada leitura do store.
