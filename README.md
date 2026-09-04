# LBL Backend

REST API for the Littoral Basketball League site. Express + a JSON-file data
store (`data/db.json`) — no external database to install. Mirrors the data
model currently used by `src/context/AppContext.jsx` on the frontend
(teams, games, news, announcements, highlights, donations, tickets,
standings, support tickets), so wiring the frontend up later is a matter of
swapping `localStorage` reads/writes for `fetch` calls to this API.

## Setup

```
cd back_end
npm install
cp .env.example .env
npm run hash-password -- "yourAdminPassword"
# paste the printed hash into .env as ADMIN_PASSWORD_HASH, set ADMIN_EMAIL and JWT_SECRET
npm run dev
```

Server runs at `http://localhost:4000` by default. Health check: `GET /health`.

## Auth

Only the admin dashboard writes data, so every mutating request (POST/PUT/PATCH/DELETE)
requires a JWT, except public-facing submissions (buying a ticket, donating,
filing a support request, liking/disliking news) which stay open.

```
POST /api/auth/login          { "email": "...", "password": "..." }  -> { token }
```

Send the token back as `Authorization: Bearer <token>`.

## Endpoints

| Resource | Base path | Notes |
| --- | --- | --- |
| Teams | `/api/teams` | Deleting/renaming a team keeps `standings` in sync |
| Games | `/api/games` | `PATCH /:id/score`, `PATCH /:id/status`, `POST /reset-season` |
| News | `/api/news` | `PATCH /:id/publish`, `/:id/featured`, `/:id/like`, `/:id/dislike` (like/dislike are public) |
| Announcements | `/api/announcements` | plain CRUD |
| Highlights | `/api/highlights` | plain CRUD, seeds `views`/`likes` to 0 |
| Standings | `/api/standings` | `POST /recalculate` (body: homeTeam, awayTeam, homeScore, awayScore), `POST /reset` |
| Tickets | `/api/tickets` | `POST /` is public (a purchase), returns `{ ticket, receipt }` |
| Donations | `/api/donations` | `POST /` is public, returns `{ donation, receipt }` |
| Support tickets | `/api/support-tickets` | `POST /` is public |
| Season | `POST /api/season/reset` | resets all games + standings, matches the admin "Reset Season" action |

All list/detail GET routes return plain arrays/objects with the same shape
the frontend already produces (e.g. a game has `id`, `home`, `away`, `date`,
`time`, `venue`, `youtube`, `status`, `homeScore`, `awayScore`, `quarters`).

## Data storage

Everything lives in `data/db.json`, created automatically on first run. It's
git-ignored — back it up or swap `src/db/store.js` for a real database later
without touching the route layer.
# lbl-back-end
