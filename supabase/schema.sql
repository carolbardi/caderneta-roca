-- Caderneta Roça: estrutura do banco.
-- Rodar uma vez no Supabase (SQL Editor > New query > colar > Run).
-- Depois rodar supabase/dados-iniciais.local.sql (fica só no seu computador).

create extension if not exists pgcrypto;

-- Quem pode entrar
create table if not exists public.membros (
  email text primary key check (email = lower(email)),
  nome  text not null
);

create or replace function public.eh_membro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.membros
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Linhas do orçamento
create table if not exists public.canteiros (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  grupo          text not null check (grupo in ('fixo', 'variavel', 'reserva')),
  limite_mensal  numeric(10, 2) not null default 0 check (limite_mensal >= 0),
  limite_semanal numeric(10, 2) check (limite_semanal is null or limite_semanal >= 0),
  icone          text not null default 'folha',
  ordem          int not null default 0,
  ativo          boolean not null default true,
  termina_em     date,
  criado_em      timestamptz not null default now()
);

create table if not exists public.gastos (
  id          uuid primary key default gen_random_uuid(),
  data        date not null default current_date,
  valor       numeric(10, 2) not null check (valor > 0),
  canteiro_id uuid not null references public.canteiros (id) on delete restrict,
  quem        text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  obs         text,
  criado_em   timestamptz not null default now()
);

create index if not exists gastos_data_idx on public.gastos (data);
create index if not exists gastos_canteiro_idx on public.gastos (canteiro_id);

-- Receitas. mes nulo = entra todo mês; mes preenchido (dia 1) = só naquele mês.
create table if not exists public.entradas (
  id        uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor     numeric(10, 2) not null check (valor >= 0),
  mes       date check (mes is null or extract(day from mes) = 1),
  criado_em timestamptz not null default now()
);

-- Segurança: só membros leem e escrevem
alter table public.membros   enable row level security;
alter table public.canteiros enable row level security;
alter table public.gastos    enable row level security;
alter table public.entradas  enable row level security;

drop policy if exists membros_ler on public.membros;
create policy membros_ler on public.membros
  for select to authenticated using (public.eh_membro());

drop policy if exists canteiros_membros on public.canteiros;
create policy canteiros_membros on public.canteiros
  for all to authenticated using (public.eh_membro()) with check (public.eh_membro());

drop policy if exists gastos_membros on public.gastos;
create policy gastos_membros on public.gastos
  for all to authenticated using (public.eh_membro()) with check (public.eh_membro());

drop policy if exists entradas_membros on public.entradas;
create policy entradas_membros on public.entradas
  for all to authenticated using (public.eh_membro()) with check (public.eh_membro());

revoke all on public.membros, public.canteiros, public.gastos, public.entradas from anon;
grant usage on schema public to authenticated;
grant select on public.membros to authenticated;
grant select, insert, update, delete on public.canteiros, public.gastos, public.entradas to authenticated;
grant execute on function public.eh_membro() to authenticated;

-- Atualização ao vivo entre os dois celulares
do $$
begin
  begin
    alter publication supabase_realtime add table public.canteiros, public.gastos, public.entradas;
  exception when duplicate_object then null;
  end;
end $$;
