/**
 * Catálogo de edificações do "Meu Mundo".
 *
 * Arte: todas as construções são SVG isométrico desenhado no próprio projeto
 * (src/components/city/BuildingArt.jsx). Isso evita depender de banco de
 * imagens externo, mantém licença livre, pesa poucos kB, escala sem borrar em
 * tela retina e permite recolorir por CSS. Ver docs/ARQUITETURA.md › "Arte".
 *
 * Economia: cada construção dá um bônus permanente pequeno em moedas ou XP.
 * O objetivo pedagógico é o aluno perceber que estudar -> constrói -> estudar
 * fica mais recompensador (laço de reforço positivo), sem transformar o jogo
 * numa corrida de números: o bônus total é limitado em GRID/ECONOMY.
 */

export const GRID_SIZE = 9 // tabuleiro 9 x 9 = 81 terrenos

export const BUILDING_CATEGORIES = [
  { id: 'natureza', name: 'Natureza', emoji: '🌳' },
  { id: 'moradia', name: 'Moradia', emoji: '🏠' },
  { id: 'cidade', name: 'Cidade', emoji: '🏬' },
  { id: 'saber', name: 'Saber', emoji: '🎓' },
  { id: 'lendario', name: 'Lendário', emoji: '✨' },
]

/**
 * bonusCoins / bonusXp: fração somada ao multiplicador de recompensas.
 * unlock: nível mínimo do jogador.
 */
export const BUILDINGS = [
  // --- Natureza ---
  { id: 'arvore', name: 'Árvore', category: 'natureza', cost: 50, unlock: 1, bonusCoins: 0.004, bonusXp: 0, desc: 'Barata e bonita. Deixe a cidade verde.' },
  { id: 'canteiro', name: 'Canteiro', category: 'natureza', cost: 70, unlock: 1, bonusCoins: 0.005, bonusXp: 0, desc: 'Flores que animam qualquer esquina.' },
  { id: 'lago', name: 'Lago', category: 'natureza', cost: 320, unlock: 3, bonusCoins: 0.01, bonusXp: 0.004, desc: 'Um respiro de água no meio do bairro.' },
  { id: 'parque', name: 'Parque', category: 'natureza', cost: 900, unlock: 4, bonusCoins: 0.018, bonusXp: 0.012, desc: 'Playground e área de lazer para a vizinhança.' },

  // --- Moradia ---
  { id: 'casa', name: 'Casa', category: 'moradia', cost: 500, unlock: 1, bonusCoins: 0.015, bonusXp: 0, desc: 'A primeira família da sua cidade.' },
  { id: 'sobrado', name: 'Sobrado', category: 'moradia', cost: 1200, unlock: 3, bonusCoins: 0.026, bonusXp: 0, desc: 'Dois andares, quintal e varanda.' },
  { id: 'predio', name: 'Prédio', category: 'moradia', cost: 2400, unlock: 7, bonusCoins: 0.045, bonusXp: 0.008, desc: 'Mais moradores no mesmo terreno.' },

  // --- Cidade ---
  { id: 'poste', name: 'Poste de Luz', category: 'cidade', cost: 120, unlock: 2, bonusCoins: 0.006, bonusXp: 0.002, desc: 'Ilumina a rua e dá segurança.' },
  { id: 'fonte', name: 'Fonte', category: 'cidade', cost: 450, unlock: 3, bonusCoins: 0.012, bonusXp: 0.006, desc: 'O centro da praça principal.' },
  { id: 'loja', name: 'Loja', category: 'cidade', cost: 1000, unlock: 3, bonusCoins: 0.03, bonusXp: 0, desc: 'Comércio gera renda para a cidade.' },
  { id: 'padaria', name: 'Padaria', category: 'cidade', cost: 1400, unlock: 5, bonusCoins: 0.034, bonusXp: 0.004, desc: 'O cheirinho de pão quente às 6h.' },
  { id: 'hospital', name: 'Hospital', category: 'cidade', cost: 2800, unlock: 6, bonusCoins: 0.03, bonusXp: 0.025, desc: 'Cuida de quem constrói a cidade.' },
  { id: 'estadio', name: 'Estádio', category: 'cidade', cost: 5200, unlock: 9, bonusCoins: 0.06, bonusXp: 0.02, desc: 'Domingo de jogo lotado.' },

  // --- Saber ---
  { id: 'biblioteca', name: 'Biblioteca', category: 'saber', cost: 1600, unlock: 4, bonusCoins: 0.008, bonusXp: 0.04, desc: '+XP: todo acerto vale mais estudando perto dos livros.' },
  { id: 'escola', name: 'Escola', category: 'saber', cost: 2000, unlock: 5, bonusCoins: 0.012, bonusXp: 0.05, desc: 'O coração do Educa+.' },
  { id: 'laboratorio', name: 'Laboratório', category: 'saber', cost: 3400, unlock: 8, bonusCoins: 0.02, bonusXp: 0.055, desc: 'Ciência aplicada, experimentos e descobertas.' },
  { id: 'observatorio', name: 'Observatório', category: 'saber', cost: 5600, unlock: 11, bonusCoins: 0.025, bonusXp: 0.07, desc: 'Para olhar além do bairro: o universo.' },

  // --- Lendário ---
  { id: 'centro-espacial', name: 'Centro Espacial', category: 'lendario', cost: 9000, unlock: 14, bonusCoins: 0.07, bonusXp: 0.08, desc: 'Conhecimento ➔ Oportunidades ➔ Futuro.' },
  { id: 'monumento', name: 'Monumento Educa+', category: 'lendario', cost: 14000, unlock: 16, bonusCoins: 0.1, bonusXp: 0.1, desc: 'O símbolo de quem transformou estudo em cidade.' },
]

export const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]))

/** Teto dos bônus, para a economia não explodir numa cidade lotada. */
export const BONUS_CAP = 1.0

export function cityBonuses(buildings) {
  let coins = 0
  let xp = 0
  for (const b of buildings) {
    const def = BUILDING_BY_ID[b.type]
    if (!def) continue
    coins += def.bonusCoins || 0
    xp += def.bonusXp || 0
  }
  return {
    coins: Math.min(coins, BONUS_CAP),
    xp: Math.min(xp, BONUS_CAP),
  }
}

/** Índice de desenvolvimento: 0-100, mostrado no topo da cidade. */
export function developmentIndex(buildings) {
  const value = buildings.reduce((acc, b) => acc + Math.sqrt(BUILDING_BY_ID[b.type]?.cost ?? 0), 0)
  return Math.min(100, Math.round((value / 9) * 10) / 10)
}
