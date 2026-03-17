-- Users table (handled by Supabase Auth)
-- We extend it with a profiles table

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Puzzles table
create table public.puzzles (
  id serial primary key,
  type text not null,
  sequence_order integer not null,
  title text not null,
  description text not null,
  solution_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hints table
create table public.hints (
  id serial primary key,
  puzzle_id integer references public.puzzles(id) on delete cascade,
  level integer not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Game sessions table
create table public.game_sessions (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  status text default 'active' check (status in ('active', 'completed', 'timeout', 'abandoned')),
  time_remaining integer default 1500,
  completion_time integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Puzzle progress table
create table public.puzzle_progress (
  id serial primary key,
  game_session_id integer references public.game_sessions(id) on delete cascade,
  puzzle_id integer references public.puzzles(id) on delete cascade,
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  is_completed boolean default false,
  attempts integer default 0,
  hints_used integer default 0,
  time_spent integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Rankings table
create table public.rankings (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  completion_time integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.puzzles enable row level security;
alter table public.hints enable row level security;
alter table public.game_sessions enable row level security;
alter table public.puzzle_progress enable row level security;
alter table public.rankings enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

create policy "Puzzles are viewable by authenticated users" on public.puzzles for select using (auth.role() = 'authenticated');

create policy "Hints are viewable by authenticated users" on public.hints for select using (auth.role() = 'authenticated');

create policy "Users can view their own sessions" on public.game_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions" on public.game_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own sessions" on public.game_sessions for update using (auth.uid() = user_id);

create policy "Users can view their own progress" on public.puzzle_progress for select using (
  exists (select 1 from public.game_sessions where id = game_session_id and user_id = auth.uid())
);
create policy "Users can insert their own progress" on public.puzzle_progress for insert with check (
  exists (select 1 from public.game_sessions where id = game_session_id and user_id = auth.uid())
);
create policy "Users can update their own progress" on public.puzzle_progress for update using (
  exists (select 1 from public.game_sessions where id = game_session_id and user_id = auth.uid())
);

create policy "Rankings are viewable by everyone" on public.rankings for select using (true);
create policy "Users can insert their own ranking" on public.rankings for insert with check (auth.uid() = user_id);
create policy "Users can update their own ranking" on public.rankings for update using (auth.uid() = user_id);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
