/**
 * ============================================================================
 * GERAÇÃO DE QUESTÕES POR LLM — ponto de extensão (desligado nesta demo)
 * ============================================================================
 *
 * A recomendação de arquitetura é NÃO chamar o modelo em tempo real durante a
 * missão. Motivos:
 *
 *   1. CUSTO — gerar uma questão a cada pergunta de cada aluno multiplica o
 *      custo pelo número de alunos. Gerar em lote, uma vez, e reutilizar o
 *      resultado para a turma inteira custa ordens de grandeza menos.
 *   2. LATÊNCIA — 2 a 5 segundos de espera no meio de um jogo quebra o ritmo.
 *   3. CONFIABILIDADE — modelo erra conta e inventa habilidade BNCC. Questão de
 *      prova precisa passar por revisão antes de chegar ao aluno.
 *   4. SEGURANÇA — chave de API no front-end é chave vazada. Precisa de proxy.
 *
 * O fluxo recomendado (detalhado em docs/ARQUITETURA.md › "LLM"):
 *
 *      script offline  →  LLM gera N questões  →  validador automático
 *            →  revisão do professor  →  arquivo versionado em src/data/questions
 *
 * Ou seja: a LLM vira uma FERRAMENTA DE AUTORIA, não uma dependência de runtime.
 * O app continua funcionando offline e com custo zero por aluno.
 *
 * Este módulo existe para que, no dia em que houver licença, o encaixe seja só
 * trocar `generateQuestions` por uma chamada real ao proxy.
 */

export const AI_ENABLED = false

/**
 * Contrato que uma questão gerada por LLM precisa cumprir para entrar no banco.
 * É o mesmo formato devolvido por `gen(rng)` em src/data/questions/helpers.js.
 */
export const QUESTION_SCHEMA = {
  type: "'mc' | 'input'",
  prompt: 'string — enunciado completo, em português do Brasil',
  support: 'string | null — texto de apoio, tabela ou trecho para leitura',
  options: 'string[] — só para type="mc"; 4 alternativas, uma correta',
  answer: 'string — a alternativa correta (ou o número, para type="input")',
  why: 'string — explicação passo a passo, mostrada depois da resposta',
  bncc: 'string — código da habilidade, ex.: EF07MA18',
  level: '1 | 2 | 3',
  topic: 'string — nome curto do assunto',
}

/**
 * Prompt de sistema sugerido para a geração em lote. Mantido aqui, versionado
 * junto do código, para que mudanças no prompt sejam revisáveis em diff.
 */
export const SYSTEM_PROMPT = `Você gera questões para alunos brasileiros do Ensino Fundamental — Anos Finais.

REGRAS OBRIGATÓRIAS
1. Escreva em português do Brasil, com vocabulário adequado à faixa de 11 a 15 anos.
2. Cada questão deve estar ancorada em UMA habilidade da BNCC, informada pelo código.
3. Em Matemática, confira a conta duas vezes. A resposta precisa ser verificável.
4. As 3 alternativas erradas devem ser ERROS PLAUSÍVEIS (o resultado de um erro
   comum de procedimento), nunca absurdos óbvios nem valores aleatórios.
5. Nenhuma alternativa errada pode ser matematicamente equivalente à correta.
6. O campo "why" explica o raciocínio passo a passo, não apenas repete a resposta.
7. Não use contextos de violência, marcas comerciais, política partidária ou
   qualquer conteúdo sensível.
8. Responda APENAS com um array JSON válido, sem texto antes ou depois.`

/**
 * Stub de geração. Com a licença ativa, substituir por um fetch ao SEU proxy
 * (nunca chamar a API do provedor direto do navegador — a chave vazaria):
 *
 *   const res = await fetch('/api/gerar-questoes', {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify({ grade, subject, bncc, level, count }),
 *   })
 *   return validateBatch(await res.json())
 */
export async function generateQuestions() {
  if (!AI_ENABLED) {
    throw new Error(
      'Geração por LLM desativada nesta versão. O banco local em src/data/questions já cobre as 6 matérias do 6º ao 9º ano.',
    )
  }
  return []
}

/**
 * Validador mínimo para o lote gerado. Rode SEMPRE antes de versionar o
 * arquivo: ele barra os erros mais comuns do modelo.
 */
export function validateBatch(questions) {
  const problemas = []
  const aprovadas = []

  questions.forEach((q, i) => {
    const erros = []
    if (!q.prompt || q.prompt.length < 15) erros.push('enunciado curto demais')
    if (!q.answer) erros.push('sem resposta')
    if (!/^EF0[6-9]/.test(q.bncc ?? '')) erros.push('código BNCC inválido')
    if (![1, 2, 3].includes(q.level)) erros.push('nível fora de 1-3')
    if (q.type === 'mc') {
      if (!Array.isArray(q.options) || q.options.length < 3) erros.push('menos de 3 alternativas')
      else {
        const norm = q.options.map((o) => String(o).trim().toLowerCase())
        if (new Set(norm).size !== norm.length) erros.push('alternativas repetidas')
        if (!norm.includes(String(q.answer).trim().toLowerCase())) erros.push('resposta não está entre as alternativas')
      }
    }
    if (!q.why || q.why.length < 20) erros.push('explicação ausente ou vaga')

    if (erros.length) problemas.push({ indice: i, erros, prompt: q.prompt })
    else aprovadas.push(q)
  })

  return { aprovadas, problemas }
}
