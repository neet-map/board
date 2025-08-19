-- チケットテーブルの作成
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id) not null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint title_length check (char_length(title) >= 1 and char_length(title) <= 200)
);

-- チケットコメントテーブルの作成
create table public.ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint content_length check (char_length(content) >= 1)
);

-- チケットタグテーブルの作成
create table public.ticket_tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text not null default '#6b7280',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint name_length check (char_length(name) >= 1 and char_length(name) <= 50)
);

-- チケットとタグの多対多関係テーブル
create table public.ticket_tag_relations (
  ticket_id uuid references public.tickets(id) on delete cascade,
  tag_id uuid references public.ticket_tags(id) on delete cascade,
  primary key (ticket_id, tag_id)
);

-- インデックスの作成
create index idx_tickets_status on public.tickets(status);
create index idx_tickets_priority on public.tickets(priority);
create index idx_tickets_assigned_to on public.tickets(assigned_to);
create index idx_tickets_created_by on public.tickets(created_by);
create index idx_tickets_due_date on public.tickets(due_date);
create index idx_ticket_comments_ticket_id on public.ticket_comments(ticket_id);
create index idx_ticket_comments_user_id on public.ticket_comments(user_id);

-- RLS (Row Level Security) の有効化
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_tags enable row level security;
alter table public.ticket_tag_relations enable row level security;

-- チケットのポリシー
create policy "チケットは認証済みユーザーが閲覧可能" on public.tickets 
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーはチケットを作成可能" on public.tickets 
  for insert with check (auth.role() = 'authenticated' and auth.uid() = created_by);

create policy "チケット作成者と担当者は更新可能" on public.tickets 
  for update using (auth.uid() = created_by or auth.uid() = assigned_to);

create policy "チケット作成者は削除可能" on public.tickets 
  for delete using (auth.uid() = created_by);

-- コメントのポリシー
create policy "コメントは認証済みユーザーが閲覧可能" on public.ticket_comments 
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーはコメントを作成可能" on public.ticket_comments 
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "コメント作成者は自分のコメントを更新可能" on public.ticket_comments 
  for update using (auth.uid() = user_id);

create policy "コメント作成者は自分のコメントを削除可能" on public.ticket_comments 
  for delete using (auth.uid() = user_id);

-- タグのポリシー
create policy "タグは認証済みユーザーが閲覧可能" on public.ticket_tags 
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーはタグを作成可能" on public.ticket_tags 
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーはタグを更新可能" on public.ticket_tags 
  for update using (auth.role() = 'authenticated');

-- タグ関係のポリシー
create policy "タグ関係は認証済みユーザーが閲覧可能" on public.ticket_tag_relations 
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーはタグ関係を管理可能" on public.ticket_tag_relations 
  for all using (auth.role() = 'authenticated');

-- updated_at自動更新のトリガー
create trigger on_tickets_updated
  before update on public.tickets
  for each row execute procedure public.handle_updated_at();

create trigger on_ticket_comments_updated
  before update on public.ticket_comments
  for each row execute procedure public.handle_updated_at();

-- 初期タグデータの挿入
insert into public.ticket_tags (name, color) values 
  ('バグ', '#ef4444'),
  ('機能追加', '#10b981'),
  ('改善', '#f59e0b'),
  ('ドキュメント', '#3b82f6'),
  ('質問', '#8b5cf6'),
  ('緊急', '#dc2626');
