import { useEffect, useState, useCallback } from 'react'
import { X, Check, ArrowRight, Delete, Coins, Zap, Lightbulb } from 'lucide-react'

import { useGame, selectCurrentQuestion } from '../store/useGame.js'
import { SUBJECT_BY_ID, DIFFICULTIES } from '../data/game.js'
import { normalizeAnswer } from '../lib/answerVault.js'
import { Button, Chip, Sheet } from '../components/ui.jsx'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function Quiz() {
  const mission = useGame((s) => s.mission)
  const index = useGame((s) => s.questionIndex)
  const lastAnswer = useGame((s) => s.lastAnswer)
  const log = useGame((s) => s.missionLog)
  const answer = useGame((s) => s.answer)
  const next = useGame((s) => s.next)
  const abandon = useGame((s) => s.abandonMission)
  const question = useGame(selectCurrentQuestion)

  const [typed, setTyped] = useState('')
  const [confirmExit, setConfirmExit] = useState(false)

  // Limpa o campo ao trocar de questão.
  useEffect(() => {
    setTyped('')
  }, [index])

  const submit = useCallback(
    (guess) => {
      if (lastAnswer) return
      answer(guess)
    },
    [answer, lastAnswer],
  )

  // Atalhos de teclado (desktop): 1-4 escolhem, Enter confirma/avança.
  useEffect(() => {
    if (!question) return undefined
    const onKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (lastAnswer) next()
        else if (question.type === 'input' && typed) submit(typed)
        return
      }
      if (lastAnswer) return
      if (question.type === 'mc') {
        const i = Number(e.key) - 1
        if (i >= 0 && i < question.options.length) submit(question.options[i])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, lastAnswer, next, submit, typed])

  if (!mission || !question) return null

  const subject = SUBJECT_BY_ID[mission.subject]
  const diff = DIFFICULTIES.find((d) => d.id === mission.difficulty)
  const total = mission.questions.length
  const isLast = index + 1 >= total

  return (
    <div className="quiz">
      {/* ------------------------------------------------------- Cabeçalho */}
      <header className="quiz__head">
        <div className="quiz__headrow">
          <button className="city__tool" onClick={() => setConfirmExit(true)} aria-label="Sair da missão">
            <X size={18} />
          </button>
          <div className="quiz__pips" aria-label={`Questão ${index + 1} de ${total}`}>
            {mission.questions.map((_, i) => {
              const entry = log[i]
              const cls = entry ? (entry.correct ? 'ok' : 'bad') : i === index ? 'now' : ''
              return <span key={i} className={`quiz__pip${cls ? ` quiz__pip--${cls}` : ''}`} />
            })}
          </div>
          <span className="hud-chip" style={{ color: subject.color }}>
            {index + 1}/{total}
          </span>
        </div>
      </header>

      {/* ---------------------------------------------------------- Questão */}
      <div className="qcard" key={question.uid}>
        <div className="qcard__meta">
          <Chip style={{ color: subject.color, borderColor: subject.color }}>{subject.name}</Chip>
          <Chip>{question.topic}</Chip>
          <Chip variant="bncc" title={question.bnccText}>
            {question.bncc}
          </Chip>
          <Chip style={{ color: diff.color }}>
            {diff.emoji} {diff.name}
          </Chip>
        </div>

        <h1 className="qcard__prompt">{question.prompt}</h1>
        {question.support && (
          <div className={`qcard__support${question.supportMono ? ' qcard__support--mono' : ''}`}>
            {question.support}
          </div>
        )}

        {question.type === 'mc' ? (
          <div className="options">
            {question.options.map((opt, i) => {
              let cls = ''
              if (lastAnswer) {
                const key = normalizeAnswer(opt)
                const isChosen = key === normalizeAnswer(lastAnswer.guess)
                const isRight = key === normalizeAnswer(lastAnswer.reveal?.answer ?? '')
                if (isRight) cls = ' option--right'
                else if (isChosen) cls = ' option--wrong'
                else cls = ' option--dim'
              }
              return (
                <button
                  key={opt}
                  className={`option${cls}`}
                  disabled={!!lastAnswer}
                  onClick={() => submit(opt)}
                >
                  <span className="option__key" aria-hidden="true">
                    {LETTERS[i]}
                  </span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <NumericAnswer
            value={typed}
            onChange={setTyped}
            onSubmit={() => submit(typed)}
            locked={!!lastAnswer}
            result={lastAnswer}
            unit={question.unit}
          />
        )}
      </div>

      {/* --------------------------------------------------------- Feedback */}
      {lastAnswer && (
        <div className={`feedback feedback--${lastAnswer.correct ? 'ok' : 'bad'}`}>
          <p className="feedback__title" style={{ color: lastAnswer.correct ? 'var(--green)' : 'var(--red)' }}>
            {lastAnswer.correct ? (
              <>
                <Check size={20} /> Boa!
              </>
            ) : (
              <>
                <Lightbulb size={20} /> Resposta certa: {lastAnswer.reveal?.answer}
              </>
            )}
          </p>
          {lastAnswer.reveal?.explanation && (
            <p className="feedback__text">{lastAnswer.reveal.explanation}</p>
          )}

          {lastAnswer.correct && (lastAnswer.gains.coins > 0 || lastAnswer.gains.xp > 0) && (
            <div className="feedback__gain">
              <span className="hud-chip hud-chip--gold">
                <Coins size={14} /> +{lastAnswer.gains.coins}
              </span>
              <span className="hud-chip hud-chip--cyan">
                <Zap size={14} /> +{lastAnswer.gains.xp} XP
              </span>
            </div>
          )}

          <Button
            variant={lastAnswer.correct ? 'green' : 'primary'}
            size="lg"
            block
            className="grow"
            style={{ marginTop: 12 }}
            onClick={next}
            autoFocus
          >
            {isLast ? 'Ver resultado' : 'Próxima'} <ArrowRight size={18} />
          </Button>
        </div>
      )}

      {confirmExit && (
        <Sheet title="Sair da missão?" onClose={() => setConfirmExit(false)}>
          <p className="small text-soft" style={{ marginBottom: 14 }}>
            As moedas e o XP já conquistados ficam com você, mas a missão não vai contar para as
            estatísticas nem para as missões diárias.
          </p>
          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" className="grow" onClick={() => setConfirmExit(false)}>
              Continuar jogando
            </Button>
            <Button variant="pink" className="grow" onClick={abandon}>
              Sair
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Resposta digitada — teclado próprio para não abrir o teclado do sistema,  */
/* que no celular cobre metade da tela e tira o aluno do clima de jogo.      */
/* ------------------------------------------------------------------------ */
function NumericAnswer({ value, onChange, onSubmit, locked, result, unit }) {
  // A vírgula e o sinal de menos aparecem SEMPRE. Mostrar a vírgula só em
  // questões de resposta decimal entregaria de graça que a resposta tem
  // casas decimais — e esconder o menos quebraria respostas como −2,2 °F.
  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    ',', '0', '−',
  ]

  const press = (k) => {
    if (locked) return
    if (k === 'del') return onChange(value.slice(0, -1))
    if (k === ',') {
      if (value.includes(',') || value === '' || value === '-') return
      return onChange(`${value},`)
    }
    if (k === '−') {
      return onChange(value.startsWith('-') ? value.slice(1) : `-${value}`)
    }
    if (value.replace(/[^0-9]/g, '').length >= 9) return
    onChange(value + k)
  }

  const state = locked ? (result?.correct ? 'right' : 'wrong') : value ? '' : 'empty'

  return (
    <div style={{ marginTop: 'clamp(18px, 7vh, 56px)' }}>
      <div className={`answer-display${state ? ` answer-display--${state}` : ''}`} aria-live="polite">
        {value ? (
          <span>
            {value}
            {unit ? <span style={{ fontSize: 16, marginLeft: 6, opacity: 0.7 }}>{unit}</span> : null}
          </span>
        ) : (
          <span>Digite sua resposta{unit ? ` em ${unit}` : ''}</span>
        )}
      </div>

      {!locked && (
        <>
          <div className="numpad">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                aria-label={k === ',' ? 'vírgula' : k === '−' ? 'sinal de menos' : k}
              >
                {k}
              </button>
            ))}
            <button
              onClick={() => press('del')}
              aria-label="Apagar"
              style={{ gridColumn: 'span 3' }}
            >
              <Delete size={20} style={{ margin: '0 auto' }} />
            </button>
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            style={{ marginTop: 10 }}
            disabled={!value || value === '-' || value.endsWith(',')}
            onClick={onSubmit}
          >
            Confirmar resposta
          </Button>
        </>
      )}
    </div>
  )
}
