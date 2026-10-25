-- Tables for LinkedIn Content Planner

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  category uuid references categories(id) on delete set null,
  scheduled_date date,
  status text not null check (status in ('draft','scheduled','published')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  media_type text check (media_type in ('image','video')),
  media_url text,
  media_alt text,
  user_id uuid references auth.users(id) on delete cascade
);
