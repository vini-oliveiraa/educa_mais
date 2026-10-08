import { useEffect, useState } from 'react'
import { ArrowLeft, Play, Coins, Zap } from 'lucide-react'

import { useGame } from '../store/useGame.js'
import { SUBJECT_BY_ID, DIFFICULTIES, QUESTIONS_PER_MISSION, GRADES, ECONOMY } from '../data/game.js'
import { useBank } from '../data/bankLoader.js'
import { bnccInfo } from '../data/bncc.js'
import { Button, Card, Chip, IconBadge } from '../components/ui.jsx'
import SubjectIcon from '../components/SubjectIcon.jsx'

export default function MissionSetup() {
  const subjectId = useGame((s) => s.pendingSubject)
  const profile = useGame((s) => s.profile)
  const go = useGame((s) => s.go)
  const startMission = useGame((s) => s.startMission)
  const bank = useBank()

  const [difficulty, setDifficulty] = useState(1)

  const subject = SUBJECT_BY_ID[subjectId]

  // Acesso direto a esta tela sem matéria escolhida: volta para a lista.
  useEffect(() => {
    if (!subject) go('subjects')
  }, [subject, go])

  if (!subject) return null

  const topics = bank ? bank.topicsFor(profile.grade, subjectId) : []
  const grade = GRADES.find((g) => g.id === profile.grade)
  const diff = DIFFICULTIES.find((d) => d.id === difficulty)

  const ganhoPorAcerto = Math.round(ECONOMY.coinsPerCorrect * diff.coinMult)
  const xpPorAcerto = Math.round(ECONOMY.xpPerCorrect * diff.xpMult)

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row" style={{ gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={() => go('subjects')} aria-label="Voltar">
          <ArrowLeft size={18} />
        </Button>
        <IconBadge color={subject.color} small>
          <SubjectIcon name={subject.icon} size={17} />
        </IconBadge>
        <div>
          <p className="display" style={{ fontSize: 20, color: subject.color }}>
            {subject.name}
          </p>
          <p className="tiny muted">
            {grade?.label} · {QUESTIONS_PER_MISSION} questões
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------ Dificuldade */}
      <section>
        <h2 className="section-title">Escolha o nível da missão</h2>
        <div className="stack" style={{ gap: 10 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              className="grade-opt"
              style={{ borderColor: difficulty === d.id ? d.color : undefined }}
              aria-pressed={difficulty === d.id}
              onClick={() => setDifficulty(d.id)}
            >
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 26 }} aria-hidden="true">
                  {d.emoji}
                </span>
                <div className="grow">
                  <p className="display" style={{ fontSize: 17, color: d.color }}>
                    {d.name}
                  </p>
                  <p className="tiny muted">{d.desc}</p>
                </div>
                <Chip>
                  ×{d.coinMult.toFixed(1).replace('.', ',')}
                </Chip>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- Recompensas */}
      <Card glow className="row wrap" style={{ gap: 12 }}>
        <div className="row grow" style={{ gap: 8 }}>
          <IconBadge color="var(--gold)" small>
            <Coins />
          </IconBadge>
          <div>
            <p className="bold">{ganhoPorAcerto} moedas</p>
            <p className="tiny muted">por acerto (antes dos bônus)</p>
          </div>
        </div>
        <div className="row grow" style={{ gap: 8 }}>
          <IconBadge color="var(--cyan)" small>
            <Zap />
          </IconBadge>
          <div>
            <p className="bold">{xpPorAcerto} XP</p>
            <p className="tiny muted">por acerto</p>
          </div>
        </div>
      </Card>

      <Button variant="primary" size="lg" block onClick={() => startMission(subjectId, difficulty)}>
        <Play size={20} /> Iniciar missão
      </Button>

      {/* ------------------------------------------------ Assuntos / BNCC */}
      <section>
        <h2 className="section-title">O que pode cair nesta missão</h2>
        <Card className="stack" style={{ gap: 10 }}>
          {topics.map((t) => (
            <div key={t.topic} className="stack" style={{ gap: 5 }}>
              <div className="row wrap" style={{ gap: 6 }}>
                <span className="bold small">{t.topic}</span>
                {t.bncc.map((code) => (
                  <Chip key={code} variant="bncc" title={bnccInfo(code).text}>
                    {code}
                  </Chip>
                ))}
              </div>
              <p className="tiny muted">{bnccInfo(t.bncc[0]).text}</p>
            </div>
          ))}
          {topics.length === 0 && (
            <p className="small muted">{bank ? 'Nenhum assunto cadastrado ainda.' : 'Carregando assuntos…'}</p>
          )}
        </Card>
      </section>
    </div>
  )
}
