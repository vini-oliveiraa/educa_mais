import { useEffect, useState } from 'react'

/**
 * Carregamento sob demanda do banco de questões.
 *
 * O banco é o maior pedaço do bundle (~70 kB gzip). A tela inicial, a cidade e
 * o perfil não precisam dele, então ele sai do caminho crítico: o app abre com
 * ~80 kB e o banco entra em segundo plano logo depois da primeira pintura, ou
 * na hora em que o aluno abre "Missões" — o que vier primeiro.
 *
 * Na prática: numa rede 3G o aluno vê a tela inicial em menos da metade do
 * tempo, e quando chega na lista de matérias o banco já está em cache.
 */

let promise = null

export function loadBank() {
  if (!promise) promise = import('./questions/index.js')
  return promise
}

/** Puxa o banco quando o navegador estiver ocioso, sem disputar com o 1º frame. */
export function prefetchBank() {
  if (promise) return
  const run = () => loadBank()
  if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 1500)
}

/** Hook para telas que precisam ler o banco (lista de assuntos, estatísticas). */
export function useBank() {
  const [bank, setBank] = useState(null)

  useEffect(() => {
    let alive = true
    loadBank().then((mod) => {
      if (alive) setBank(mod)
    })
    return () => {
      alive = false
    }
  }, [])

  return bank
}
