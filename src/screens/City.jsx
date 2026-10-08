import { useState } from 'react'
import { Store, Coins, Lock, Trash2, Building2, TrendingUp } from 'lucide-react'

import { useGame, selectLevel } from '../store/useGame.js'
import {
  BUILDINGS,
  BUILDING_BY_ID,
  BUILDING_CATEGORIES,
  cityBonuses,
  developmentIndex,
  GRID_SIZE,
} from '../data/buildings.js'
import { ECONOMY } from '../data/game.js'
import { num } from '../lib/format.js'
import { Button, Card, Chip, Sheet, Bar } from '../components/ui.jsx'
import CityCanvas from '../components/city/CityCanvas.jsx'
import { BuildingPreview } from '../components/city/BuildingArt.jsx'

export default function City() {
  const coins = useGame((s) => s.coins)
  const buildings = useGame((s) => s.city.buildings)
  const buildMode = useGame((s) => s.buildMode)
  const selectBuild = useGame((s) => s.selectBuild)
  const placeBuilding = useGame((s) => s.placeBuilding)
  const demolish = useGame((s) => s.demolish)
  const level = useGame(selectLevel)

  const [shopOpen, setShopOpen] = useState(false)
  const [picked, setPicked] = useState(null)

  const bonus = cityBonuses(buildings)
  const devIndex = developmentIndex(buildings)
  const freeTiles = GRID_SIZE * GRID_SIZE - buildings.length

  const handlePlace = (x, y) => {
    const ok = placeBuilding(x, y)
    // Mantém o modo construção ligado se ainda der para comprar outra igual.
    if (ok && buildMode) {
      const def = BUILDING_BY_ID[buildMode]
      if (!def || useGame.getState().coins < def.cost) selectBuild(buildMode)
    }
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="page-head">
        <h1>
          <Building2 size={24} /> Meu Mundo
        </h1>
        <p>Cada acerto vira moeda. Cada moeda vira cidade.</p>
      </div>

      <CityCanvas
        buildings={buildings}
        buildMode={buildMode}
        onPlace={handlePlace}
        onPickBuilding={setPicked}
      />

      <div className="row" style={{ gap: 10 }}>
        <Button
          variant={buildMode ? 'pink' : 'gold'}
          className="grow"
          size="lg"
          onClick={() => (buildMode ? selectBuild(buildMode) : setShopOpen(true))}
        >
          {buildMode ? (
            <>Cancelar construção</>
          ) : (
            <>
              <Store size={20} /> Loja do jogo
            </>
          )}
        </Button>
      </div>

      {/* ------------------------------------------------------- Indicadores */}
      <Card className="stack" style={{ gap: 10 }}>
        <div className="row-between">
          <span className="card__title">
            <TrendingUp size={17} /> Desenvolvimento
          </span>
          <span className="bold gold mono-num">{devIndex} / 100</span>
        </div>
        <Bar value={devIndex} max={100} tone="gold" label="Índice de desenvolvimento" />
        <div className="row wrap" style={{ gap: 6 }}>
          <Chip>🏗️ {buildings.length} construções</Chip>
          <Chip>🟩 {freeTiles} terrenos livres</Chip>
          {bonus.coins > 0 && <Chip>🪙 +{Math.round(bonus.coins * 100)}% moedas</Chip>}
          {bonus.xp > 0 && <Chip>⚡ +{Math.round(bonus.xp * 100)}% XP</Chip>}
        </div>
        <p className="tiny muted">
          Construções dão bônus permanente nas recompensas das missões. Conhecimento ➔ Oportunidades
          ➔ Futuro.
        </p>
      </Card>

      {/* ------------------------------------------------------------- Loja */}
      {shopOpen && (
        <Sheet title="Loja do jogo" onClose={() => setShopOpen(false)}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <span className="small muted">Suas moedas</span>
            <span className="hud-chip hud-chip--gold">
              <Coins size={15} /> {num(coins)}
            </span>
          </div>

          {BUILDING_CATEGORIES.map((cat) => {
            const items = BUILDINGS.filter((b) => b.category === cat.id)
            if (items.length === 0) return null
            return (
              <section key={cat.id} style={{ marginBottom: 18 }}>
                <h3 className="section-title" style={{ marginTop: 0 }}>
                  <span aria-hidden="true">{cat.emoji}</span> {cat.name}
                </h3>
                <div className="shop-grid">
                  {items.map((b) => {
                    const locked = level < b.unlock
                    const tooPoor = coins < b.cost
                    return (
                      <button
                        key={b.id}
                        className="shop-item"
                        aria-pressed={buildMode === b.id}
                        disabled={locked || tooPoor}
                        title={b.desc}
                        onClick={() => {
                          selectBuild(b.id)
                          setShopOpen(false)
                        }}
                      >
                        <span className="shop-item__art">
                          <BuildingPreview type={b.id} />
                        </span>
                        <span className="shop-item__name">{b.name}</span>
                        {locked ? (
                          <span className="shop-item__lock">
                            <Lock size={11} style={{ display: 'inline', verticalAlign: -1 }} /> nível{' '}
                            {b.unlock}
                          </span>
                        ) : (
                          <span className="shop-item__price">
                            <Coins size={13} /> {num(b.cost)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          <p className="tiny muted center">
            Itens bloqueados liberam conforme você sobe de nível estudando.
          </p>
        </Sheet>
      )}

      {/* -------------------------------------------- Detalhe da construção */}
      {picked && (
        <Sheet title={BUILDING_BY_ID[picked.type]?.name ?? 'Construção'} onClose={() => setPicked(null)}>
          <div className="row" style={{ gap: 14, marginBottom: 14 }}>
            <span className="shop-item__art" style={{ width: 90, height: 72 }}>
              <BuildingPreview type={picked.type} width={90} height={72} />
            </span>
            <div className="grow stack" style={{ gap: 6 }}>
              <p className="small text-soft">{BUILDING_BY_ID[picked.type]?.desc}</p>
              <div className="row wrap" style={{ gap: 6 }}>
                {BUILDING_BY_ID[picked.type]?.bonusCoins > 0 && (
                  <Chip>🪙 +{(BUILDING_BY_ID[picked.type].bonusCoins * 100).toFixed(1)}%</Chip>
                )}
                {BUILDING_BY_ID[picked.type]?.bonusXp > 0 && (
                  <Chip>⚡ +{(BUILDING_BY_ID[picked.type].bonusXp * 100).toFixed(1)}%</Chip>
                )}
                <Chip>
                  terreno {picked.x + 1}, {picked.y + 1}
                </Chip>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            block
            onClick={() => {
              demolish(picked.id)
              setPicked(null)
            }}
          >
            <Trash2 size={17} /> Demolir e recuperar{' '}
            {Math.round((BUILDING_BY_ID[picked.type]?.cost ?? 0) * ECONOMY.sellRefund)} moedas
          </Button>
        </Sheet>
      )}
    </div>
  )
}
