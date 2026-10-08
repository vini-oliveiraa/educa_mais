import { Trophy } from 'lucide-react'

import { useGame } from '../store/useGame.js'
import { ACHIEVEMENTS } from '../data/game.js'
import { Card, Bar } from '../components/ui.jsx'

export default function Achievements() {
  const unlocked = useGame((s) => s.achievements)

  const total = ACHIEVEMENTS.length
  const got = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id))
  const missing = ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id))

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="page-head">
        <h1>
          <Trophy size={24} /> Troféus & Selos
        </h1>
        <p>Medalhas de constância para mostrar que você é mestre dos estudos.</p>
      </div>

      <Card glow className="stack" style={{ gap: 10 }}>
        <div className="row-between">
          <span className="card__title">
            {got.length} de {total} conquistas
          </span>
          <span className="bold gold mono-num">{Math.round((got.length / total) * 100)}%</span>
        </div>
        <Bar value={got.length} max={total} tone="gold" label="Conquistas" />
      </Card>

      {got.length > 0 && (
        <section>
          <h2 className="section-title">Desbloqueadas</h2>
          <div className="stack" style={{ gap: 8 }}>
            {got.map((a) => (
              <AchievementRow key={a.id} a={a} on />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Ainda bloqueadas</h2>
        <div className="stack" style={{ gap: 8 }}>
          {missing.map((a) => (
            <AchievementRow key={a.id} a={a} />
          ))}
          {missing.length === 0 && (
            <Card className="center">
              <p className="display gold" style={{ fontSize: 20 }}>
                Você conquistou tudo! 🎉
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}

function AchievementRow({ a, on }) {
  return (
    <div className={`ach ${on ? 'ach--on' : 'ach--off'}`}>
      <span className="ach__icon" aria-hidden="true">
        {a.icon}
      </span>
      <div className="grow">
        <p className="ach__name">{a.name}</p>
        <p className="ach__desc">{a.desc}</p>
      </div>
      {on && <span aria-label="Conquistada">✅</span>}
    </div>
  )
}
