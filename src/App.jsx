import { Suspense, lazy, useEffect } from 'react'

import { useGame } from './store/useGame.js'
import { prefetchBank } from './data/bankLoader.js'
import { Toasts, Confetti } from './components/ui.jsx'
import AppShell from './components/AppShell.jsx'

import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import Subjects from './screens/Subjects.jsx'
import MissionSetup from './screens/MissionSetup.jsx'
import Quiz from './screens/Quiz.jsx'
import Result from './screens/Result.jsx'
import Achievements from './screens/Achievements.jsx'
import Profile from './screens/Profile.jsx'

// A cidade carrega sob demanda: o SVG isométrico e os sprites só entram no
// bundle quando o aluno abre "Meu Mundo".
const City = lazy(() => import('./screens/City.jsx'))

/** Telas que ocupam a janela inteira, sem barra superior nem navegação. */
const FULLSCREEN = new Set(['onboarding', 'quiz', 'result'])

export default function App() {
  const screen = useGame((s) => s.screen)
  const profile = useGame((s) => s.profile)
  const toasts = useGame((s) => s.toasts)
  const confetti = useGame((s) => s.confetti)
  const dismissToast = useGame((s) => s.dismissToast)
  const refreshDay = useGame((s) => s.refreshDay)
  const missionLoading = useGame((s) => s.missionLoading)

  // Vira o dia enquanto o app está aberto (e ao voltar para a aba).
  useEffect(() => {
    refreshDay()
    const onVisible = () => document.visibilityState === 'visible' && refreshDay()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshDay])

  // Banco de questões entra em segundo plano, depois da primeira pintura.
  useEffect(() => {
    prefetchBank()
  }, [])

  const active = !profile ? 'onboarding' : screen

  const content = (() => {
    switch (active) {
      case 'onboarding':
        return <Onboarding />
      case 'subjects':
        return <Subjects />
      case 'setup':
        return <MissionSetup />
      case 'quiz':
        return <Quiz />
      case 'result':
        return <Result />
      case 'city':
        return (
          <Suspense fallback={<CityFallback />}>
            <City />
          </Suspense>
        )
      case 'achievements':
        return <Achievements />
      case 'profile':
        return <Profile />
      default:
        return <Home />
    }
  })()

  return (
    <>
      {FULLSCREEN.has(active) ? content : <AppShell>{content}</AppShell>}
      {missionLoading && <MissionLoading />}
      <Toasts items={toasts} onDismiss={dismissToast} />
      <Confetti trigger={confetti} />
    </>
  )
}

function CityFallback() {
  return (
    <div className="city" style={{ display: 'grid', placeItems: 'center' }}>
      <span className="muted small">Carregando sua cidade…</span>
    </div>
  )
}

function MissionLoading() {
  return (
    <div className="overlay" style={{ alignItems: 'center' }} role="status" aria-live="polite">
      <div className="center stack" style={{ gap: 14, justifyItems: 'center' }}>
        <div className="boot-logo" style={{ fontSize: 28 }}>
          Preparando sua missão…
        </div>
        <div className="boot-bar">
          <span />
        </div>
      </div>
    </div>
  )
}
