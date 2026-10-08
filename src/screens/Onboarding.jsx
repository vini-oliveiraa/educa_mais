import { useState } from 'react'
import { ArrowRight, ArrowLeft, Gamepad2, Sparkles } from 'lucide-react'

import { useGame } from '../store/useGame.js'
import { AVATARS, GRADES } from '../data/game.js'
import { Button, Card } from '../components/ui.jsx'

export default function Onboarding() {
  const createProfile = useGame((s) => s.createProfile)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [grade, setGrade] = useState(6)

  const canAdvance = step === 0 ? name.trim().length >= 2 : true

  return (
    <div className="onb">
      <span className="ribbon">
        <Gamepad2 size={15} aria-hidden="true" />
        Projeto educacional gamificado
      </span>

      <h1 className="onb__logo">
        EDUCA<span style={{ color: 'var(--cyan)' }}>+</span>
      </h1>
      <p className="onb__tag">Aprenda jogando. Construa seu próprio mundo!</p>

      <div className="onb__steps" aria-hidden="true">
        {[0, 1].map((i) => (
          <span key={i} className={`onb__step${i <= step ? ' onb__step--on' : ''}`} />
        ))}
      </div>

      {step === 0 ? (
        <Card glow topline className="onb__panel stack">
          <h2 className="card__title">Quem vai construir essa cidade?</h2>

          <div className="field">
            <label htmlFor="nome">Seu nome</label>
            <input
              id="nome"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer ser chamado?"
              maxLength={20}
              autoComplete="off"
              onKeyDown={(e) => e.key === 'Enter' && canAdvance && setStep(1)}
            />
          </div>

          <div className="field">
            <label id="lbl-avatar">Escolha seu avatar</label>
            <div className="avatar-grid" role="group" aria-labelledby="lbl-avatar">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  className="avatar-opt"
                  aria-pressed={avatar === a}
                  aria-label={`Avatar ${a}`}
                  onClick={() => setAvatar(a)}
                >
                  <span aria-hidden="true">{a}</span>
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="lg" block disabled={!canAdvance} onClick={() => setStep(1)}>
            Continuar <ArrowRight size={18} />
          </Button>
          {!canAdvance && <p className="tiny muted center">Digite ao menos 2 letras no seu nome.</p>}
        </Card>
      ) : (
        <Card glow topline className="onb__panel stack">
          <h2 className="card__title">Em que ano você está?</h2>
          <p className="small muted">
            As missões são montadas a partir das habilidades da BNCC do ano escolhido. Você pode
            mudar isso depois no seu perfil.
          </p>

          <div className="grade-grid" role="group" aria-label="Série">
            {GRADES.map((g) => (
              <button
                key={g.id}
                className="grade-opt"
                aria-pressed={grade === g.id}
                onClick={() => setGrade(g.id)}
              >
                <strong>{g.label}</strong>
                <span>{g.hint}</span>
              </button>
            ))}
          </div>

          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(0)} aria-label="Voltar">
              <ArrowLeft size={18} />
            </Button>
            <Button
              variant="gold"
              size="lg"
              className="grow"
              onClick={() => createProfile({ name, avatar, grade })}
            >
              <Sparkles size={18} /> Começar a jogar
            </Button>
          </div>
        </Card>
      )}

      <p className="tiny muted">
        Demo educacional · progresso salvo apenas neste navegador · nenhum dado é enviado para
        servidores.
      </p>
    </div>
  )
}
