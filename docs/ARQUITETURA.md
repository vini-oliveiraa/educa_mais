# Educa+ — decisões técnicas e pendências

Este documento explica **por que** o projeto está do jeito que está e **como fechar** as três
pendências que ficaram em aberto na demo: banco de dados, validação no servidor e geração de
questões por LLM.

---

## Sumário

- [Parte I — o que já está decidido](#parte-i--o-que-já-está-decidido)
  - [Stack](#stack)
  - [Questões: geradores, não lista fixa](#questões-geradores-não-lista-fixa)
  - [Anti-cola: por que a resposta não aparece no Inspecionar](#anti-cola-por-que-a-resposta-não-aparece-no-inspecionar)
  - [Conteúdo BNCC: por que um dataset local e não uma API](#conteúdo-bncc-por-que-um-dataset-local-e-não-uma-api)
  - [Arte da cidade](#arte-da-cidade)
- [Parte II — pendências e recomendações](#parte-ii--pendências-e-recomendações)
  - [1. Banco de dados e contas de usuário](#1-banco-de-dados-e-contas-de-usuário)
  - [2. Validação da resposta no servidor](#2-validação-da-resposta-no-servidor)
  - [3. Geração de questões por LLM](#3-geração-de-questões-por-llm)
  - [4. Hospedagem](#4-hospedagem)
- [Parte III — roadmap sugerido](#parte-iii--roadmap-sugerido)

---

# Parte I — o que já está decidido

## Stack

**Vite + React 18, JavaScript, zustand.** Sem framework de rotas, sem biblioteca de animação, sem
biblioteca de componentes.

O motivo é o orçamento de bytes. O público-alvo abre isso num celular de entrada, muitas vezes no
Wi-Fi da escola. Cada dependência que entra precisa justificar o peso:

| Dependência | Peso | Por que entrou |
| --- | --- | --- |
| React + ReactDOM | 45 kB gz | base |
| zustand | ~1 kB gz | estado global com persistência, sem boilerplate de Redux |
| lucide-react | ~6 kB gz (só os ícones usados) | ícones consistentes com o visual do PDF; tree-shaking real |

O que ficou de fora de propósito:

- **react-router** — o app é um fluxo de telas, não um site. Uma máquina de estados de 9 telas no
  store resolve, e evita o roteador no bundle inicial.
- **framer-motion** (~50 kB) — todas as animações do projeto são CSS. Bônus: `prefers-reduced-motion`
  sai de graça e a animação não roda na thread do JS.
- **Tailwind** — o CSS do projeto inteiro tem 6,4 kB comprimidos. Um design system pequeno em CSS
  puro com variáveis fica menor e mais fácil de alguém de fora ler.

**Por que JavaScript e não TypeScript:** o projeto tende a ser mantido por quem está aprendendo, e a
maior parte do código é dado (geradores de questão). O ganho de tipos aqui seria menor que o atrito
de configurar e manter a tipagem. As duas invariantes que realmente importam — "a questão gerada é
válida" e "a tela renderiza" — são verificadas por `npm run check`, que pega mais bug do que o
compilador pegaria.

---

## Questões: geradores, não lista fixa

O banco **não guarda questões**. Guarda 203 **geradores**: funções que recebem um sorteador semeado
e devolvem uma instância de questão.

```js
// src/data/questions/matematica7.js
tpl({
  id: 'ma7-regra-tres-inversa',
  grade: 7, subject: 'matematica', bncc: 'EF07MA17',
  topic: 'Proporcionalidade inversa', level: 3, variants: 1200,
  gen(r) {
    const produto = r.pick([48, 60, 72, 90, 120, 144, 180, 240])
    // ... números, contexto e explicação são derivados do sorteio
  },
})
```

Consequências práticas:

1. **O aluno não decora a prova.** Refazer a mesma missão dá outros números.
2. **A explicação é gerada junto com a questão**, então nunca fica dessincronizada da resposta.
3. **O gerador é determinístico.** Cada instância guarda a semente que a produziu, então a mesma
   questão pode ser reconstruída depois — para revisão, para o professor ver o que caiu, ou para o
   servidor recriar a prova na hora de corrigir (ver [pendência 2](#2-validação-da-resposta-no-servidor)).

Números atuais (`npm run stats`):

```
Geradores ....................... 203
Variações estimadas ............. ~145.000
Habilidades BNCC cobertas ....... 234

               matemática  português  ciências  história  geografia  inglês
  6º ano               28         10         6         4          4       7
  7º ano               25          7         8         3          4       5
  8º ano               22          6         7         3          4       4
  9º ano               20          7         7         4          3       5
```

Matemática concentra a maior parte das variações porque é onde a parametrização rende mais: os
números são variáveis de verdade. Nas humanas a variação vem de pools de itens classificados — um
template de figuras de linguagem com 10 itens e distratores embaralhados já produz dezenas de
questões distintas.

### O teste do banco

`npm run stats` gera **~14 mil questões reais** e reprova se encontrar:

- `undefined`, `NaN` ou `[object Object]` em enunciado, apoio, alternativa, resposta ou explicação;
- alternativa repetida, ou menos de duas alternativas;
- **duas alternativas corretas** (compara por valor, não por texto — `2/12` e `1/6` são a mesma coisa);
- explicação ausente;
- selo que não valida a própria resposta (quebraria a correção em produção);
- enunciado repetido dentro da mesma missão.

Rode isso sempre que mexer num gerador.

---

## Anti-cola: por que a resposta não aparece no Inspecionar

Requisito do projeto: o aluno não pode descobrir a resposta abrindo o DevTools.

A implementação está em [`src/lib/answerVault.js`](../src/lib/answerVault.js). Quatro camadas:

**1. Chave de sessão efêmera.** Ao carregar o app sorteamos 128 bits via WebCrypto. A chave vive
só dentro do escopo do módulo — não é exportada, não vai para o `window`, não é persistida, e muda
a cada F5.

**2. A resposta vira um selo de mão única.** A questão carrega apenas
`seal = hash_com_chave(idDaQuestão + resposta)`. Dá para conferir um palpite; não dá para extrair a
resposta. No DevTools aparece algo como `"k3f9a1x2m0q7bd"`.

**3. Gabarito e explicação viajam cifrados.** O texto da resposta certa e a explicação ficam em
`locked`, um blob XOR com keystream derivado da chave de sessão. Só são decifrados **depois** que o
aluno responde, e o resultado vai para o estado local do feedback — nunca de volta para a questão.

**4. A conferência acontece dentro do módulo.** O componente manda o palpite e recebe um booleano.
Nem a função de hash nem a chave saem de lá.

Detalhes que fecham brechas menores:

- A missão em andamento **não é persistida** no localStorage. Fechar e reabrir no meio da prova
  recomeça — não dá para "congelar" uma questão difícil e pesquisar.
- O campo `decimal` (que diria se a resposta tem casas decimais) **não é enviado** para a interface.
  O teclado numérico mostra vírgula e sinal de menos em todas as questões.
- A normalização é tolerante com o aluno e rígida com o gabarito: `4,5`, `4.5` e ` 4,50 ` batem; o
  separador de milhar do pt-BR (`1.250`) é tratado corretamente sem confundir com `0.125`.

**O limite honesto:** qualquer verificação 100% no cliente é, em teoria, burlável por alguém
disposto a depurar o bundle minificado passo a passo. O que isso entrega é a barreira certa para o
público-alvo — um aluno de 11 a 15 anos abrindo o Inspecionar — com custo de servidor zero. A
blindagem definitiva está na [pendência 2](#2-validação-da-resposta-no-servidor), e o encaixe já
está preparado (`setRemoteValidator()`).

---

## Conteúdo BNCC: por que um dataset local e não uma API

A sugestão original era consumir "a BNCC API". Investigando: **não existe API oficial da BNCC
mantida pelo MEC**. O que existe são espelhos de terceiros, sem SLA, que saem do ar e mudam de
formato sem aviso.

Como o documento é estável — homologado em 2017/2018 e inalterado desde então — o recorte que
usamos está embutido em [`src/data/bncc.js`](../src/data/bncc.js) (272 habilidades, ~12 kB gzipados).
O que isso compra:

- zero latência e zero chamadas de rede ao abrir uma missão;
- **funciona offline** — importante em escola com Wi-Fi ruim;
- nenhuma chave de API, nenhum limite de requisições, nenhum custo;
- o código da habilidade precisa estar disponível de forma **síncrona** na hora de gerar a questão,
  o que uma API não garante.

Quando fizer sentido ter a BNCC completa (todas as ~1.200 habilidades, para um painel do professor
filtrar por unidade temática), o caminho é rodar um **ETL uma vez** e versionar o JSON resultante —
não consultar em runtime. A fonte canônica é o próprio PDF/planilha do MEC em
`basenacionalcomum.mec.gov.br`.

---

## Arte da cidade

As 19 construções são **SVG isométrico gerado por código**
([`src/components/city/BuildingArt.jsx`](../src/components/city/BuildingArt.jsx)), compostas a partir
de três primitivas: losango (terreno), caixa isométrica e telhado piramidal.

Alternativas consideradas e descartadas:

| Opção | Problema |
| --- | --- |
| Pack isométrico em PNG (Kenney, itch.io) | 2–8 MB; sprites em tamanho fixo borram em tela retina |
| Banco de imagens gratuito (Pexels, Unsplash) | não tem sprite isométrico consistente; estilos não combinam entre si |
| Ícones de serviço (Flaticon free) | exige atribuição visível em cada tela; licença muda sem aviso |

O SVG próprio pesa **8 kB comprimidos para as 19 construções**, escala sem perda, é recolorível por
token de CSS e não tem nenhuma obrigação de licença. A projeção usa
`screenX = (x − y)·32`, `screenY = (x + y)·16`, com desenho em ordem de profundidade
(*painter's algorithm*).

---

# Parte II — pendências e recomendações

## 1. Banco de dados e contas de usuário

**Hoje:** `localStorage`, via um adaptador plugável em
[`src/services/persistence.js`](../src/services/persistence.js). Funciona offline, custa zero, e
**não coleta nenhum dado pessoal**. Limitação: o progresso fica preso àquele navegador e some se o
aluno limpar os dados do site. Há export/import de save em JSON como paliativo.

### Antes de escolher a tecnologia: a LGPD

Este ponto costuma ser esquecido e é o que mais dói depois. O público são **crianças e
adolescentes**. O art. 14 da LGPD exige **consentimento específico e destacado de pelo menos um dos
pais ou responsável** para tratar dados de crianças (até 12 anos), e o tratamento tem de se limitar
ao estritamente necessário.

Na prática isso significa que **coletar e-mail e nome completo do aluno transforma um projeto
escolar numa operação com obrigações legais reais**: termo de consentimento assinado, política de
privacidade, canal de exclusão de dados, encarregado (DPO).

**Recomendação: projetar para não coletar.** O modelo que resolve isso:

```
Professor gera um CÓDIGO DE TURMA  →  6B-KX7Q
Aluno entra com: código + apelido escolhido por ele + avatar
```

Sem e-mail, sem nome real, sem data de nascimento, sem telefone. O apelido é pseudônimo. O
professor vê o progresso da turma; a identificação de quem é quem acontece fora do sistema, na
cabeça do professor. Isso tira o projeto do escopo mais pesado da lei e, de quebra, é mais simples
de construir.

### Opções, da mais barata para a mais completa

| Opção | Custo | Esforço | Quando faz sentido |
| --- | --- | --- | --- |
| **A. Manter local + código de turma offline** | R$ 0 | ~0 | Demo, feira de ciências, uso numa turma só |
| **B. Supabase (free tier)** | R$ 0 até 50k usuários ativos/mês | ~2 dias | **Recomendado** para piloto real com várias turmas |
| **C. PocketBase numa VPS** | ~R$ 30/mês | ~3 dias | Se quiser controle total do dado e do custo |
| **D. Firebase** | R$ 0 no início, imprevisível depois | ~2 dias | Não recomendado: custo escala por leitura |

**Por que Supabase (opção B):** é Postgres gerenciado com autenticação e Row Level Security
embutidos. O free tier cobre 500 MB de banco e 50 mil usuários ativos por mês — folgado para uma
escola inteira. Quando apertar, o plano pago é US$ 25/mês. E, por ser Postgres puro, migrar para
outro host depois é um `pg_dump`, não uma reescrita.

**Por que não Firebase (opção D):** o modelo de cobrança é por leitura de documento. Um painel de
professor que lista 30 alunos × 50 respostas vira 1.500 leituras por abertura de tela. Em projeto
educacional, com uso concentrado em horário de aula, a conta surpreende.

### Esquema sugerido (Postgres / Supabase)

```sql
create table turmas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,          -- '6B-KX7Q'
  nome        text not null,                 -- '6º B - Manhã'
  serie       int  not null check (serie between 6 and 9),
  professor   uuid references auth.users(id),
  criada_em   timestamptz default now()
);

create table alunos (
  id          uuid primary key default gen_random_uuid(),
  turma_id    uuid references turmas(id) on delete cascade,
  apelido     text not null,                 -- pseudônimo, NÃO o nome real
  avatar      text not null,
  criado_em   timestamptz default now(),
  unique (turma_id, apelido)
);

create table progresso (
  aluno_id        uuid primary key references alunos(id) on delete cascade,
  moedas          int  default 0,
  xp              int  default 0,
  ofensiva_atual  int  default 0,
  ofensiva_recorde int default 0,
  ultimo_dia      date,
  atualizado_em   timestamptz default now()
);

create table construcoes (
  id        bigserial primary key,
  aluno_id  uuid references alunos(id) on delete cascade,
  tipo      text not null,
  x         int  not null,
  y         int  not null,
  unique (aluno_id, x, y)
);

create table conquistas (
  aluno_id      uuid references alunos(id) on delete cascade,
  conquista_id  text not null,
  obtida_em     timestamptz default now(),
  primary key (aluno_id, conquista_id)
);

-- A tabela que dá valor pedagógico real ao projeto.
create table respostas (
  id           bigserial primary key,
  aluno_id     uuid references alunos(id) on delete cascade,
  template_id  text not null,      -- 'ma7-regra-tres-inversa'
  bncc         text not null,      -- 'EF07MA17'
  semente      bigint not null,    -- permite reconstruir a questão exata
  nivel        int  not null,
  acertou      bool not null,
  respondida_em timestamptz default now()
);

create index on respostas (aluno_id, respondida_em desc);
create index on respostas (bncc);
```

**`respostas` é a tabela mais importante da lista.** É ela que permite o relatório que justifica o
projeto para a coordenação:

```sql
-- Habilidades da BNCC em que a turma mais erra
select r.bncc,
       count(*)                                   as tentativas,
       round(100.0 * avg(r.acertou::int))         as pct_acerto
from respostas r
join alunos a on a.id = r.aluno_id
where a.turma_id = $1
group by r.bncc
having count(*) >= 10
order by pct_acerto asc
limit 10;
```

Guardar a `semente` em vez do enunciado inteiro economiza espaço e, por causa do gerador
determinístico, permite reconstruir a questão exata que o aluno viu.

### O que muda no código

Só [`src/services/persistence.js`](../src/services/persistence.js). O arquivo já tem o esqueleto do
`SupabaseAdapter` comentado, com os três métodos (`getItem`, `setItem`, `removeItem`) que o
middleware de persistência do zustand espera — e ele aceita Promise, então a versão assíncrona
encaixa sem mexer na UI.

> ⚠️ Um ponto de atenção para a migração: hoje o save inteiro é um blob JSON. Com banco real, vale
> trocar por escrita incremental (um `insert` em `respostas` por questão, um `update` em `progresso`
> por missão), senão duas abas abertas sobrescrevem uma à outra.

---

## 2. Validação da resposta no servidor

**Hoje:** conferência local, com o cofre de respostas descrito na Parte I. Suficiente para sala de
aula; insuficiente se o resultado valer nota.

**Quando isso vira obrigatório:** no dia em que a pontuação do Educa+ compuser avaliação formal, ou
houver ranking entre turmas com prêmio. Aí passa a existir incentivo real para burlar, e qualquer
validação no cliente cai.

### A solução, e por que ela é barata

O gerador é **determinístico**: a mesma semente produz exatamente a mesma questão. Então o servidor
não precisa guardar as questões — ele as **recria**.

```
 1. Cliente pede uma missão
         POST /missao  { serie, materia, nivel }

 2. Servidor sorteia a semente, gera a missão com o MESMO código do cliente,
    e devolve as questões SEM resposta + um token assinado (HMAC) com
    { semente, serie, materia, nivel, aluno, expira_em }

 3. Aluno responde no cliente (feedback instantâneo continua local, pelo cofre —
    o aluno não fica esperando rede entre uma questão e outra)

 4. Ao terminar:
         POST /corrigir  { token, respostas: [...] }

 5. Servidor valida o HMAC, recria a missão pela semente, confere cada resposta
    e GRAVA as moedas e o XP. O cliente nunca credita nada sozinho.
```

O ponto importante é o passo 5: **a economia do jogo passa a ser calculada no servidor**. Hoje o
cliente credita as moedas; com isso, mesmo quem adulterar o localStorage não ganha nada.

Para o código do gerador rodar nos dois lados, mova `src/data/questions/`, `src/lib/rng.js` e
`src/engine/quizEngine.js` para um pacote compartilhado (`packages/core/`) importado pelo front e
pela função serverless.

### Onde hospedar a função

| Opção | Free tier | Observação |
| --- | --- | --- |
| **Supabase Edge Functions** | 500 mil invocações/mês | Melhor escolha se já usar Supabase: mesma auth, mesmo banco |
| **Cloudflare Workers** | 100 mil requisições/dia | Mais rápido e mais generoso; precisa integrar auth separado |
| **Vercel Functions** | 100 mil invocações/mês | Conveniente se o front já estiver na Vercel |

Uma escola com 500 alunos fazendo 3 missões por dia gera ~3 mil invocações diárias. Qualquer uma
das três cobre isso de graça com folga.

### O encaixe já está pronto

```js
import { setRemoteValidator } from './src/lib/answerVault.js'

setRemoteValidator(async (uid, guess) => {
  const r = await fetch('/api/check', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ uid, guess }),
  })
  return (await r.json()).correct
})
```

Com o validador remoto registrado, `checkAnswerAsync()` passa a perguntar ao servidor. Se a rede
cair, ele volta sozinho para a conferência local em vez de travar a missão no meio.

---

## 3. Geração de questões por LLM

**Hoje:** desligado. O ponto de extensão está em
[`src/services/questionAI.js`](../src/services/questionAI.js), com o schema da questão, o prompt de
sistema versionado e um validador de lote.

### A recomendação central: não chame o modelo em runtime

É tentador gerar a questão na hora, mas as quatro razões contra são fortes:

1. **Custo** — gerar uma questão por pergunta por aluno multiplica o custo pelo número de alunos.
   Gerar em lote uma vez e reutilizar para a escola inteira custa ordens de grandeza menos.
2. **Latência** — 2 a 5 segundos de espera no meio de um jogo quebra o ritmo. O loop do Educa+
   depende de resposta instantânea.
3. **Confiabilidade** — modelo erra conta e atribui a habilidade BNCC errada. Questão que vale nota
   precisa passar por revisão humana antes de chegar ao aluno.
4. **Segurança** — chave de API no front-end é chave vazada. Precisaria de um proxy de qualquer
   jeito, o que anula a simplicidade aparente.

### O fluxo recomendado: a LLM como ferramenta de autoria

```
  script offline  →  LLM gera N questões  →  validador automático
        →  revisão do professor  →  arquivo versionado em src/data/questions/
```

A LLM vira uma **ferramenta de autoria**, não uma dependência de runtime. O app continua offline,
com custo zero por aluno, e cada questão que chega ao aluno passou por um humano.

Melhor ainda: peça ao modelo para gerar **o gerador**, não a questão. Um template parametrizado
produz centenas de instâncias; uma questão fixa produz uma. O retorno por token é muito maior.

### Quanto custa, de verdade

Usando a **Batch API da Anthropic** (processamento assíncrono, **50% de desconto**) — que é
exatamente o caso de uso aqui, já que geração offline não tem pressa:

| Modelo | Normal (in/out por MTok) | Batch (−50%) |
| --- | --- | --- |
| `claude-haiku-4-5` | $1,00 / $5,00 | **$0,50 / $2,50** |
| `claude-sonnet-5` | $2,00 / $10,00 | $1,00 / $5,00 |
| `claude-opus-5` | $5,00 / $25,00 | $2,50 / $12,50 |

Estimativa para **1.000 questões revisadas**, agrupando 10 questões por requisição (≈1,5 mil tokens
de entrada e 4 mil de saída por requisição, 100 requisições):

| Modelo | Custo do lote |
| --- | --- |
| Haiku 4.5 em batch | **~US$ 1** |
| Sonnet 5 em batch | ~US$ 2 |
| Opus 5 em batch | ~US$ 5 |

Ou seja: **o custo de API é irrelevante.** O custo real do projeto é o tempo de revisão do
professor. O que muda a conta é a taxa de aprovação — e é aí que o modelo mais forte se paga, porque
um lote do Opus com 90% de aprovação custa menos tempo humano que um lote do Haiku com 60%.

Recomendação prática: **gere com `claude-opus-5`** (o mais capaz), em batch, com
[prompt caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching) no prompt de
sistema. Se depois medir que o Haiku aprova igual no seu domínio, aí sim desça de modelo — mas a
decisão deve vir de medição, não de palpite.

### Regras que o prompt precisa carregar

Estão versionadas em `SYSTEM_PROMPT` dentro de `questionAI.js`. As que mais importam:

- cada questão ancorada em **uma** habilidade da BNCC, informada pelo código;
- em Matemática, a conta precisa ser verificável;
- **as 3 alternativas erradas devem ser erros plausíveis** — o resultado de um erro comum de
  procedimento, nunca um absurdo óbvio;
- **nenhuma alternativa errada pode ser matematicamente equivalente à correta**;
- o campo `why` explica o raciocínio passo a passo, não repete a resposta;
- nada de violência, marca comercial, política partidária ou conteúdo sensível.

### Sempre rode o validador

`validateBatch()` barra os erros mais comuns do modelo antes da revisão humana: enunciado curto,
código BNCC inválido, menos de 3 alternativas, alternativa repetida, resposta fora da lista,
explicação vaga. É o filtro que faz a revisão do professor valer o tempo dela.

---

## 4. Hospedagem

O build é **100% estático**. `base: './'` já está configurado, então funciona em subdiretório.

| Opção | Custo | Observação |
| --- | --- | --- |
| **Cloudflare Pages** | Grátis, banda ilimitada | Recomendado: CDN global, bom para rede escolar |
| **Netlify / Vercel** | Grátis até 100 GB/mês | Deploy automático a partir do Git |
| **GitHub Pages** | Grátis | Funciona; sem functions, então não serve para a pendência 2 |

```bash
npm run build       # gera dist/
# suba dist/ no host escolhido
```

---

# Parte III — roadmap sugerido

Em ordem de retorno sobre esforço:

**1. Painel do professor** *(o que mais agrega, e já dá para fazer sem LLM)*
Relatório por habilidade BNCC mostrando onde a turma trava. Depende da tabela `respostas`
([pendência 1](#1-banco-de-dados-e-contas-de-usuário)). É o que transforma o Educa+ de "joguinho de
estudar" em ferramenta de diagnóstico — e é o argumento que convence a coordenação.

**2. Banco de dados + código de turma**
Destrava o painel, o ranking entre colegas e o progresso que acompanha o aluno entre dispositivos.

**3. Modo offline de verdade (PWA)**
Um service worker com estratégia *cache-first* para os assets e o banco de questões. O manifest já
está no projeto; falta o service worker. Faz diferença real em escola com internet instável.

**4. Validação no servidor**
Só vale o esforço se a pontuação passar a valer nota ou houver premiação.

**5. Geração assistida por LLM**
Com o painel do professor no ar, dá para priorizar: gerar questões novas **exatamente nas
habilidades em que a turma mais erra**, em vez de ampliar o banco no escuro.

**6. Mais conteúdo humano**
As humanas têm 3 a 7 geradores por série; Matemática tem 20 a 28. Dobrar a quantidade em História,
Geografia e Inglês é trabalho braçal de baixo risco — e um bom primeiro ticket para quem entrar no
projeto.

### Ideias de produto que combinam com o conceito do PDF

- **Visitar a cidade do colega** — leitura apenas; dá motivo social para construir.
- **Obra coletiva da turma** — um monumento que só sobe quando a turma soma X acertos. Coloca o
  reforço positivo no coletivo, não só no indivíduo.
- **Eventos sazonais** — construção temática disponível por uma semana. Mecânica clássica de
  retenção, barata de implementar (é só uma entrada em `BUILDINGS` com janela de data).
- **Missão de revisão espaçada** — uma missão diária montada só com as habilidades que o aluno
  errou há 3, 7 e 15 dias. Pedagogicamente é o recurso de maior impacto da lista, e a tabela
  `respostas` já dá tudo o que ele precisa.
