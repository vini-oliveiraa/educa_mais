import { ChevronRight, BookOpenText } from 'lucide-react'

import { useGame } from '../store/useGame.js'
import { SUBJECTS, GRADES } from '../data/game.js'
import { useBank } from '../data/bankLoader.js'
import { Card, Chip, IconBadge, Bar } from '../components/ui.jsx'
import SubjectIcon from '../components/SubjectIcon.jsx'

export default function Subjects() {
  const profile = useGame((s) => s.profile)
  const stats = useGame((s) => s.stats)
  const pickSubject = useGame((s) => s.pickSubject)
  const bank = useBank()

  const grade = GRADES.find((g) => g.id === profile.grade)

  return (
    <div>
      <div className="page-head">
        <h1>
          <BookOpenText size={24} /> Escolha a matéria
        </h1>
        <p>
          Missões montadas para o <strong>{grade?.label}</strong>, a partir das habilidades da BNCC.
        </p>
      </div>

      <div className="grid-auto">
        {SUBJECTS.map((s) => {
          const topics = bank ? bank.topicsFor(profile.grade, s.id) : null
          const st = stats.bySubject[s.id]
          const total = st.correct + st.wrong
          const acerto = total > 0 ? Math.round((st.correct / total) * 100) : 0
          return (
            <button
              key={s.id}
              className="subject-card"
              style={{ '--accent': s.color }}
              onClick={() => pickSubject(s.id)}
            >
              <div className="subject-card__top">
                <IconBadge color={s.color}>
                  <SubjectIcon name={s.icon} />
                </IconBadge>
                <div className="grow">
                  <p className="subject-card__name">{s.name}</p>
                  <p className="subject-card__meta">{s.blurb}</p>
                </div>
                <ChevronRight size={18} className="muted" />
              </div>

              <div className="row wrap" style={{ gap: 6 }}>
                {topics && <Chip>{topics.length} assuntos</Chip>}
                {total > 0 && <Chip>{acerto}% de acerto</Chip>}
                {st.missions > 0 && <Chip>{st.missions} missões</Chip>}
              </div>

              {total > 0 && <Bar value={st.correct} max={total} tone="green" thin label={`Acertos em ${s.name}`} />}
            </button>
          )
        })}
      </div>

      <Card className="stack" style={{ marginTop: 18, gap: 6 }}>
        <p className="card__title">Como as questões são geradas?</p>
        <p className="small text-soft">
          Cada assunto tem um gerador que sorteia números, nomes e contextos a cada rodada. Você
          praticamente nunca vê a mesma questão duas vezes — e a resposta certa não aparece no
          código da página.
        </p>
      </Card>
    </div>
  )
}
