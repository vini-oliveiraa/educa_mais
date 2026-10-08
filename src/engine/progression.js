import { ECONOMY, DIFFICULTIES, DAILY_POOL } from '../data/game.js'
import { createRng, seedFromString } from '../lib/rng.js'

/**
 * Recompensa de UMA questão respondida corretamente.
 *
 * Fatores, nessa ordem:
 *   base × dificuldade × combo (acertos seguidos) × ofensiva (dias seguidos) × bônus da cidade
 *
 * O combo é o que mais pesa: premia atenção sustentada em vez de chute.
 */
export function rewardForAnswer({ difficulty = 1, combo = 0, streakDays = 0, cityBonus = { coins: 0, xp: 0 } }) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[0]

  const comboMult = Math.min(ECONOMY.comboMax, 1 + combo * ECONOMY.comboStep)
  const streakMult = 1 + Math.min(ECONOMY.streakBonusMax, streakDays * ECONOMY.streakDayBonus)

  const coins = Math.round(
    ECONOMY.coinsPerCorrect * diff.coinMult * comboMult * streakMult * (1 + cityBonus.coins),
  )
  const xp = Math.round(
    ECONOMY.xpPerCorrect * diff.xpMult * comboMult * streakMult * (1 + cityBonus.xp),
  )

  return { coins, xp, comboMult, streakMult }
}

/** Bônus de fim de missão (gabarito e primeira missão do dia). */
export function missionBonus({ correct, total, difficulty = 1, firstOfDay = false }) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[0]
  const perfect = total > 0 && correct === total

  let coins = 0
  let xp = 0
  const reasons = []

  if (perfect) {
    coins += Math.round(ECONOMY.perfectBonusCoins * diff.coinMult)
    xp += Math.round(ECONOMY.perfectBonusXp * diff.xpMult)
    reasons.push({ label: 'Gabaritou a missão!', icon: '🌟' })
  }
  if (firstOfDay) {
    coins += ECONOMY.firstMissionOfDayCoins
    reasons.push({ label: 'Primeira missão do dia', icon: '📅' })
  }

  return { coins, xp, perfect, reasons }
}

/** Medalha exibida na tela de resultado, conforme o aproveitamento. */
export function medalFor(correct, total) {
  const pct = total === 0 ? 0 : correct / total
  if (pct === 1) return { emoji: '🏆', title: 'Perfeito!', color: 'var(--gold)' }
  if (pct >= 0.8) return { emoji: '🥇', title: 'Excelente!', color: 'var(--gold)' }
  if (pct >= 0.6) return { emoji: '🥈', title: 'Muito bom!', color: 'var(--cyan)' }
  if (pct >= 0.4) return { emoji: '🥉', title: 'Está evoluindo!', color: 'var(--orange)' }
  return { emoji: '💪', title: 'Bora treinar mais!', color: 'var(--pink)' }
}

/**
 * Sorteia as 3 missões diárias do dia. A semente é a própria data, então todos
 * os alunos pegam o mesmo conjunto no mesmo dia e ele não muda se a página for
 * recarregada.
 */
export function dailyMissionsFor(dayKey) {
  const rng = createRng(seedFromString(`daily:${dayKey}`))
  return rng.sample(DAILY_POOL, 3).map((m) => ({ ...m }))
}

/** Progresso de uma missão diária a partir do contador do dia. */
export function dailyProgress(mission, today) {
  const track = mission.track
  if (track.startsWith('missions:')) {
    const subject = track.split(':')[1]
    return Math.min(mission.goal, today.subjectMissions?.[subject] ?? 0)
  }
  if (track === 'subjects') return Math.min(mission.goal, (today.subjects ?? []).length)
  return Math.min(mission.goal, today[track] ?? 0)
}
