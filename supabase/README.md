# Banco de dados — Supabase

Passo a passo para ligar o modo nuvem do Educa+. Leva uns 15 minutos.

Sem isso o app continua funcionando em **modo local** (localStorage, offline,
sem backend) — que é como a demo roda.

---

## 1. Criar o projeto

1. Crie uma conta em [supabase.com](https://supabase.com) (o plano gratuito cobre
   500 MB de banco e 50 mil usuários ativos por mês — folgado para uma escola).
2. **New project** → escolha a região **South America (São Paulo)**. A latência
   para o Brasil cai de ~150 ms para ~20 ms, e isso se nota no celular do aluno.
3. Guarde a senha do banco num gerenciador de senhas. Ela não é usada pelo app,
   mas é necessária para acessar o Postgres direto.

## 2. Ligar o login anônimo

É o que permite o aluno entrar sem e-mail.

**Authentication → Sign In / Providers → Anonymous sign-ins → ativar.**

Se esquecer deste passo, a tela de entrada falha com "Anonymous sign-ins are
disabled".

> Ainda em Authentication, vale ativar o **CAPTCHA** se o projeto for público na
> internet. Login anônimo sem proteção pode ser usado para inflar a contagem de
> usuários do projeto.

## 3. Rodar as migrations

**SQL Editor → New query** e cole, **nesta ordem**, o conteúdo de:

| # | arquivo | o que faz |
|---|---|---|
| 1 | `migrations/20261018000100_schema.sql` | tabelas, índices e comentários |
| 2 | `migrations/20261018000200_rls.sql` | Row Level Security (quem lê o quê) |
| 3 | `migrations/20261018000300_rpc.sql` | funções chamadas pelo app |
| 4 | `migrations/20261018000400_relatorios.sql` | views do painel do professor |

Rode um de cada vez e confira que cada um termina com "Success".

Quem usa a CLI do Supabase pode fazer tudo de uma vez:

```bash
supabase link --project-ref <ref-do-projeto>
supabase db push
```

## 4. Configurar o app

```bash
cp .env.example .env.local
```

Preencha com os valores de **Settings → API**:

- `VITE_SUPABASE_URL` → *Project URL*
- `VITE_SUPABASE_ANON_KEY` → chave **anon / publishable**

⚠️ Nunca use a `service_role` aqui. Tudo que começa com `VITE_` é embutido no
bundle do navegador e, portanto, é público. A `anon` foi feita para isso e
respeita a RLS; a `service_role` ignora a RLS inteira.

Reinicie o `npm run dev` — o Vite só lê o `.env` na inicialização.

## 5. Criar a primeira turma

Ainda não existe tela de professor (está no roadmap). Por enquanto, pelo
**SQL Editor**:

```sql
-- 1. Crie uma conta de professor pela UI:
--    Authentication → Users → Add user → com e-mail e senha.
-- 2. Copie o UUID do usuário criado e rode:

insert into public.turmas (codigo, nome, serie, professor_id)
values ('6B-KX7Q', '6º B — Manhã', 6, '<uuid-do-professor>');
```

Ou, logado como o professor no app, chamando a função que gera o código sozinha:

```sql
select * from public.criar_turma('6º B — Manhã', 6);
```

Passe o código (`6B-KX7Q`) para a turma. É só isso que o aluno precisa digitar.

## 6. Conferir se está funcionando

Abra o app. Em vez do onboarding você deve ver a tela **"Entrar na turma"**.
Entre com o código, um apelido e um avatar; depois rode no SQL Editor:

```sql
select apelido, serie, criado_em from public.alunos;
select * from public.progresso;
```

Faça uma missão e confira que as respostas chegaram:

```sql
select bncc, materia, acertou, respondida_em
from public.respostas
order by respondida_em desc
limit 10;
```

---

## Os relatórios que justificam o projeto

Depois que a turma usar por algumas semanas:

```sql
-- As 10 habilidades da BNCC em que a turma mais erra
select bncc, materia, tentativas, pct_acerto
from relatorio_bncc
where turma_id = '<uuid-da-turma>' and tentativas >= 10
order by pct_acerto asc
limit 10;

-- Quadro geral da turma
select apelido, xp, missoes, pct_acerto, ofensiva
from relatorio_aluno
where turma_id = '<uuid-da-turma>'
order by xp desc;

-- Quem precisa de atenção, e por quê
select apelido, alerta, respondidas, pct_acerto, visto_em
from alunos_em_atencao
where turma_id = '<uuid-da-turma>';
```

O `alerta` distingue dois problemas diferentes, que pedem intervenções
diferentes: `sumiu` (engajamento) e `dificuldade` (conteúdo).

---

## Modelo de dados em uma olhada

```
auth.users (anônimo)
     │
     └─ alunos ──┬─ progresso    (1:1, estado do jogo)
        │        ├─ construcoes  (1:N, a cidade)
        │        ├─ conquistas   (1:N, troféus)
        │        └─ respostas    (1:N, append-only ← o ouro pedagógico)
        │
     turmas ── professor_id → auth.users (conta real, com e-mail)
```

**`respostas` é a tabela que importa.** Ela guarda a *semente* da questão, não o
enunciado: como o gerador é determinístico, `replayMission({ seed })` reconstrói
exatamente a questão que o aluno viu, e isso economiza muito espaço.

---

## Decisões que valem explicar para a banca

**Por que não pedimos e-mail nem nome real.** O art. 14 da LGPD exige
consentimento específico de pelo menos um dos pais para tratar dados de
crianças. Projetando com código de turma + apelido, não há dado pessoal no
banco — e o projeto sai do escopo mais pesado da lei. O professor sabe quem é
quem; o sistema, não.

**Por que `respostas` não pode ser editada.** As policies dão apenas `insert` e
`select` ao aluno, e `revoke update, delete` vale para todo mundo, inclusive o
professor. Histórico de avaliação não se reescreve.

**O que ainda não está protegido.** O aluno pode, via API, escrever no próprio
`progresso` e se dar moedas. É a mesma brecha que já existe no localStorage —
não piorou nada. Fechá-la exige validar as respostas no servidor; o caminho
está em [`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md#2-validação-da-resposta-no-servidor),
e o comentário no fim de `20261018000200_rls.sql` mostra a linha exata a
descomentar quando isso for feito.
