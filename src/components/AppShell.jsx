import { Home, BookOpenText, Building2, Trophy, User, Coins, Zap, Flame } from 'lucide-react'

import { useGame, selectLevel } from '../store/useGame.js'
import { compact } from '../lib/format.js'

const NAV = [
  { id: 'home', label: 'Início', Icon: Home },
  { id: 'subjects', label: 'Missões', Icon: BookOpenText },
  { id: 'city', label: 'Meu Mundo', Icon: Building2 },
  { id: 'achievements', label: 'Troféus', Icon: Trophy },
  { id: 'profile', label: 'Perfil', Icon: User },
]

export default function AppShell({ children }) {
  const screen = useGame((s) => s.screen)
  const go = useGame((s) => s.go)
  const coins = useGame((s) => s.coins)
  const level = useGame(selectLevel)
  const streak = useGame((s) => s.streak.current)

  // "Missões" fica marcado também nas telas filhas do fluxo de missão.
  const activeNav = screen === 'setup' ? 'subjects' : screen

  return (
    <div className="shell shell--with-rail">
      <header className="topbar">
        <div className="topbar__inner">
          <button className="topbar__brand" onClick={() => go('home')} aria-label="Ir para o início">
            <span aria-hidden="true">🎓</span>
            <span>
              EDUCA<b>+</b>
            </span>
          </button>

          <div className="topbar__stats">
            <span className="hud-chip hud-chip--gold" title="Moedas">
              <Coins size={15} aria-hidden="true" />
              {compact(coins)}
              <span className="sr-only">moedas</span>
            </span>
            <span className="hud-chip hud-chip--cyan" title="Nível">
              <Zap size={15} aria-hidden="true" />
              {level}
              <span className="sr-only">nível</span>
            </span>
            {streak > 0 && (
              <span className="hud-chip hud-chip--fire" title="Dias seguidos estudando">
                <Flame size={15} aria-hidden="true" />
                {streak}
                <span className="sr-only">dias de ofensiva</span>
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="shell__main">{children}</main>

      <nav className="bottomnav" aria-label="Navegação principal">
        <div className="bottomnav__inner">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className="navbtn"
              aria-current={activeNav === id ? 'page' : undefined}
              onClick={() => go(id)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
