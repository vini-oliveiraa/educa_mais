-- ============================================================================
-- Educa+ · 0001 · Esquema base
-- ============================================================================
--
-- MODELO DE IDENTIDADE
-- --------------------
-- O público do Educa+ são crianças e adolescentes. O art. 14 da LGPD exige
-- consentimento específico e destacado de pelo menos um dos pais para tratar
-- dados de crianças, e limita o tratamento ao estritamente necessário.
--
-- Por isso o sistema foi desenhado para NÃO COLETAR dado pessoal:
--
--   * o aluno entra com um CÓDIGO DE TURMA gerado pelo professor;
--   * escolhe um APELIDO (pseudônimo) e um avatar;
--   * a autenticação é ANÔNIMA (supabase.auth.signInAnonymously), ou seja,
--     não há e-mail, senha, telefone nem data de nascimento em lugar nenhum.
--
-- Quem sabe que "Foguete22" é a Beatriz é o professor, fora do sistema. Isso
-- tira o projeto do escopo mais pesado da lei sem perder nada de pedagógico.
--
-- O PROFESSOR, sim, tem conta real (e-mail + senha) — é adulto e precisa
-- responder pela turma.
-- ============================================================================

-- ---------------------------------------------------------------- turmas
create table if not exists public.turmas (
  id           uuid primary key default gen_random_uuid(),
  codigo       text not null unique,
  nome         text not null,
  serie        smallint not null check (serie between 6 and 9),
  professor_id uuid not null references auth.users (id) on delete cascade,
  ativa        boolean not null default true,
  criada_em    timestamptz not null default now()
);

comment on table  public.turmas        is 'Turma criada por um professor. O código é a credencial de entrada do aluno.';
comment on column public.turmas.codigo is 'Código curto digitado pelo aluno, ex.: 6B-KX7Q. Sempre em maiúsculas.';
comment on column public.turmas.ativa  is 'Desligar encerra novas entradas sem apagar o histórico da turma.';

create index if not exists turmas_professor_idx on public.turmas (professor_id);

-- ---------------------------------------------------------------- alunos
-- 1:1 com auth.users — cada aluno é um usuário anônimo do Supabase.
create table if not exists public.alunos (
  id        uuid primary key references auth.users (id) on delete cascade,
  turma_id  uuid not null references public.turmas (id) on delete cascade,
  apelido   text not null check (char_length(trim(apelido)) between 2 and 20),
  avatar    text not null default '🦊',
  serie     smallint not null check (serie between 6 and 9),
  criado_em timestamptz not null default now(),
  visto_em  timestamptz not null default now(),

  -- Dois "Foguete22" na mesma turma confundiriam o professor.
  constraint alunos_apelido_unico_na_turma unique (turma_id, apelido)
);

comment on table  public.alunos         is 'Aluno pseudonimizado. NUNCA gravar nome real, e-mail ou telefone aqui.';
comment on column public.alunos.apelido is 'Pseudônimo escolhido pelo próprio aluno.';
comment on column public.alunos.serie   is 'Pode diferir da série da turma (aluno em reforço ou adiantado).';

create index if not exists alunos_turma_idx on public.alunos (turma_id);

-- ------------------------------------------------------------- progresso
-- 1:1 com aluno. Guarda o estado "quente" do jogo — o que a HUD lê a cada tela.
create table if not exists public.progresso (
  aluno_id         uuid primary key references public.alunos (id) on delete cascade,
  moedas           integer not null default 0 check (moedas >= 0),
  xp               integer not null default 0 check (xp >= 0),
  ofensiva_atual   integer not null default 0 check (ofensiva_atual >= 0),
  ofensiva_recorde integer not null default 0 check (ofensiva_recorde >= 0),
  ultimo_dia       date,
  missoes          integer not null default 0 check (missoes >= 0),
  acertos          integer not null default 0 check (acertos >= 0),
  erros            integer not null default 0 check (erros >= 0),
  gabaritos        integer not null default 0 check (gabaritos >= 0),
  melhor_combo     integer not null default 0 check (melhor_combo >= 0),
  atualizado_em    timestamptz not null default now()
);

comment on table public.progresso is 'Estado agregado do jogo. O nível NÃO é guardado: é derivado do xp no cliente.';

-- ------------------------------------------------------------ construcoes
create table if not exists public.construcoes (
  id        bigint generated always as identity primary key,
  aluno_id  uuid not null references public.alunos (id) on delete cascade,
  tipo      text not null,
  x         smallint not null check (x between 0 and 8),
  y         smallint not null check (y between 0 and 8),
  criada_em timestamptz not null default now(),

  -- O tabuleiro é 9x9 e um terreno não comporta duas construções.
  constraint construcoes_terreno_unico unique (aluno_id, x, y)
);

comment on table  public.construcoes      is 'Cidade do aluno. Uma linha por edificação no tabuleiro 9x9.';
comment on column public.construcoes.tipo is 'Id do catálogo em src/data/buildings.js, ex.: escola, biblioteca.';

create index if not exists construcoes_aluno_idx on public.construcoes (aluno_id);

-- ------------------------------------------------------------- conquistas
create table if not exists public.conquistas (
  aluno_id     uuid not null references public.alunos (id) on delete cascade,
  conquista_id text not null,
  obtida_em    timestamptz not null default now(),
  primary key (aluno_id, conquista_id)
);

comment on table public.conquistas is 'Troféus desbloqueados. Ids vêm de ACHIEVEMENTS em src/data/game.js.';

-- -------------------------------------------------------------- respostas
-- A tabela mais importante do esquema. É ela que transforma o Educa+ de
-- "joguinho de estudar" em ferramenta de diagnóstico pedagógico.
--
-- Append-only de propósito: resposta de aluno é registro histórico, não se
-- edita. Guardamos a SEMENTE em vez do enunciado — como o gerador de questões
-- é determinístico, a questão exata pode ser reconstruída depois com
-- replayMission({ seed }), e isso economiza muito espaço.
create table if not exists public.respostas (
  id            bigint generated always as identity primary key,
  aluno_id      uuid not null references public.alunos (id) on delete cascade,
  template_id   text not null,
  bncc          text not null,
  materia       text not null,
  serie         smallint not null check (serie between 6 and 9),
  nivel         smallint not null check (nivel between 1 and 3),
  semente       bigint not null,
  acertou       boolean not null,
  segundos      numeric(6, 2) check (segundos is null or segundos >= 0),
  respondida_em timestamptz not null default now()
);

comment on table  public.respostas          is 'Histórico append-only de respostas. Base de todo relatório pedagógico.';
comment on column public.respostas.semente  is 'Semente do PRNG que gerou a questão; permite reconstruí-la exatamente.';
comment on column public.respostas.segundos is 'Tempo até responder. Opcional — ajuda a distinguir chute de raciocínio.';

-- Índices pensados nas três consultas reais do painel do professor:
-- "o que este aluno andou fazendo", "onde a turma trava" e "como foi em X".
create index if not exists respostas_aluno_data_idx on public.respostas (aluno_id, respondida_em desc);
create index if not exists respostas_bncc_idx       on public.respostas (bncc);
create index if not exists respostas_materia_idx    on public.respostas (materia, serie);

-- ---------------------------------------------------- gatilho de updated_at
create or replace function public.touch_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists progresso_touch on public.progresso;
create trigger progresso_touch
  before update on public.progresso
  for each row execute function public.touch_atualizado_em();
