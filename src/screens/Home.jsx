import { Check, Target, Flame, Building2, ChevronRight, Swords, Coins } from 'lucide-react'

import { useGame, selectLevel } from '../store/useGame.js'
import { SUBJECTS, GRADES, titleForLevel, levelProgress } from '../data/game.js'
import { developmentIndex, cityBonuses } from '../data/buildings.js'
import { dailyMissionsFor, dailyProgress } from '../engine/progression.js'
import { num, compact } from '../lib/format.js'
import { Button, Card, Bar, Chip, IconBadge } from '../components/ui.jsx'
import SubjectIcon from '../components/SubjectIcon.jsx'

export default function Home() {
  const profile = useGame((s) => s.profile)
  const xp = useGame((s) => s.xp)
  const today = useGame((s) => s.today)
  const streak = useGame((s) => s.streak)
  const buildings = useGame((s) => s.city.buildings)
  const stats = useGame((s) => s.stats)
  const go = useGame((s) => s.go)
  const startMission = useGame((s) => s.startMission)
  const claimDaily = useGame((s) => s.claimDaily)
  const level = useGame(selectLevel)

  const bonus = cityBonuses(buildings)
  const prog = levelProgress(xp)
  const grade = GRADES.find((g) => g.id === profile.grade)
  const dailies = dailyMissionsFor(today.day)

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* ----------------------------------------------------------- Hero */}
      <section className="hero">
        <div className="hero__avatar" aria-hidden="true">
          {profile.avatar}
        </div>
        <div className="grow">
          <p className="hero__name">Olá, {profile.name}!</p>
          <p className="hero__level">
            Nível {level} · {titleForLevel(level)} · {grade?.label}
          </p>
          <div style={{ marginTop: 8 }}>
            <Bar value={prog.current} max={prog.needed} label="Progresso de nível" />
            <p className="tiny muted" style={{ marginTop: 4 }}>
              {num(prog.current)} / {num(prog.needed)} XP para o nível {level + 1}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Ação principal */}
      <Button variant="gold" size="lg" block onClick={() => go('subjects')}>
        <Swords size={20} /> Entrar em uma missão
      </Button>

      {/* -------------------------------------------------- Resumo do dia */}
      <div className="grid-2">
        <Card className="stack" style={{ gap: 6, padding: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            <IconBadge color="var(--orange)" small>
              <Flame />
            </IconBadge>
            <div>
              <p className="bold" style={{ fontSize: 20, lineHeight: 1 }}>
                {streak.current}
              </p>
              <p className="tiny muted">dias seguidos</p>
            </div>
          </div>
          <p className="tiny muted">Recorde: {streak.best} dias</p>
        </Card>

        <Card className="stack" style={{ gap: 6, padding: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            <IconBadge color="var(--green)" small>
              <Target />
            </IconBadge>
            <div>
              <p className="bold" style={{ fontSize: 20, lineHeight: 1 }}>
                {today.correct}
              </p>
              <p className="tiny muted">acertos hoje</p>
            </div>
          </div>
          <p className="tiny muted">Total: {compact(stats.correct)} acertos</p>
        </Card>
      </div>

      {/* ---------------------------------------------- Missões diárias */}
      <section>
        <h2 className="section-title">
          <Target size={16} /> Missões de hoje
        </h2>
        <Card className="stack" style={{ gap: 8 }}>
          {dailies.map((m) => {
            const current = dailyProgress(m, today)
            const done = current >= m.goal
            const claimed = today.claimed.includes(m.id)
            return (
              <div key={m.id} className={`daily-item${claimed ? ' daily-item--done' : ''}`}>
                <div className="grow">
                  <p className="daily-item__label">{m.label}</p>
                  <div className="row" style={{ gap: 8, marginTop: 6 }}>
                    <div className="grow">
                      <Bar value={current} max={m.goal} tone={done ? 'green' : undefined} thin />
                    </div>
                    <span className="tiny muted mono-num nowrap">
                      {current}/{m.goal}
                    </span>
                  </div>
                </div>
                {claimed ? (
                  <span className="chip" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>
                    <Check size={13} /> Feito
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={done ? 'gold' : 'ghost'}
                    disabled={!done}
                    onClick={() => claimDaily(m.id)}
                  >
                    <Coins size={14} aria-hidden="true" /> +{m.reward}
                  </Button>
                )}
              </div>
            )
          })}
        </Card>
      </section>

      {/* ------------------------------------------------------ Matérias */}
      <section>
        <h2 className="section-title">Continuar estudando</h2>
        <div className="grid-auto">
          {SUBJECTS.map((s) => {
            const st = stats.bySubject[s.id]
            return (
              <button
                key={s.id}
                className="subject-card"
                style={{ '--accent': s.color }}
                onClick={() => startMission(s.id, 1)}
              >
                <div className="subject-card__top">
                  <IconBadge color={s.color} small>
                    <SubjectIcon name={s.icon} size={17} />
                  </IconBadge>
                  <span className="subject-card__name">{s.name}</span>
                  <ChevronRight size={16} className="muted" style={{ marginLeft: 'auto' }} />
                </div>
                <div className="row-between">
                  <span className="subject-card__meta">
                    {st.missions > 0 ? `${st.missions} missões · ${st.correct} acertos` : 'Comece agora'}
                  </span>
                  {st.bestScore > 0 && <Chip>{st.bestScore}%</Chip>}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* -------------------------------------------------------- Cidade */}
      <section>
        <h2 className="section-title">
          <Building2 size={16} /> Meu Mundo
        </h2>
        <Card glow className="row" style={{ gap: 14 }}>
          <div className="grow stack" style={{ gap: 6 }}>
            <p className="card__title">
              {buildings.length === 0 ? 'Sua ilha está vazia' : `${buildings.length} construções`}
            </p>
            <p className="small text-soft">
              {buildings.length === 0
                ? 'Acerte questões, junte moedas e comece a construir.'
                : `Índice de desenvolvimento: ${developmentIndex(buildings)} / 100`}
            </p>
            {(bonus.coins > 0 || bonus.xp > 0) && (
              <div className="row wrap" style={{ gap: 6 }}>
                {bonus.coins > 0 && <Chip>🪙 +{Math.round(bonus.coins * 100)}% moedas</Chip>}
                {bonus.xp > 0 && <Chip>⚡ +{Math.round(bonus.xp * 100)}% XP</Chip>}
              </div>
            )}
          </div>
          <Button variant="primary" onClick={() => go('city')}>
            Abrir
          </Button>
        </Card>
      </section>
    </div>
  )
}
