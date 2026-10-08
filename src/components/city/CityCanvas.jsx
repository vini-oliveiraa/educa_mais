import { useCallback, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Crosshair } from 'lucide-react'

import BuildingArt, { HW, HH } from './BuildingArt.jsx'
import { GRID_SIZE } from '../../data/buildings.js'

/**
 * Tabuleiro isométrico da cidade.
 *
 * Projeção: screenX = (x − y)·HW, screenY = (x + y)·HH.
 * Desenho em ordem de profundidade (x + y crescente) — painter's algorithm —
 * para que as construções da frente cubram as de trás.
 *
 * Interação: arrastar move a câmera, pinça com dois dedos dá zoom, e um toque
 * curto é tratado como clique no terreno. O limiar de 8 px evita que um arraste
 * trêmulo no celular vire construção acidental.
 */

const VIEW_W = 640
const VIEW_H = 400
const OX = 320
const OY = 70
const TAP_THRESHOLD = 8

const toScreen = (x, y) => ({ sx: (x - y) * HW + OX, sy: (x + y) * HH + OY })

export default function CityCanvas({ buildings, buildMode, onPlace, onPickBuilding }) {
  const svgRef = useRef(null)
  const layerRef = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef(null)

  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 })
  const [hover, setHover] = useState(null)

  const occupied = useMemo(() => {
    const map = new Map()
    buildings.forEach((b) => map.set(`${b.x},${b.y}`, b))
    return map
  }, [buildings])

  /** Converte coordenadas de tela para a célula do grid. */
  const cellFromEvent = useCallback((e) => {
    const layer = layerRef.current
    if (!layer || !layer.getScreenCTM) return null
    const ctm = layer.getScreenCTM()
    if (!ctm) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const a = (pt.x - OX) / HW
    const b = (pt.y - OY) / HH
    const x = Math.round((a + b) / 2)
    const y = Math.round((b - a) / 2)
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return null
    return { x, y }
  }, [])

  // ------------------------------------------------------------ gestos
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 1) {
      gesture.current = { mode: 'pan', startX: e.clientX, startY: e.clientY, tx: view.tx, ty: view.ty, moved: 0 }
    } else if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()]
      gesture.current = {
        mode: 'pinch',
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        scale: view.scale,
      }
    }
  }

  const onPointerMove = (e) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    const g = gesture.current
    if (!g) {
      if (buildMode && e.pointerType === 'mouse') setHover(cellFromEvent(e))
      return
    }

    if (g.mode === 'pan') {
      const dx = e.clientX - g.startX
      const dy = e.clientY - g.startY
      g.moved = Math.max(g.moved, Math.hypot(dx, dy))
      setView((v) => ({ ...v, tx: g.tx + dx, ty: g.ty + dy }))
    } else if (g.mode === 'pinch' && pointers.current.size >= 2) {
      const [p1, p2] = [...pointers.current.values()]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const scale = clamp(g.scale * (dist / (g.dist || 1)), 0.55, 2.4)
      setView((v) => ({ ...v, scale }))
    }
  }

  const onPointerUp = (e) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)

    if (g?.mode === 'pan' && g.moved < TAP_THRESHOLD) {
      const cell = cellFromEvent(e)
      if (cell) {
        const existing = occupied.get(`${cell.x},${cell.y}`)
        if (existing) onPickBuilding?.(existing)
        else if (buildMode) onPlace?.(cell.x, cell.y)
      }
    }
    if (pointers.current.size === 0) gesture.current = null
  }

  const zoom = (delta) => setView((v) => ({ ...v, scale: clamp(v.scale + delta, 0.55, 2.4) }))
  const recenter = () => setView({ scale: 1, tx: 0, ty: 0 })

  // ------------------------------------------------------------ desenho
  const tiles = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const { sx, sy } = toScreen(x, y)
      const shade = (x * 7 + y * 13) % 3
      const isHover = hover && hover.x === x && hover.y === y
      const free = !occupied.has(`${x},${y}`)
      tiles.push(
        <polygon
          key={`${x}-${y}`}
          points={`${sx},${sy - HH} ${sx + HW},${sy} ${sx},${sy + HH} ${sx - HW},${sy}`}
          fill={isHover && free ? '#6ee7a8' : ['#4aa65c', '#45a057', '#4fab61'][shade]}
          stroke={buildMode && free ? 'rgba(255,255,255,.26)' : 'rgba(0,0,0,.08)'}
          strokeWidth="1"
        />,
      )
    }
  }

  const sorted = [...buildings].sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x)

  const island = [
    toScreen(-0.5, -0.5),
    toScreen(GRID_SIZE - 0.5, -0.5),
    toScreen(GRID_SIZE - 0.5, GRID_SIZE - 0.5),
    toScreen(-0.5, GRID_SIZE - 0.5),
  ]
  const islandPoints = island.map((p) => `${p.sx},${p.sy}`).join(' ')
  const skirt = 22

  return (
    <div className="city">
      <svg
        ref={svgRef}
        className="city__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        role="application"
        aria-label="Mapa da sua cidade"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2a6b" />
            <stop offset="1" stopColor="#2f4aa0" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.2" r="0.8">
            <stop offset="0" stopColor="#5b86ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5b86ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#sky)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#glow)" />

        <g
          ref={layerRef}
          transform={`translate(${view.tx} ${view.ty}) translate(${VIEW_W / 2} ${VIEW_H / 2}) scale(${view.scale}) translate(${-VIEW_W / 2} ${-VIEW_H / 2})`}
        >
          {/* lateral da ilha (terra) */}
          <polygon
            points={`${island[3].sx},${island[3].sy} ${island[2].sx},${island[2].sy} ${island[1].sx},${island[1].sy} ${island[1].sx},${island[1].sy + skirt} ${island[2].sx},${island[2].sy + skirt} ${island[3].sx},${island[3].sy + skirt}`}
            fill="#8a6240"
          />
          <polygon points={islandPoints} fill="#3f8a46" />

          {tiles}

          {sorted.map((b) => {
            const { sx, sy } = toScreen(b.x, b.y)
            return (
              <g key={b.id} transform={`translate(${sx} ${sy})`} style={{ cursor: 'pointer' }}>
                <BuildingArt type={b.type} />
              </g>
            )
          })}
        </g>
      </svg>

      <div className="city__tools">
        <button className="city__tool" onClick={() => zoom(0.2)} aria-label="Aproximar">
          <ZoomIn size={17} />
        </button>
        <button className="city__tool" onClick={() => zoom(-0.2)} aria-label="Afastar">
          <ZoomOut size={17} />
        </button>
        <button className="city__tool" onClick={recenter} aria-label="Centralizar">
          <Crosshair size={17} />
        </button>
      </div>

      {buildMode && (
        <div className="city__banner">
          <span aria-hidden="true">🏗️</span>
          <span>Toque em um terreno livre para construir</span>
        </div>
      )}

      <p className="city__hint">Arraste para mover · pinça ou botões para o zoom</p>
    </div>
  )
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
