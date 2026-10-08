import { useEffect, useState } from 'react'
import { RotateCcw, Home as HomeIcon, Building2, Check, X, ListChecks } from 'lucide-react'

import { useGame, selectLevel } from '../store/useGame.js'
import { SUBJECT_BY_ID, DIFFICULTIES, levelProgress } from '../data/game.js'
import { medalFor } from '../engine/progression.js'
import { Button, Card, Bar, Chip, Sheet } from '../components/ui.jsx'

export default function Result() {
  const result = useGame((s) => s.result)
  const xp = useGame((s) => s.xp)
  const level = useGame(selectLevel)
  const go = useGame((s) => s.go)
  const startMission = useGame((s) => s.startMission)

  const [review, setReview] = useState(false)

  // Recarregou a página na tela de resultado? Não há o que mostrar: volta.
  useEffect(() => {
    if (!result) go('home')
  }, [result, go])

  if (!result) return null

  const subject = SUBJECT_BY_ID[result.subject]
  const diff = DIFFICULTIES.find((d) => d.id === result.difficulty)
  const medal = medalFor(result.correct, result.total)
  const prog = levelProgress(xp)

  const acertos = result.log.filter((l) => l.correct)
  const erros = result.log.filter((l) => !l.correct)

  return (
    <div className="result">
      <div className="result__medal" aria-hidden="true">
        {medal.emoji}
      </div>
      <h1 className="result__title" style={{ color: medal.color }}>
        {medal.title}
      </h1>

      <p className="result__score">
        {result.correct}
        <span className="muted" style={{ fontSize: 28 }}>
          /{result.total}
        </span>
      </p>
      <p className="muted small">
        {subject.name} · {diff.emoji} {diff.name}
      </p>

      <Card className="stack" style={{ gap: 12 }}>
        <div className="row-between">
          <span className="small bold">Nível {level}</span>
          <span className="tiny muted mono-num">
            {prog.current} / {prog.needed} XP
          </span>
        </div>
        <Bar value={prog.current} max={prog.needed} tone="gold" label="Progresso de nível" />
      </Card>

      {result.bonus.reasons.length > 0 && (
        <Card glow className="stack" style={{ gap: 8 }}>
          {result.bonus.reasons.map((b) => (
            <div key={b.label} className="row" style={{ gap: 8 }}>
              <span aria-hidden="true" style={{ fontSize: 20 }}>
                {b.icon}
              </span>
              <span className="small bold grow" style={{ textAlign: 'left' }}>
                {b.label}
              </span>
            </div>
          ))}
          <div className="reward-row">
            <div className="reward-box">
              <b className="gold">+{result.bonus.coins}</b>
              <span>moedas de bônus</span>
            </div>
            <div className="reward-box">
              <b className="cyan">+{result.bonus.xp}</b>
              <span>XP de bônus</span>
            </div>
          </div>
        </Card>
      )}

      <div className="reward-row">
        <div className="reward-box">
          <b className="green">{acertos.length}</b>
          <span>acertos</span>
        </div>
        <div className="reward-box">
          <b style={{ color: 'var(--red)' }}>{erros.length}</b>
          <span>erros</span>
        </div>
      </div>

      <Button variant="ghost" block onClick={() => setReview(true)}>
        <ListChecks size={18} /> Revisar as {result.total} questões
      </Button>

      <div className="stack" style={{ gap: 10 }}>
        <Button
          variant="gold"
          size="lg"
          block
          onClick={() => startMission(result.subject, result.difficulty)}
        >
          <RotateCcw size={18} /> Jogar de novo
        </Button>
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" className="grow" onClick={() => go('home')}>
            <HomeIcon size={18} /> Início
          </Button>
          <Button variant="primary" className="grow" onClick={() => go('city')}>
            <Building2 size={18} /> Construir
          </Button>
        </div>
      </div>

      {review && (
        <Sheet title="Revisão da missão" onClose={() => setReview(false)}>
          <div className="stack" style={{ gap: 12 }}>
            {result.log.map((entry, i) => (
              <div
                key={entry.uid}
                className="card"
                style={{
                  padding: 13,
                  borderColor: entry.correct ? 'rgba(46,230,168,.45)' : 'rgba(255,77,109,.45)',
                }}
              >
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <span
                    className="icon-badge icon-badge--sm"
                    style={{ color: entry.correct ? 'var(--green)' : 'var(--red)' }}
                  >
                    {entry.correct ? <Check size={16} /> : <X size={16} />}
                  </span>
                  <span className="tiny muted bold">Questão {i + 1}</span>
                  <Chip variant="bncc" className="nowrap" style={{ marginLeft: 'auto' }}>
                    {entry.bncc}
                  </Chip>
                </div>

                <p className="small" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                  {entry.prompt}
                </p>

                <div className="stack" style={{ gap: 2, marginTop: 8, textAlign: 'left' }}>
                  {!entry.correct && (
                    <p className="tiny" style={{ color: 'var(--red)' }}>
                      Sua resposta: {entry.guess || '—'}
                    </p>
                  )}
                  <p className="tiny" style={{ color: 'var(--green)' }}>
                    Resposta certa: {entry.answer}
                  </p>
                  {entry.explanation && (
                    <p className="tiny muted" style={{ marginTop: 4 }}>
                      {entry.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}
