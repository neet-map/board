-- プロファイルテーブルの作成（外部キー制約なし）
create table public.profiles (
  id uuid not null primary key,
  display_name text,
  bio text,
  avatar_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(display_name) >= 3)
);

-- RLS (Row Level Security) の有効化
alter table public.profiles enable row level security;

-- ポリシーの作成
create policy "プロファイルは誰でも閲覧可能" on public.profiles for select using (true);

create policy "ユーザーは自分のプロファイルのみ更新可能" on public.profiles for update using (auth.uid() = id);

create policy "ユーザーは自分のプロファイルのみ挿入可能" on public.profiles for insert with check (auth.uid() = id);

-- 新規ユーザー登録時に自動でプロファイルを作成するトリガー
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$;

-- トリガーの設定
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- プロファイル更新時のupdated_at自動更新
create function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();