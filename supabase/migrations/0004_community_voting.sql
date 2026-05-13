-- Community flavor voting.
-- Customers submit donut flavor ideas; anyone signed in can upvote them.
-- One vote per user per suggestion — enforced by composite PK.

-- ─── Suggestions ───
create table if not exists public.flavor_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  -- Lets admins hide a suggestion without deleting (spam, off-brand, etc).
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists flavor_suggestions_visible_idx
  on public.flavor_suggestions(is_visible)
  where is_visible = true;

-- Sanity caps so accidental long text submissions don't bloat the table.
alter table public.flavor_suggestions
  add constraint flavor_suggestions_name_len check (char_length(name) <= 80);

alter table public.flavor_suggestions
  add constraint flavor_suggestions_description_len
  check (description is null or char_length(description) <= 280);

-- ─── Votes ───
-- Composite PK (suggestion_id, user_id) makes "one vote per user per
-- suggestion" a database invariant, not a TOCTOU race in app code.
create table if not exists public.flavor_votes (
  suggestion_id uuid not null
    references public.flavor_suggestions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

create index if not exists flavor_votes_suggestion_idx
  on public.flavor_votes(suggestion_id);
create index if not exists flavor_votes_user_idx
  on public.flavor_votes(user_id);

-- ─── RLS ───
-- Suggestions are publicly readable (visible only). Anyone can insert when
-- signed in. Only admins can hide/delete (we'll wire that later — for now
-- update/delete are blocked at the policy level).
alter table public.flavor_suggestions enable row level security;
alter table public.flavor_votes enable row level security;

drop policy if exists "suggestions_select_visible" on public.flavor_suggestions;
create policy "suggestions_select_visible" on public.flavor_suggestions
  for select using (is_visible = true);

drop policy if exists "suggestions_insert_authed" on public.flavor_suggestions;
create policy "suggestions_insert_authed" on public.flavor_suggestions
  for insert
  with check (
    auth.uid() is not null and created_by_user_id = auth.uid()
  );

-- Votes: signed-in users can read all votes (so the FE can show "you voted"
-- accurately), insert their own, and delete their own (unvote).
drop policy if exists "votes_select_all" on public.flavor_votes;
create policy "votes_select_all" on public.flavor_votes
  for select using (true);

drop policy if exists "votes_insert_self" on public.flavor_votes;
create policy "votes_insert_self" on public.flavor_votes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "votes_delete_self" on public.flavor_votes;
create policy "votes_delete_self" on public.flavor_votes
  for delete using (auth.uid() = user_id);
