import { useState } from 'react'
import { User, Download, Upload, RotateCcw, Database, Info, GraduationCap } from 'lucide-react'

import { useGame, selectLevel } from '../store/useGame.js'
import { AVATARS, GRADES, SUBJECTS, titleForLevel, levelProgress } from '../data/game.js'
import { useBank } from '../data/bankLoader.js'
import { exportSave, importSave, getAdapterName } from '../services/persistence.js'
import { num, compact, prettyDate } from '../lib/format.js'
import { Button, Card, Bar, Chip, Sheet, LevelRing } from '../components/ui.jsx'

export default function Profile() {
  const profile = useGame((s) => s.profile)
  const xp = useGame((s) => s.xp)
  const coins = useGame((s) => s.coins)
  const stats = useGame((s) => s.stats)
  const streak = useGame((s) => s.streak)
  const achievements = useGame((s) => s.achievements)
  const updateProfile = useGame((s) => s.updateProfile)
  const resetProgress = useGame((s) => s.resetProgress)
  const toast = useGame((s) => s.toast)
  const bank = useBank()
  const bankInfo = bank ? bank.bankStats() : null

  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [about, setAbout] = useState(false)
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [grade, setGrade] = useState(profile.grade)

  const level = useGame(selectLevel)
  const prog = levelProgress(xp)
  const totalRespostas = stats.correct + stats.wrong
  const aproveitamento = totalRespostas > 0 ? Math.round((stats.correct / totalRespostas) * 100) : 0

  const baixarSave = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `educa-mais-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Progresso exportado.', 'green', '💾')
  }

  const carregarSave = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (importSave(String(reader.result))) {
        toast('Progresso importado. Recarregando…', 'green', '📥')
        setTimeout(() => window.location.reload(), 900)
      } else {
        toast('Arquivo inválido.', 'pink', '⚠️')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="page-head">
        <h1>
          <User size={24} /> Perfil
        </h1>
      </div>

      {/* --------------------------------------------------------- Cartão */}
      <Card glow topline className="row" style={{ gap: 14 }}>
        <div className="hero__avatar" aria-hidden="true">
          {profile.avatar}
        </div>
        <div className="grow stack" style={{ gap: 4 }}>
          <p className="display" style={{ fontSize: 21 }}>
            {profile.name}
          </p>
          <p className="tiny muted bold">
            {titleForLevel(level)} · {GRADES.find((g) => g.id === profile.grade)?.label}
          </p>
          <Bar value={prog.current} max={prog.needed} tone="gold" label="Progresso de nível" />
          <p className="tiny muted mono-num">
            {num(prog.current)} / {num(prog.needed)} XP
          </p>
        </div>
        <LevelRing ratio={prog.ratio} level={level} />
      </Card>

      <Button variant="ghost" block onClick={() => setEditing(true)}>
        <GraduationCap size={18} /> Editar perfil e série
      </Button>

      {/* ----------------------------------------------------- Estatísticas */}
      <section>
        <h2 className="section-title">Suas estatísticas</h2>
        <Card>
          <div className="stat-line">
            <span>Missões concluídas</span>
            <b>{num(stats.missions)}</b>
          </div>
          <div className="stat-line">
            <span>Questões respondidas</span>
            <b>{num(totalRespostas)}</b>
          </div>
          <div className="stat-line">
            <span>Aproveitamento</span>
            <b className={aproveitamento >= 70 ? 'green' : ''}>{aproveitamento}%</b>
          </div>
          <div className="stat-line">
            <span>Missões gabaritadas</span>
            <b className="gold">{num(stats.perfects)}</b>
          </div>
          <div className="stat-line">
            <span>Maior sequência de acertos</span>
            <b>{num(stats.bestCombo)}</b>
          </div>
          <div className="stat-line">
            <span>Ofensiva atual · recorde</span>
            <b>
              {streak.current} · {streak.best} dias
            </b>
          </div>
          <div className="stat-line">
            <span>Moedas acumuladas</span>
            <b className="gold">{num(coins)}</b>
          </div>
          <div className="stat-line">
            <span>Conquistas</span>
            <b>{achievements.length}</b>
          </div>
          {streak.lastDay && (
            <div className="stat-line">
              <span>Último dia estudado</span>
              <b>{prettyDate(streak.lastDay)}</b>
            </div>
          )}
        </Card>
      </section>

      {/* ----------------------------------------------- Desempenho por matéria */}
      <section>
        <h2 className="section-title">Desempenho por matéria</h2>
        <Card className="stack" style={{ gap: 12 }}>
          {SUBJECTS.map((s) => {
            const st = stats.bySubject[s.id]
            const total = st.correct + st.wrong
            const pct = total > 0 ? Math.round((st.correct / total) * 100) : 0
            return (
              <div key={s.id} className="stack" style={{ gap: 5 }}>
                <div className="row-between">
                  <span className="small bold" style={{ color: s.color }}>
                    {s.emoji} {s.name}
                  </span>
                  <span className="tiny muted mono-num">
                    {total > 0 ? `${st.correct}/${total} · ${pct}%` : 'sem dados'}
                  </span>
                </div>
                <Bar value={st.correct} max={Math.max(1, total)} tone={pct >= 70 ? 'green' : undefined} thin />
              </div>
            )
          })}
        </Card>
      </section>

      {/* ------------------------------------------------------------ Dados */}
      <section>
        <h2 className="section-title">
          <Database size={16} /> Seus dados
        </h2>
        <Card className="stack" style={{ gap: 10 }}>
          <p className="small text-soft">
            O progresso está salvo <strong>somente neste navegador</strong> ({getAdapterName()}).
            Exporte um arquivo se quiser continuar em outro aparelho.
          </p>
          <div className="row wrap" style={{ gap: 10 }}>
            <Button variant="ghost" size="sm" onClick={baixarSave}>
              <Download size={16} /> Exportar
            </Button>
            <label className="btn btn--ghost btn--sm" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Importar
              <input type="file" accept="application/json" onChange={carregarSave} hidden />
            </label>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={16} /> Recomeçar
            </Button>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------------ Sobre */}
      <Button variant="ghost" block onClick={() => setAbout(true)}>
        <Info size={18} /> Sobre o Educa+
      </Button>

      {/* ----------------------------------------------------------- Sheets */}
      {editing && (
        <Sheet title="Editar perfil" onClose={() => setEditing(false)}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="edit-nome">Nome</label>
              <input
                id="edit-nome"
                className="input"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label id="edit-avatar">Avatar</label>
              <div className="avatar-grid" role="group" aria-labelledby="edit-avatar">
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
              <label id="edit-serie">Série</label>
              <div className="grade-grid" role="group" aria-labelledby="edit-serie">
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
              <p className="tiny muted">
                Trocar de série muda as questões das próximas missões. Seu progresso e sua cidade
                continuam.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => {
                updateProfile({ name: name.trim() || profile.name, avatar, grade })
                setEditing(false)
                toast('Perfil atualizado.', 'green', '✅')
              }}
            >
              Salvar
            </Button>
          </div>
        </Sheet>
      )}

      {confirmReset && (
        <Sheet title="Recomeçar do zero?" onClose={() => setConfirmReset(false)}>
          <p className="small text-soft" style={{ marginBottom: 14 }}>
            Isso apaga o perfil, as moedas, o XP, as conquistas e toda a cidade. Não dá para
            desfazer. Se quiser guardar, exporte o progresso antes.
          </p>
          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" className="grow" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button variant="pink" className="grow" onClick={resetProgress}>
              Apagar tudo
            </Button>
          </div>
        </Sheet>
      )}

      {about && (
        <Sheet title="Sobre o Educa+" onClose={() => setAbout(false)}>
          <div className="stack" style={{ gap: 12 }}>
            <p className="small text-soft">
              Educa+ é uma plataforma gamificada de estudos para o Ensino Fundamental — Anos Finais.
              Cada questão resolvida gera moedas e XP, que viram construções na sua cidade.
            </p>

            <Card className="stack" style={{ gap: 8 }}>
              <p className="card__title">Banco de questões</p>
              {bankInfo ? (
                <>
                  <div className="row wrap" style={{ gap: 6 }}>
                    <Chip>{bankInfo.templates} geradores</Chip>
                    <Chip>~{compact(bankInfo.variants)} questões possíveis</Chip>
                    <Chip>{bankInfo.bnccCodes} habilidades BNCC</Chip>
                  </div>
                  <p className="tiny muted">
                    As questões não são fixas: cada gerador sorteia números, nomes e contextos a
                    cada rodada.
                  </p>
                </>
              ) : (
                <p className="small muted">Carregando banco…</p>
              )}
            </Card>

            {bankInfo && (
              <Card className="stack" style={{ gap: 6 }}>
                <p className="card__title">Por matéria</p>
                {SUBJECTS.map((s) => (
                  <div key={s.id} className="stat-line">
                    <span className="small">
                      {s.emoji} {s.name}
                    </span>
                    <b className="small">{bankInfo.bySubject[s.id]?.templates ?? 0} geradores</b>
                  </div>
                ))}
              </Card>
            )}

            <p className="tiny muted">
              Demo sem servidor: nenhum dado sai deste navegador. Veja docs/ARQUITETURA.md para o
              plano de banco de dados, validação server-side e geração de questões por LLM.
            </p>
          </div>
        </Sheet>
      )}
    </div>
  )
}
