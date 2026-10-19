-- ============================================================================
-- Educa+ · 0003 · Funções chamadas pelo app (RPC)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- criar_turma — usada pelo professor
-- ---------------------------------------------------------------------------
-- Gera um código curto, legível em voz alta e sem caracteres ambíguos
-- (sem O/0, sem I/1), do tipo "6B-KX7Q".
create or replace function public.gerar_codigo_turma(p_serie smallint)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sem O,0,I,1
  v_sufixo   text;
  v_codigo   text;
  v_tent     int := 0;
begin
  loop
    v_sufixo := '';
    for i in 1..4 loop
      v_sufixo := v_sufixo || substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::int, 1);
    end loop;

    v_codigo := p_serie::text || substr(v_alfabeto, 1 + floor(random() * 24)::int, 1) || '-' || v_sufixo;

    exit when not exists (select 1 from public.turmas where codigo = v_codigo);

    v_tent := v_tent + 1;
    if v_tent > 50 then
      raise exception 'Não foi possível gerar um código livre. Tente de novo.';
    end if;
  end loop;

  return v_codigo;
end;
$$;

create or replace function public.criar_turma(p_nome text, p_serie smallint)
returns public.turmas
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_turma public.turmas;
begin
  if auth.uid() is null then
    raise exception 'É preciso estar autenticado para criar uma turma.';
  end if;

  if p_serie not between 6 and 9 then
    raise exception 'Série inválida: %. O Educa+ cobre do 6º ao 9º ano.', p_serie;
  end if;

  insert into public.turmas (codigo, nome, serie, professor_id)
  values (public.gerar_codigo_turma(p_serie), trim(p_nome), p_serie, auth.uid())
  returning * into v_turma;

  return v_turma;
end;
$$;

comment on function public.criar_turma(text, smallint) is 'Professor cria turma; o código de entrada é gerado automaticamente.';

-- ---------------------------------------------------------------------------
-- entrar_na_turma — usada pelo aluno, logo após o login anônimo
-- ---------------------------------------------------------------------------
-- É `security definer` porque o aluno NÃO tem permissão de select em turmas
-- antes de pertencer a uma. Sem isso ele não conseguiria validar o próprio
-- código de entrada — e dar select geral em turmas vazaria o código de todas.
create or replace function public.entrar_na_turma(
  p_codigo  text,
  p_apelido text,
  p_avatar  text default '🦊',
  p_serie   smallint default null
)
returns public.alunos
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_turma  public.turmas;
  v_aluno  public.alunos;
  v_uid    uuid := auth.uid();
  v_ap     text := trim(p_apelido);
  v_serie  smallint;
begin
  if v_uid is null then
    raise exception 'Sessão não encontrada. Faça login antes de entrar na turma.';
  end if;

  if char_length(v_ap) < 2 then
    raise exception 'O apelido precisa ter pelo menos 2 letras.';
  end if;

  select * into v_turma
  from public.turmas
  where codigo = upper(trim(p_codigo)) and ativa
  limit 1;

  if v_turma.id is null then
    raise exception 'Código de turma inválido ou turma encerrada.'
      using errcode = 'P0002';
  end if;

  v_serie := coalesce(p_serie, v_turma.serie);

  -- Apelido já usado por OUTRO aluno da mesma turma?
  if exists (
    select 1 from public.alunos
    where turma_id = v_turma.id and apelido = v_ap and id <> v_uid
  ) then
    raise exception 'Já existe um "%" nesta turma. Escolha outro apelido.', v_ap
      using errcode = 'P0003';
  end if;

  insert into public.alunos (id, turma_id, apelido, avatar, serie)
  values (v_uid, v_turma.id, v_ap, p_avatar, v_serie)
  on conflict (id) do update
    set turma_id = excluded.turma_id,
        apelido  = excluded.apelido,
        avatar   = excluded.avatar,
        serie    = excluded.serie,
        visto_em = now()
  returning * into v_aluno;

  -- Garante a linha de progresso já no primeiro acesso.
  insert into public.progresso (aluno_id) values (v_uid)
  on conflict (aluno_id) do nothing;

  return v_aluno;
end;
$$;

comment on function public.entrar_na_turma(text, text, text, smallint) is
  'Valida o código, cria/atualiza o aluno e garante a linha de progresso.';

