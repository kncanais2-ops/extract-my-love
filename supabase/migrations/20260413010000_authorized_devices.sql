-- Tabela de dispositivos autorizados (1 por usuário)
create table if not exists public.authorized_devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  fingerprint text not null,
  device_label text,
  authorized_at timestamptz default now() not null
);

create index if not exists idx_authorized_devices_user on public.authorized_devices(user_id);

alter table public.authorized_devices enable row level security;

-- Usuários autenticados podem ler seu próprio dispositivo
create policy "Users can read own device"
  on public.authorized_devices for select
  to authenticated
  using (auth.uid() = user_id);

-- Usuários autenticados podem inserir seu próprio dispositivo (primeiro login)
create policy "Users can insert own device"
  on public.authorized_devices for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins podem ler e deletar qualquer dispositivo
create policy "Admins can read all devices"
  on public.authorized_devices for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

create policy "Admins can delete any device"
  on public.authorized_devices for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
