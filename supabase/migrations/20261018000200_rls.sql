-- ============================================================================
-- Educa+ · 0002 · Row Level Security
-- ============================================================================
--
-- Regra geral:
--   * ALUNO  — enxerga e altera apenas os próprios dados, e lê a própria turma.
--   * PROFESSOR — lê (nunca escreve) os dados dos alunos das SUAS turmas.
--
-- As funções auxiliares são `security definer` de propósito: sem isso, uma
-- policy de `alunos` que consulta `turmas` dispara a policy de `turmas`, que
-- consulta `alunos`, e o Postgres entra em recursão infinita.
-- ============================================================================

alter table public.turmas      enable row level security;
alter table public.alunos      enable row level security;
alter table public.progresso   enable row level security;
alter table public.construcoes enable row level security;
alter table public.conquistas  enable row level security;
alter table public.respostas   enable row level security;

-- ------------------------------------------------------ funções auxiliares

create or replace function public.minha_turma()
returns uuid
language sql stable security definer set search_path = public
as $$
  select turma_id from public.alunos where id = auth.uid();
$$;

comment on function public.minha_turma() is 'Turma do aluno autenticado, ou null se o usuário não for aluno.';

create or replace function public.sou_professor(p_turma uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.turmas t
    where t.id = p_turma and t.professor_id = auth.uid()
  );
$$;

create or replace function public.meu_aluno(p_aluno uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.alunos a
    join public.turmas t on t.id = a.turma_id
    where a.id = p_aluno and t.professor_id = auth.uid()
  );
$$;

comment on function public.meu_aluno(uuid) is 'Verdadeiro se o aluno pertence a uma turma do professor autenticado.';

-- ------------------------------------------------------------------ turmas

drop policy if exists turmas_professor_tudo on public.turmas;
create policy turmas_professor_tudo on public.turmas
  for all  to authenticated
  using      (professor_id = auth.uid())
  with check (professor_id = auth.uid());

-- O aluno precisa ler o nome e a série da própria turma para a interface.
-- Note que ele NÃO enxerga outras turmas nem o código de entrada de nenhuma.
drop policy if exists turmas_aluno_le_a_sua on public.turmas;
create policy turmas_aluno_le_a_sua on public.turmas
  for select to authenticated
  using (id = public.minha_turma());

-- ------------------------------------------------------------------ alunos

drop policy if exists alunos_le_o_proprio on public.alunos;
create policy alunos_le_o_proprio on public.alunos
  for select to authenticated
  using (id = auth.uid());

-- Trocar apelido, avatar e série. A turma NÃO pode ser trocada por aqui:
-- migrar de turma passa pela função entrar_na_turma(), que valida o código.
drop policy if exists alunos_atualiza_o_proprio on public.alunos;
create policy alunos_atualiza_o_proprio on public.alunos
  for update to authenticated
  using      (id = auth.uid())
  with check (id = auth.uid() and turma_id = public.minha_turma());

drop policy if exists alunos_professor_le on public.alunos;
create policy alunos_professor_le on public.alunos
  for select to authenticated
  using (public.sou_professor(turma_id));

-- O INSERT acontece só dentro de entrar_na_turma() (security definer),
-- então não existe policy de insert aqui de propósito.

-- --------------------------------------------------------------- progresso

drop policy if exists progresso_dono on public.progresso;
create policy progresso_dono on public.progresso
  for all  to authenticated
  using      (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

-- ⚠️ TRADEOFF CONSCIENTE
-- Com UPDATE liberado, um aluno que saiba usar o DevTools consegue chamar a
-- API e escrever moedas = 999999. É exatamente a mesma superfície de trapaça
-- que já existe hoje no localStorage — ou seja, isto não PIORA nada.
--
-- O endurecimento é revogar o update direto e deixar só a RPC
-- registrar_missao() (migration 0003), que recalcula a recompensa no servidor:
--
--     revoke update on public.progresso from authenticated;
--
-- Só vale a pena fazer isso junto com a validação server-side das respostas
-- (ver docs/ARQUITETURA.md › "Validação da resposta no servidor"). Ligar só
-- metade dá falsa sensação de segurança.

drop policy if exists progresso_professor_le on public.progresso;
create policy progresso_professor_le on public.progresso
  for select to authenticated
  using (public.meu_aluno(aluno_id));

-- ------------------------------------------------------------- construcoes

drop policy if exists construcoes_dono on public.construcoes;
create policy construcoes_dono on public.construcoes
  for all  to authenticated
  using      (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

drop policy if exists construcoes_professor_le on public.construcoes;
create policy construcoes_professor_le on public.construcoes
  for select to authenticated
  using (public.meu_aluno(aluno_id));

-- -------------------------------------------------------------- conquistas

drop policy if exists conquistas_dono on public.conquistas;
create policy conquistas_dono on public.conquistas
  for all  to authenticated
  using      (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

drop policy if exists conquistas_professor_le on public.conquistas;
create policy conquistas_professor_le on public.conquistas
  for select to authenticated
  using (public.meu_aluno(aluno_id));

-- --------------------------------------------------------------- respostas
-- Append-only: o aluno insere e lê as próprias respostas, mas não pode
-- alterar nem apagar. Histórico de avaliação não se reescreve.

drop policy if exists respostas_dono_insere on public.respostas;
create policy respostas_dono_insere on public.respostas
  for insert to authenticated
  with check (aluno_id = auth.uid());

drop policy if exists respostas_dono_le on public.respostas;
create policy respostas_dono_le on public.respostas
  for select to authenticated
  using (aluno_id = auth.uid());

drop policy if exists respostas_professor_le on public.respostas;
create policy respostas_professor_le on public.respostas
  for select to authenticated
  using (public.meu_aluno(aluno_id));

-- Nada de update/delete para ninguém — nem para o professor.
revoke update, delete on public.respostas from authenticated;
