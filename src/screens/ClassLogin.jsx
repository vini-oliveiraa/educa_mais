import { useState } from 'react'
import { ArrowRight, ArrowLeft, KeyRound, Sparkles, ShieldCheck } from 'lucide-react'

import { useGame } from '../store/useGame.js'
import { mensagemDeErro } from '../services/supabase.js'
import { AVATARS, GRADES } from '../data/game.js'
import { Button, Card } from '../components/ui.jsx'

/**
 * Entrada na turma — só aparece no modo nuvem.
 *
 * Pede exatamente três coisas: código da turma, apelido e avatar. Nenhum
 * e-mail, nenhum nome real, nenhuma data de nascimento. A autenticação por
 * trás é anônima (ver supabase/migrations/…_schema.sql).
 */
export default function ClassLogin() {
  const joinClass = useGame((s) => s.joinClass)

  const [step, setStep] = useState(0)
  const [codigo, setCodigo] = useState('')
  const [apelido, setApelido] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [serie, setSerie] = useState(6)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const codigoOk = codigo.trim().length >= 4
  const apelidoOk = apelido.trim().length >= 2

  const entrar = async () => {
    setErro('')
    setEnviando(true)
    try {
      await joinClass({ codigo: codigo.trim().toUpperCase(), apelido: apelido.trim(), avatar, serie })
    } catch (e) {
      setErro(mensagemDeErro(e))
      setStep(0)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="onb">
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
          <h2 className="card__title">
            <KeyRound size={18} /> Entrar na turma
          </h2>

          <div className="field">
            <label htmlFor="codigo">Código da turma</label>
            <input
              id="codigo"
              className="input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex.: 6B-KX7Q"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              style={{ letterSpacing: '0.12em', fontFamily: 'var(--font-display)' }}
            />
            <p className="tiny muted">Seu professor passa esse código na aula.</p>
          </div>

          <div className="field">
            <label htmlFor="apelido">Seu apelido no jogo</label>
            <input
              id="apelido"
              className="input"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Como você quer ser chamado?"
              maxLength={20}
              autoComplete="off"
              onKeyDown={(e) => e.key === 'Enter' && codigoOk && apelidoOk && setStep(1)}
            />
            <p className="tiny muted">Pode ser um apelido. Não precisa ser seu nome.</p>
          </div>

          {erro && (
            <p className="small" style={{ color: 'var(--red)', fontWeight: 700 }}>
              {erro}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            block
            disabled={!codigoOk || !apelidoOk}
            onClick={() => setStep(1)}
          >
            Continuar <ArrowRight size={18} />
          </Button>
        </Card>
      ) : (
        <Card glow topline className="onb__panel stack">
          <h2 className="card__title">Escolha seu avatar e seu ano</h2>

          <div className="field">
            <label id="lbl-avatar">Avatar</label>
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

          <div className="field">
            <label id="lbl-serie">Ano escolar</label>
            <div className="grade-grid" role="group" aria-labelledby="lbl-serie">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  className="grade-opt"
                  aria-pressed={serie === g.id}
                  onClick={() => setSerie(g.id)}
                >
                  <strong>{g.label}</strong>
                  <span>{g.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(0)} aria-label="Voltar" disabled={enviando}>
              <ArrowLeft size={18} />
            </Button>
            <Button variant="gold" size="lg" className="grow" onClick={entrar} disabled={enviando}>
              <Sparkles size={18} /> {enviando ? 'Entrando…' : 'Começar a jogar'}
            </Button>
          </div>
        </Card>
      )}

      <p className="tiny muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ShieldCheck size={13} aria-hidden="true" />
        Não pedimos e-mail, telefone nem seu nome completo.
      </p>
    </div>
  )
}
