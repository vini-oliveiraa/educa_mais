import { Calculator, BookOpenText, FlaskConical, Landmark, Globe2, Languages } from 'lucide-react'

const MAP = {
  Calculator,
  BookOpenText,
  FlaskConical,
  Landmark,
  Globe2,
  Languages,
}

/** Resolve o ícone da matéria a partir do nome declarado em data/game.js. */
export default function SubjectIcon({ name, size = 22, ...rest }) {
  const Icon = MAP[name] ?? BookOpenText
  return <Icon size={size} aria-hidden="true" {...rest} />
}
