-- Tabela de assinaturas/validade de conta
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.user_subscriptions enable row level security;

-- Usuário pode ler sua própria assinatura
create policy "Users can read own subscription"
  on public.user_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Index para busca rápida
create index idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index idx_user_subscriptions_expires_at on public.user_subscriptions(expires_at);
