import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

/* ------------------------------------------------------------------ Botão */
export function Button({ variant = 'default', size, block, className = '', children, ...rest }) {
  const classes = [
    'btn',
    variant !== 'default' && `btn--${variant}`,
    size && `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ Card */
export function Card({ glow, topline, className = '', children, ...rest }) {
  const classes = ['card', glow && 'card--glow', topline && 'card--topline', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

/* ------------------------------------------------- Barra de progresso */
export function Bar({ value, max = 1, tone, thin, label }) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={['bar', tone && `bar--${tone}`, thin && 'bar--thin'].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="bar__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ------------------------------------------------------------------ Chip */
export function Chip({ variant, className = '', children, ...rest }) {
  return (
    <span className={['chip', variant && `chip--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------- Ícone em caixa */
export function IconBadge({ color, small, children }) {
  return (
    <span className={`icon-badge${small ? ' icon-badge--sm' : ''}`} style={{ color }}>
      {children}
    </span>
  )
}

/* --------------------------------------------- Anel de nível (circular) */
export function LevelRing({ ratio, level, size = 56 }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="level-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, ratio)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span>{level}</span>
    </div>
  )
}

/* ----------------------------------------------------- Sheet / modal */
export function Sheet({ title, onClose, children, footer }) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="sheet__grab" />
        {title && (
          <div className="row-between" style={{ marginBottom: 12 }}>
            <h2 className="card__title">{title}</h2>
            <button className="city__tool" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
        {footer}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- Toasts */
export function Toasts({ items, onDismiss }) {
  useEffect(() => {
    if (items.length === 0) return undefined
    const timers = items.map((t) => setTimeout(() => onDismiss(t.id), 3400))
    return () => timers.forEach(clearTimeout)
  }, [items, onDismiss])

  if (items.length === 0) return null
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.slice(-3).map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>
            {t.icon}
          </span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ Confetti */
const CONFETTI_COLORS = ['#29c6f7', '#ffc93c', '#ff3d8b', '#9b5cf6', '#2ee6a8']

export function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!trigger) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    const next = Array.from({ length: 70 }, (_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 3600)
    return () => clearTimeout(t)
  }, [trigger])

  if (pieces.length === 0) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- Vazio */
export function Empty({ icon = '🗺️', title, children }) {
  return (
    <div className="empty">
      <div style={{ fontSize: 40 }} aria-hidden="true">
        {icon}
      </div>
      <strong className="display">{title}</strong>
      {children && <p className="small muted">{children}</p>}
    </div>
  )
}
