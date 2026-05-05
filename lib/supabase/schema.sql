-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  template_type text not null,
  status text not null default 'draft', -- draft | generating | completed | failed
  storyboard jsonb,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Videos table
create table videos (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending', -- pending | generating | completed | failed
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  metadata jsonb default '{}',
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- Scenes table
create table scenes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  scene_index integer not null,
  description text,
  image_prompt text,
  video_prompt text,
  image_url text,
  video_clip_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Brand settings table
create table brand_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  restaurant_name text default 'Das Steakhouse',
  logo_url text,
  primary_color text default '#c9a84c',
  cta_reservation_url text,
  cta_voucher_url text,
  cta_catering_url text,
  cta_events_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Templates table (custom user templates)
create table templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  config jsonb default '{}',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Daily usage tracking
create table usage_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  videos_generated integer default 0,
  unique(user_id, date)
);

-- RLS Policies
alter table projects enable row level security;
alter table videos enable row level security;
alter table scenes enable row level security;
alter table brand_settings enable row level security;
alter table templates enable row level security;
alter table usage_tracking enable row level security;

-- Projects policies
create policy "Users can manage own projects"
  on projects for all using (auth.uid() = user_id);

-- Videos policies
create policy "Users can manage own videos"
  on videos for all using (auth.uid() = user_id);

-- Scenes policies
create policy "Users can manage own scenes"
  on scenes for all using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Brand settings policies
create policy "Users can manage own brand settings"
  on brand_settings for all using (auth.uid() = user_id);

-- Templates policies
create policy "Users can manage own templates"
  on templates for all using (auth.uid() = user_id);

-- Usage tracking policies
create policy "Users can manage own usage"
  on usage_tracking for all using (auth.uid() = user_id);

-- Updated at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at before update on projects
  for each row execute procedure handle_updated_at();

create trigger brand_settings_updated_at before update on brand_settings
  for each row execute procedure handle_updated_at();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('videos', 'videos', true);
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

-- Storage policies
create policy "Users can upload own videos"
  on storage.objects for insert with check (
    bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Videos are publicly readable"
  on storage.objects for select using (bucket_id in ('videos', 'thumbnails', 'logos'));

create policy "Users can upload logos"
  on storage.objects for insert with check (
    bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
  );
