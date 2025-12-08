## LocustGrub MVP

LocustGrub is a Penn-only food truck radar. We seed a directory of 10 popular trucks and keep their real-time status fresh via lightweight student check-ins. This repository contains:

- A Next.js 15 app with Tailwind styling
- API routes for reading truck status, recording check-ins, and viewing recent submissions
- Minimal QC (rate limiting + required fields) and 30-minute majority-vote aggregation
- A live map (`/map`), top-trucks leaderboard (`/top`), deals/rewards hub (`/deals`), and an internal `/admin` page for debugging submissions

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS
- File-backed JSON store at `data/checkins.json` (swap with Supabase/Neon when ready)
- React Leaflet + OpenStreetMap tiles for the interactive map

## Local development

```bash
npm install          # first time only
npm run dev          # http://localhost:3000
```

### Key routes (all update every 30 seconds)

| Path | Purpose |
| --- | --- |
| `/` | List view with search, plus button to launch the review modal. |
| `/map` | Leaflet map with pins, popovers, and a Google Maps fallback link. |
| `/top` | Top trucks based on past-24h ratings and recent comments. |
| `/deals` | Mocked promotions + explanation of the raffle incentive. |
| `/admin` | Internal log of the last 100 submissions (ratings, raffle opt-ins, etc.). |

### Persistent storage

Check-ins are saved to `data/checkins.json`. The repo bootstraps an empty array so you can run locally without extra services. In production you can replace `src/lib/store.ts` with a Supabase or Postgres adapter—everything else calls the same functions.

### Seed data

Truck metadata lives in `src/data/trucks.ts`. Update/add entries there (id, name, cuisine, usual hours, lat/lng).

## API surfaces

| Route | Method | Description |
| --- | --- | --- |
| `/api/trucks` | GET | Returns aggregated truck statuses (majority vote + recency filtering). |
| `/api/checkin` | POST | Stores `{ truckId, presence, lineLength, comment?, workerId? }`; rate-limited to 3 submissions / 10 min per worker. |
| `/api/admin/submissions` | GET | Last 100 submissions with relative timestamps. |

The home page fetches from `/api/trucks` (and revalidates after each submission). The `/admin` page renders server-side.

## Suggested workflow

1. Run `npm run dev`.
2. Visit `/` to see the seeded trucks and submit check-ins.
3. Use `/admin` to confirm they landed, copy into analysis notebooks, or export JSON.
4. For evaluation, collect real ground-truth checks during lunch and compare against `/api/trucks`.

## Quality control checklist

- **Penn email verification + code**: Users must verify an `@upenn.edu` address before the review modal unlocks. Demo codes show inline since we don't send real emails yet.
- **Location checker**: We request browser geolocation, verify it sits inside a pre-defined Penn bounding box, and block submissions otherwise (with an override that requires a 10+ character note).
- **Bad word filter**: Server rejects comments containing common profanity.
- **Rate limiting**: Max 3 submissions per worker per 10 minutes.
- **Raffle opt-in**: Every verified review can opt into the weekly “free meal” drawing; `/admin` shows the flag so we can audit entries.

## Future stretch goals

- Swap the JSON store for Supabase or Neon (see `src/lib/store.ts`).
- Add worker reliability and gold checks in `src/lib/truck-service.ts`.
- Layer in a Leaflet/Mapbox map view to complement the list UI.
- Automate analytics notebooks that read from `/api/admin/submissions`.
