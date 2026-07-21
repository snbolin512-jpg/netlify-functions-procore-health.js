# OhmBoy Procore Backend

The piece that was missing: this actually talks to Procore. It does OAuth2
so the app can act on your behalf, listens for a webhook every time a
drawing gets a new revision or a schedule activity changes, fetches the
full detail, and turns it into a "workable packet" that OhmBoy's frontend
can display.

## What this does NOT do yet
- No database — tokens and packets are stored as JSON files on disk
  (`.tokens.json`, `.packets.json`). Fine for one server, wrong for scale.
  See the comments in `src/tokenStore.js` and `src/packetStore.js`.
- No retry/dead-letter queue if a webhook fails to process.
- Field names in `src/transform.js` are best-guesses from Procore's public
  docs. Log a real payload and adjust them (see step 5 below).

## Crew/area routing (`crew-map.json`)
Every packet gets a `notify` field saying who should see it. That's driven
by `crew-map.json` in this folder — edit it, no code changes or restart
needed:
```json
{
  "byArea": { "Data Hall 3": "Crew A — Feeders" },
  "byDiscipline": { "Grounding": "Crew C — Grounding" },
  "scheduleDefault": "Superintendent",
  "default": "Project Engineer"
}
```
Lookup order: area match, then discipline match, then the default
(`scheduleDefault` for schedule packets, `default` for everything else).
Fill in your real area names once you've seen a live payload — they need
to match what Procore actually calls each area/room for the lookup to hit.

## Test it before you touch real Procore credentials
```
node test/transform.test.js
```
Runs the transform + crew-routing logic against realistic fake data and
checks the output. This is the fastest way to confirm your `crew-map.json`
edits resolve the way you expect, before step 1 below even happens.

## 1. Register a Procore app
1. Go to the Procore Developer Portal, create a new app.
2. Set the **Redirect URI** to match `PROCORE_REDIRECT_URI` in your `.env`
   exactly (including protocol and trailing slash or lack thereof).
3. Note your `client_id` and `client_secret`.
4. Confirm your Procore contract includes API + Webhooks access — not all
   plans do.

## 2. Configure
```
cp .env.example .env
```
Fill in `PROCORE_CLIENT_ID`, `PROCORE_CLIENT_SECRET`, `PROCORE_REDIRECT_URI`,
`PROCORE_PROJECT_ID`. Generate a long random string for
`PROCORE_WEBHOOK_SECRET` — you'll paste this into Procore in step 4.

## 3. Run it and connect once
```
npm install
npm start
```
Visit `http://localhost:4000/auth/procore/login` in a browser, log into
Procore, approve the app. You'll land back on the callback route and the
server stores your access + refresh tokens.

## 4. Set up the webhook in Procore
1. In Procore: Project Admin > Project Settings > Webhooks > Create Hook.
2. Endpoint URL: `https://<your-deployed-backend>/webhooks/procore`
   (this won't work with `localhost` — see the ngrok note below for local
   testing).
3. Authorization Header: paste the exact same value you put in
   `PROCORE_WEBHOOK_SECRET`.
4. Add Triggers for the resources you care about — drawings/revisions and
   schedule activities. The exact trigger names depend on your Procore API
   version; the Webhooks admin UI lists what's available for your account.

### Testing locally before you deploy
Webhooks need a public URL. Use `ngrok http 4000` (or similar) to get a
temporary public URL, and use that as the Endpoint URL in step 4 while you
test. Swap it for your real deployed URL once you go live.

## 5. Check what Procore actually sends you
Trigger a real drawing revision or schedule change in Procore and watch
your server logs. `console.log(JSON.stringify(event))` in
`webhookRoutes.js`'s `processEvent()` if you want to see the raw webhook
body, and do the same with the fetched resource in `procoreClient.js`.
Compare those field names against what `transform.js` expects and adjust
— this is the one step you can't skip, because I built the field mapping
from documentation, not a live payload.

## 6. Deploy
Any Node host works — Render, Railway, Fly.io, a plain VM. Just:
- Set the same env vars there.
- Make sure disk persists between deploys/restarts (or swap in a real DB —
  see the warnings in `tokenStore.js` / `packetStore.js`). Skip Vercel/
  Netlify serverless functions for this specific app; their filesystem
  doesn't persist between invocations, which breaks the token/packet
  storage as written.
- Point `PROCORE_REDIRECT_URI` and the webhook Endpoint URL at the real
  deployed domain, and redo steps 3–4 once against production.

## 7. Point OhmBoy's frontend at it
In `OhmBoy.jsx`, set:
```js
const BACKEND_URL = "https://your-backend.example.com";
```
That's it — `ingest()` in the frontend already knows to poll
`GET /api/packets` when `BACKEND_URL` is set, and falls back to demo data
when it's blank.
