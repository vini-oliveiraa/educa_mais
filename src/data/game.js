/** Definições de conteúdo e economia do jogo. */

// ---------------------------------------------------------------------------
// Séries (Ensino Fundamental — Anos Finais)
// ---------------------------------------------------------------------------
export const GRADES = [
  { id: 6, label: '6º ano', age: '11 anos', hint: 'Começo do Fundamental 2' },
  { id: 7, label: '7º ano', age: '12 anos', hint: 'Inteiros, razão e proporção' },
  { id: 8, label: '8º ano', age: '13 anos', hint: 'Álgebra e energia' },
  { id: 9, label: '9º ano', age: '14 anos', hint: 'Preparação para o Médio' },
]

// ---------------------------------------------------------------------------
// Matérias
// ---------------------------------------------------------------------------
export const SUBJECTS = [
  {
    id: 'matematica',
    name: 'Matemática',
    short: 'Mat',
    icon: 'Calculator',
    color: 'var(--sub-matematica)',
    emoji: '🔢',
    blurb: 'Números, álgebra, geometria e medidas.',
  },
  {
    id: 'portugues',
    name: 'Português',
    short: 'Port',
    icon: 'BookOpenText',
    color: 'var(--sub-portugues)',
    emoji: '📖',
    blurb: 'Gramática, leitura e interpretação.',
  },
  {
    id: 'ciencias',
    name: 'Ciências',
    short: 'Ciê',
    icon: 'FlaskConical',
    color: 'var(--sub-ciencias)',
    emoji: '🔬',
    blurb: 'Matéria, energia, vida e universo.',
  },
  {
    id: 'historia',
    name: 'História',
    short: 'Hist',
    icon: 'Landmark',
    color: 'var(--sub-historia)',
    emoji: '🏛️',
    blurb: 'Sociedades, tempo e memória.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    short: 'Geo',
    icon: 'Globe2',
    color: 'var(--sub-geografia)',
    emoji: '🌎',
    blurb: 'Espaço, natureza e população.',
  },
  {
    id: 'ingles',
    name: 'Inglês',
    short: 'Ing',
    icon: 'Languages',
    color: 'var(--sub-ingles)',
    emoji: '🇬🇧',
    blurb: 'Vocabulário, gramática e leitura.',
  },
]

export const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]))

// ---------------------------------------------------------------------------
// Níveis de dificuldade da missão
// ---------------------------------------------------------------------------
export const DIFFICULTIES = [
  {
    id: 1,
    name: 'Explorador',
    emoji: '🌱',
    desc: 'Aquecimento: conceitos diretos.',
    coinMult: 1,
    xpMult: 1,
    color: 'var(--green)',
  },
  {
    id: 2,
    name: 'Aventureiro',
    emoji: '⚔️',
    desc: 'Dois passos de raciocínio.',
    coinMult: 1.6,
    xpMult: 1.6,
    color: 'var(--cyan)',
  },
  {
    id: 3,
    name: 'Mestre',
    emoji: '👑',
    desc: 'Problemas compostos e pegadinhas.',
    coinMult: 2.4,
    xpMult: 2.4,
    color: 'var(--gold)',
  },
]

export const QUESTIONS_PER_MISSION = 8

// ---------------------------------------------------------------------------
// Economia
// ---------------------------------------------------------------------------
export const ECONOMY = {
  coinsPerCorrect: 12,
  xpPerCorrect: 18,
  perfectBonusCoins: 60,
  perfectBonusXp: 90,
  comboStep: 0.15, // +15% por acerto seguido
  comboMax: 2, // teto de 2x
  streakDayBonus: 0.05, // +5% por dia de ofensiva (teto 50%)
  streakBonusMax: 0.5,
  firstMissionOfDayCoins: 40,
  sellRefund: 0.5, // devolve 50% ao demolir
}

// ---------------------------------------------------------------------------
// Progressão de nível
// XP acumulado necessário para chegar ao nível N.
// ---------------------------------------------------------------------------
export function xpForLevel(level) {
  if (level <= 1) return 0
  return Math.round(80 * Math.pow(level - 1, 1.45) + 60 * (level - 1))
}

export function levelFromXp(xp) {
  let level = 1
  while (level < 99 && xp >= xpForLevel(level + 1)) level++
  return level
}

export function levelProgress(xp) {
  const level = levelFromXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    level,
    current: xp - base,
    needed: next - base,
    ratio: next === base ? 1 : Math.min(1, (xp - base) / (next - base)),
    nextLevelXp: next,
  }
}

/** Títulos desbloqueados por nível — aparecem no perfil. */
export const LEVEL_TITLES = [
  { level: 1, title: 'Aprendiz' },
  { level: 3, title: 'Explorador' },
  { level: 5, title: 'Construtor' },
  { level: 8, title: 'Arquiteto' },
  { level: 12, title: 'Engenheiro' },
  { level: 16, title: 'Prefeito' },
  { level: 22, title: 'Governador' },
  { level: 30, title: 'Lenda do Saber' },
]

export function titleForLevel(level) {
  let t = LEVEL_TITLES[0].title
  for (const entry of LEVEL_TITLES) if (level >= entry.level) t = entry.title
  return t
}