-- ---------------------------------------------------------------------------
-- registrar_missao — fecha uma missão de forma atômica
-- ---------------------------------------------------------------------------
-- Incrementa em vez de sobrescrever. Isso evita a corrida clássica de duas
-- abas abertas, em que a última a salvar apagaria o ganho da outra.
--
-- A ofensiva é calculada aqui, com a data do SERVIDOR: relógio de celular
-- mexido não serve mais para forjar dias seguidos de estudo.
create or replace function public.registrar_missao(
  p_moedas    integer,
  p_xp        integer,
  p_acertos   integer,
  p_erros     integer,
  p_gabaritou boolean default false,
  p_combo     integer default 0
)
returns public.progresso
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_hoje  date := current_date;
  v_prog  public.progresso;
begin
  if v_uid is null then
    raise exception 'Sessão não encontrada.';
  end if;

  if p_moedas < 0 or p_xp < 0 or p_acertos < 0 or p_erros < 0 then
    raise exception 'Valores negativos não são aceitos.';
  end if;

  insert into public.progresso (aluno_id) values (v_uid)
  on conflict (aluno_id) do nothing;

  update public.progresso p
  set moedas       = p.moedas + p_moedas,
      xp           = p.xp + p_xp,
      acertos      = p.acertos + p_acertos,
      erros        = p.erros + p_erros,
      missoes      = p.missoes + 1,
      gabaritos    = p.gabaritos + case when p_gabaritou then 1 else 0 end,
      melhor_combo = greatest(p.melhor_combo, p_combo),
      ofensiva_atual = case
        when p.ultimo_dia = v_hoje                  then p.ofensiva_atual
        when p.ultimo_dia = v_hoje - 1              then p.ofensiva_atual + 1
        else 1
      end,
      ultimo_dia = v_hoje
  where p.aluno_id = v_uid
  returning * into v_prog;

  -- O recorde precisa de um segundo passo: depende do valor recém-calculado.
  update public.progresso
  set ofensiva_recorde = greatest(ofensiva_recorde, v_prog.ofensiva_atual)
  where aluno_id = v_uid
  returning * into v_prog;

  update public.alunos set visto_em = now() where id = v_uid;

  return v_prog;
end;
$$;

comment on function public.registrar_missao(integer, integer, integer, integer, boolean, integer) is
  'Fecha a missão somando os ganhos e recalculando a ofensiva com a data do servidor.';

-- ---------------------------------------------------------------------------
-- registrar_respostas — grava a missão inteira numa chamada só
-- ---------------------------------------------------------------------------
-- Oito inserts separados seriam oito idas e voltas no Wi-Fi da escola.
-- Recebe o array JSON que o cliente já monta no missionLog.
create or replace function public.registrar_respostas(p_itens jsonb)
returns integer
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_n   integer;
begin
  if v_uid is null then
    raise exception 'Sessão não encontrada.';
  end if;

  if jsonb_typeof(p_itens) <> 'array' then
    raise exception 'Esperava um array JSON de respostas.';
  end if;

  insert into public.respostas
    (aluno_id, template_id, bncc, materia, serie, nivel, semente, acertou, segundos)
  select
    v_uid,
    item ->> 'template_id',
    item ->> 'bncc',
    item ->> 'materia',
    (item ->> 'serie')::smallint,
    (item ->> 'nivel')::smallint,
    (item ->> 'semente')::bigint,
    (item ->> 'acertou')::boolean,
    nullif(item ->> 'segundos', '')::numeric
  from jsonb_array_elements(p_itens) as item;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

comment on function public.registrar_respostas(jsonb) is
  'Insere em lote as respostas de uma missão. Retorna quantas linhas gravou.';

-- ---------------------------------------------------------------------------
-- Permissões de execução
-- ---------------------------------------------------------------------------
revoke all on function public.gerar_codigo_turma(smallint) from public, anon, authenticated;

grant execute on function public.criar_turma(text, smallint)                                to authenticated;
grant execute on function public.entrar_na_turma(text, text, text, smallint)                to authenticated;
grant execute on function public.registrar_missao(integer, integer, integer, integer, boolean, integer) to authenticated;
grant execute on function public.registrar_respostas(jsonb)                                 to authenticated;
