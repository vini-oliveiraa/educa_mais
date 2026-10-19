# Educa+

**Aprenda jogando. Construa seu próprio mundo.**

Plataforma web gamificada de estudos para o **Ensino Fundamental — Anos Finais (6º ao 9º ano)**,
alinhada à BNCC. O aluno resolve missões de questões, ganha moedas e XP, e usa isso para construir
uma cidade isométrica própria.

Adaptação do conceito apresentado em *ESTUDA+ — Projeto Educacional Gamificado*.

---

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run build` | Build de produção em `dist/` (estático, pode subir em qualquer host) |
| `npm run preview` | Serve o build para conferência |
| `npm run stats` | Relatório do banco de questões + gera e valida ~14 mil questões |
| `npm run smoke` | Renderiza todas as telas no servidor e simula 72 missões completas |
| `npm run check` | Roda os dois acima |
| `npm run prints` | Captura os screenshots do app em `docs/prints/` (dirige o Chrome) |
| `npm run roteiro` | Gera o PDF de apoio à apresentação em `docs/` |

O dev server sobe com `host: true`, então dá para abrir pelo celular na mesma rede
(`http://<ip-da-máquina>:5173`) — útil para testar o layout mobile de verdade.

---

## O que já está pronto

| Área | Situação |
| --- | --- |
| 4 séries (6º, 7º, 8º, 9º) × 6 matérias | ✅ 203 geradores, ~145 mil questões possíveis |
| Alinhamento BNCC | ✅ 234 habilidades, código exibido em cada questão |
| Questões com variáveis (Matemática) | ✅ números, nomes e contextos sorteados a cada rodada |
| Resposta não inspecionável | ✅ gabarito selado e cifrado — ver [docs/ARQUITETURA.md](docs/ARQUITETURA.md) |
| 3 níveis de dificuldade por missão | ✅ Explorador / Aventureiro / Mestre |
| Moedas, XP, níveis, combo, ofensiva diária | ✅ |
| Cidade isométrica com 19 construções | ✅ SVG próprio, com pan/zoom e demolição |
| Missões diárias e 18 conquistas | ✅ |
| Perfil, estatísticas por matéria, export/import do save | ✅ |
| Banco de dados (Supabase) | ✅ esquema, RLS, RPCs e relatórios — ver [supabase/README.md](supabase/README.md) |
| Publicação (Vercel) | ✅ `vercel.json` com rewrite de SPA e cache dos assets |
| Roteiro de apresentação em PDF | ✅ `npm run roteiro` |
| Validação da resposta no servidor | ⏳ ver [docs/ARQUITETURA.md](docs/ARQUITETURA.md#2-validação-da-resposta-no-servidor) |
| Geração de questões por LLM | ⏳ idem |
| Painel do professor (interface) | ⏳ as views SQL já existem; falta a tela |

---

---

## Modo local e modo nuvem

O app roda de duas formas, decididas por variável de ambiente:

| | sem `.env.local` | com `.env.local` |
|---|---|---|
| Entrada | avatar + nome, direto | código de turma + apelido |
| Progresso | localStorage daquele navegador | Supabase, acompanha o aluno |
| Internet | dispensável | só para sincronizar |
| Painel do professor | — | relatórios por habilidade da BNCC |

O modo local é o da demo: zero backend, zero custo, nenhum dado sai do
aparelho. Para ligar a nuvem, siga [supabase/README.md](supabase/README.md) —
leva uns 15 minutos.

**Decisão de projeto:** no modo nuvem o aluno entra com código de turma e
apelido. Não pedimos e-mail, nome completo nem data de nascimento. O art. 14 da
LGPD exige consentimento dos pais para tratar dado de criança; não coletando,
o projeto fica fora do escopo mais pesado da lei.

---

## Publicando

```bash
npx vercel login      # uma vez
npx vercel --prod
```

O `vercel.json` já traz o rewrite de SPA, cache imutável nos assets e
cabeçalhos de segurança. Se for usar o modo nuvem, cadastre
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Settings → Environment
Variables** antes do deploy.

---

## Estrutura

```
src/
  data/
    bncc.js                  catálogo de habilidades da BNCC (6º ao 9º)
    game.js                  séries, matérias, economia, níveis, conquistas
    buildings.js             catálogo da cidade
    bankLoader.js            carregamento sob demanda do banco
    questions/
      helpers.js             ferramentas para escrever geradores
      index.js               registro + estatísticas
      matematica6..9.js      geradores paramétricos de Matemática
      portugues.js  ciencias.js  historia.js  geografia.js  ingles.js
  engine/
    quizEngine.js            monta a missão, embaralha e SELA as respostas
    progression.js           recompensas, bônus, medalhas, missões diárias
  lib/
    rng.js                   PRNG determinístico (mulberry32)
    answerVault.js           cofre de respostas — o coração do anti-cola
    format.js                formatação pt-BR
  store/useGame.js           estado do jogo (zustand + persistência)
  services/
    persistence.js           adaptador de persistência (local hoje, remoto depois)
    questionAI.js            ponto de extensão para LLM (desligado)
  components/                UI, AppShell, cidade (SVG isométrico)
  screens/                   Onboarding, Home, Subjects, MissionSetup,
                             Quiz, Result, City, Achievements, Profile
scripts/
  bank-stats.mjs             relatório + teste de estresse do banco
  ssr-smoke.jsx              smoke test de renderização de todas as telas
docs/ARQUITETURA.md          decisões técnicas e as pendências em aberto
```

---

## Identidade visual

Herdada da apresentação: fundo azul-marinho profundo com brilhos magenta e azul, títulos em
amarelo-ouro, destaques ciano, cards escuros com borda neon.

- **Títulos:** Fredoka (arredondada, peso 400–700)
- **Texto:** Nunito
- **Cores:** definidas como tokens em [`src/styles/tokens.css`](src/styles/tokens.css)

Ícones: [Lucide](https://lucide.dev) (ISC, livre). Construções da cidade e avatares: SVG e emoji
desenhados no próprio projeto — nenhuma dependência de banco de imagens externo, nenhuma atribuição
obrigatória, nada que quebre se um CDN sair do ar.

---

## Desempenho

Build de produção, comprimido (gzip):

| Carregamento | Tamanho |
| --- | --- |
| **Inicial** (HTML + CSS + React + app) | **~86 kB** |
| Banco de questões | 70 kB — baixado em segundo plano após a primeira pintura |
| Cidade | 8 kB — só quando o aluno abre "Meu Mundo" |

Outras decisões de mobile: animações em CSS (sem biblioteca de animação), `prefers-reduced-motion`
respeitado, alvos de toque de 44 px+, teclado numérico próprio no quiz (o teclado do sistema cobre
metade da tela), `viewport-fit=cover` com `safe-area-inset`, e manifest para instalar como app.

---

## Como adicionar uma questão nova

Abra o arquivo da matéria em `src/data/questions/` e acrescente um template:

```js
tpl({
  id: 'ma6-meu-assunto',          // único no banco
  grade: 6,                        // 6 | 7 | 8 | 9
  subject: 'matematica',
  bncc: 'EF06MA09',                // código oficial da habilidade
  topic: 'Fração de uma quantidade',
  level: 2,                        // 1 fácil · 2 médio · 3 difícil
  variants: 3000,                  // estimativa de instâncias distintas
  gen(r) {                         // `r` é o sorteador semeado
    const total = r.int(2, 20) * 4
    return input({
      prompt: `Quanto é 3/4 de ${total}?`,
      answer: (total / 4) * 3,
      why: `${total} ÷ 4 = ${total / 4}. Multiplicando por 3: ${(total / 4) * 3}.`,
    })
  },
})
```

Depois rode `npm run check`. O teste gera milhares de instâncias do seu gerador e reprova se
aparecer `undefined` no enunciado, alternativa repetida, duas alternativas corretas, explicação
faltando ou selo que não valida a própria resposta.

Regras que valem a pena seguir:

- **Alternativas erradas devem ser erros plausíveis** — o resultado de um erro de procedimento, não
  um número aleatório. É o que transforma o distrator em diagnóstico.
- **Nunca deixe uma alternativa matematicamente igual à correta.** `2/12` e `1/6` são a mesma coisa;
  o helper `take3()` filtra por valor justamente para isso.
- **Resposta digitada**: passe número puro ou string com vírgula decimal, sem separador de milhar.

---

## Licença e créditos

Projeto educacional. Conceito original: equipe ESTUDA+ — Gabriella Baima, Giovana Passos,
Laura Magalhães, Lia Maria Carvalho, Maria Clara Saraiva e Maria Eduarda Alves.

Bibliotecas: React (MIT), Vite (MIT), zustand (MIT), lucide-react (ISC),
fontes Fredoka e Nunito (SIL Open Font License).
