# PSA Valencia Open
Base project.

## Supabase centralizado de contenido

Para que Admin y la web compartan contenido entre dispositivos, crea esta tabla en Supabase SQL Editor:

```sql
create table if not exists public.site_content (
	content_key text primary key,
	content_value jsonb not null,
	updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated write site content" on public.site_content;
create policy "Authenticated write site content"
on public.site_content
for all
to authenticated
using (true)
with check (true);
```

Claves sincronizadas en la nube:
- tournamentContentMode
- tournamentApiUrl
- drawBracketState
- liveStreamYoutubeUrl
- liveStreamYoutubeHistory
- galleryCollections
- newsCollection
- sponsorsCollection
- playersCollection
- tournamentManualContent
- heroSettings