-- ============================================================================
-- Educa+ · 0004 · Relatórios para o painel do professor
-- ============================================================================
--
-- É daqui que sai o argumento que convence a coordenação: não "os alunos
-- jogaram X horas", e sim "a turma trava em EF07MA17 — proporcionalidade".
--
-- Todas as views usam `security_invoker = true`, então herdam a RLS das
-- tabelas de baixo: o professor vê só as próprias turmas, o aluno só a si
-- mesmo. Sem isso, uma view viraria um buraco que expõe a escola inteira.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Onde a turma trava, por habilidade da BNCC
-- ---------------------------------------------------------------------------
create or replace view public.relatorio_bncc
with (security_invoker = true) as
select
  a.turma_id,
  r.materia,
  r.bncc,
  count(*)                                                as tentativas,
  count(*) filter (where r.acertou)                       as acertos,
  round(100.0 * avg(r.acertou::int), 1)                   as pct_acerto,
  count(distinct r.aluno_id)                              as alunos,
  round(avg(r.segundos)::numeric, 1)                      as segundos_medio,
  max(r.respondida_em)                                    as ultima_resposta
from public.respostas r
join public.alunos a on a.id = r.aluno_id
group by a.turma_id, r.materia, r.bncc;

comment on view public.relatorio_bncc is
  'Desempenho da turma por habilidade da BNCC. Ordene por pct_acerto para achar o gargalo.';

-- ---------------------------------------------------------------------------
-- Visão geral por aluno
-- ---------------------------------------------------------------------------
create or replace view public.relatorio_aluno
with (security_invoker = true) as
select
  a.id                                                    as aluno_id,
  a.turma_id,
  a.apelido,
  a.avatar,
  a.serie,
  a.visto_em,
  coalesce(p.xp, 0)                                       as xp,
  coalesce(p.moedas, 0)                                   as moedas,
  coalesce(p.missoes, 0)                                  as missoes,
  coalesce(p.ofensiva_atual, 0)                           as ofensiva,
  coalesce(p.acertos, 0) + coalesce(p.erros, 0)           as respondidas,
  case
    when coalesce(p.acertos, 0) + coalesce(p.erros, 0) = 0 then null
    else round(100.0 * p.acertos / (p.acertos + p.erros), 1)
  end                                                     as pct_acerto,
  (select count(*) from public.construcoes c where c.aluno_id = a.id) as construcoes,
  (select count(*) from public.conquistas q where q.aluno_id = a.id)  as conquistas,
  (select count(*) from public.respostas r
    where r.aluno_id = a.id and r.respondida_em >= current_date - 6)  as respostas_7d
from public.alunos a
left join public.progresso p on p.aluno_id = a.id;

comment on view public.relatorio_aluno is
  'Uma linha por aluno: engajamento, aproveitamento e atividade recente.';

-- ---------------------------------------------------------------------------
-- Desempenho por matéria
-- ---------------------------------------------------------------------------
create or replace view public.relatorio_materia
with (security_invoker = true) as
select
  a.turma_id,
  r.materia,
  count(*)                                                as tentativas,
  round(100.0 * avg(r.acertou::int), 1)                   as pct_acerto,
  count(distinct r.aluno_id)                              as alunos,
  count(distinct r.bncc)                                  as habilidades_exercitadas
from public.respostas r
join public.alunos a on a.id = r.aluno_id
group by a.turma_id, r.materia;

comment on view public.relatorio_materia is 'Resumo por matéria, para a visão macro da turma.';

-- ---------------------------------------------------------------------------
-- Alunos que precisam de atenção
-- ---------------------------------------------------------------------------
-- Dois sinais diferentes, que pedem intervenções diferentes:
--   'sumiu'      — não responde há mais de 7 dias (problema de engajamento)
--   'dificuldade'— responde bastante mas acerta pouco (problema de conteúdo)
create or replace view public.alunos_em_atencao
with (security_invoker = true) as
select
  v.*,
  case
    when v.visto_em < now() - interval '7 days'      then 'sumiu'
    when v.respondidas >= 20 and v.pct_acerto < 50   then 'dificuldade'
    else null
  end as alerta
from public.relatorio_aluno v
where v.visto_em < now() - interval '7 days'
   or (v.respondidas >= 20 and v.pct_acerto < 50);

comment on view public.alunos_em_atencao is
  'Alunos sumidos ou com baixo aproveitamento — a lista que o professor olha primeiro.';

grant select on public.relatorio_bncc, public.relatorio_aluno,
                public.relatorio_materia, public.alunos_em_atencao
  to authenticated;

-- ---------------------------------------------------------------------------
-- Exemplos de consulta (para colar no SQL Editor do Supabase)
-- ---------------------------------------------------------------------------
--
-- As 10 habilidades em que a turma mais erra, ignorando amostra pequena:
--
--   select bncc, materia, tentativas, pct_acerto
--   from relatorio_bncc
--   where turma_id = '<uuid>' and tentativas >= 10
--   order by pct_acerto asc
--   limit 10;
--
-- Ranking da turma (o que vira o "quadro de honra" na parede da sala):
--
--   select apelido, avatar, xp, missoes, pct_acerto
--   from relatorio_aluno
--   where turma_id = '<uuid>'
--   order by xp desc;
--
-- Reconstruir uma questão que um aluno errou (a semente basta):
--
--   select template_id, semente, bncc
--   from respostas
--   where aluno_id = '<uuid>' and not acertou
--   order by respondida_em desc
--   limit 20;
--
--   -- no Node: replayMission({ seed: <semente>, ... })
