-- Tabela para rastrear histórico de login com IP e localização
create table if not exists public.login_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ip_address text not null,
  region text,
  city text,
  country text,
  isp text,
  logged_in_at timestamptz default now() not null
);

-- Index para consultas por usuário
create index if not exists idx_login_logs_user_id on public.login_logs(user_id);
create index if not exists idx_login_logs_logged_in_at on public.login_logs(logged_in_at desc);

-- RLS
alter table public.login_logs enable row level security;

-- Usuários autenticados podem inserir seus próprios logs
create policy "Users can insert own login logs"
  on public.login_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins podem ler todos os logs
create policy "Admins can read all login logs"
  on public.login_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