// ---------------------------------------------------------------------------
// Avatares (emoji = zero peso, zero licença, funciona offline)
// ---------------------------------------------------------------------------
export const AVATARS = [
  '🦊', '🐼', '🐸', '🦉', '🐯', '🦁',
  '🐨', '🐵', '🦄', '🐙', '🦖', '🐬',
  '🤖', '👾', '🚀', '⚡', '🌟', '🔥',
]

// ---------------------------------------------------------------------------
// Conquistas
// ---------------------------------------------------------------------------
export const ACHIEVEMENTS = [
  { id: 'first-mission', icon: '🎯', name: 'Primeira Missão', desc: 'Conclua sua primeira missão.', check: (s) => s.stats.missions >= 1 },
  { id: 'ten-correct', icon: '✅', name: 'Dez na Cabeça', desc: 'Acerte 10 questões no total.', check: (s) => s.stats.correct >= 10 },
  { id: 'hundred-correct', icon: '💯', name: 'Centenário', desc: 'Acerte 100 questões no total.', check: (s) => s.stats.correct >= 100 },
  { id: 'five-hundred', icon: '🧠', name: 'Cérebro de Ouro', desc: 'Acerte 500 questões no total.', check: (s) => s.stats.correct >= 500 },
  { id: 'perfect', icon: '🌟', name: 'Gabaritou!', desc: 'Acerte todas as questões de uma missão.', check: (s) => s.stats.perfects >= 1 },
  { id: 'perfect-5', icon: '✨', name: 'Impecável', desc: 'Gabarite 5 missões.', check: (s) => s.stats.perfects >= 5 },
  { id: 'combo-8', icon: '🔥', name: 'Em Chamas', desc: 'Faça 8 acertos seguidos.', check: (s) => s.stats.bestCombo >= 8 },
  { id: 'streak-3', icon: '📅', name: 'Constância', desc: 'Estude 3 dias seguidos.', check: (s) => s.streak.best >= 3 },
  { id: 'streak-7', icon: '🗓️', name: 'Semana Cheia', desc: 'Estude 7 dias seguidos.', check: (s) => s.streak.best >= 7 },
  { id: 'builder-1', icon: '🏠', name: 'Lar Doce Lar', desc: 'Construa sua primeira edificação.', check: (s) => s.city.buildings.length >= 1 },
  { id: 'builder-10', icon: '🏘️', name: 'Vila Animada', desc: 'Tenha 10 construções na cidade.', check: (s) => s.city.buildings.length >= 10 },
  { id: 'builder-25', icon: '🏙️', name: 'Metrópole', desc: 'Tenha 25 construções na cidade.', check: (s) => s.city.buildings.length >= 25 },
  { id: 'rich', icon: '💰', name: 'Cofre Cheio', desc: 'Acumule 2.000 moedas.', check: (s) => s.coins >= 2000 },
  { id: 'level-5', icon: '⬆️', name: 'Subindo de Nível', desc: 'Alcance o nível 5.', check: (s) => s.level >= 5 },
  { id: 'level-10', icon: '🏆', name: 'Veterano', desc: 'Alcance o nível 10.', check: (s) => s.level >= 10 },
  { id: 'polymath', icon: '🎓', name: 'Polímata', desc: 'Conclua ao menos 1 missão em cada matéria.', check: (s) => Object.values(s.stats.bySubject).filter((v) => v.missions > 0).length >= 6 },
  { id: 'master-mode', icon: '👑', name: 'Modo Mestre', desc: 'Gabarite uma missão no nível Mestre.', check: (s) => s.stats.masterPerfects >= 1 },
  { id: 'city-planner', icon: '🗺️', name: 'Urbanista', desc: 'Construa 6 tipos diferentes de edificação.', check: (s) => new Set(s.city.buildings.map((b) => b.type)).size >= 6 },
]

// ---------------------------------------------------------------------------
// Missões diárias — sorteadas por dia, a partir de um catálogo
// ---------------------------------------------------------------------------
export const DAILY_POOL = [
  { id: 'd-correct-10', label: 'Acerte 10 questões hoje', goal: 10, reward: 70, track: 'correct' },
  { id: 'd-correct-20', label: 'Acerte 20 questões hoje', goal: 20, reward: 140, track: 'correct' },
  { id: 'd-missions-2', label: 'Conclua 2 missões hoje', goal: 2, reward: 90, track: 'missions' },
  { id: 'd-missions-3', label: 'Conclua 3 missões hoje', goal: 3, reward: 150, track: 'missions' },
  { id: 'd-perfect-1', label: 'Gabarite 1 missão hoje', goal: 1, reward: 120, track: 'perfects' },
  { id: 'd-build-1', label: 'Construa 1 edificação hoje', goal: 1, reward: 60, track: 'builds' },
  { id: 'd-subjects-2', label: 'Estude 2 matérias diferentes hoje', goal: 2, reward: 100, track: 'subjects' },
  { id: 'd-combo-5', label: 'Faça 5 acertos seguidos', goal: 5, reward: 80, track: 'combo' },
  { id: 'd-math-1', label: 'Conclua 1 missão de Matemática', goal: 1, reward: 80, track: 'missions:matematica' },
  { id: 'd-port-1', label: 'Conclua 1 missão de Português', goal: 1, reward: 80, track: 'missions:portugues' },
]
