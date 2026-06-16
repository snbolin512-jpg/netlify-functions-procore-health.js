# OhmBoy V0.19.1 — API Backend Deploy Checklist

The error you saw was Netlify's static 404 HTML page. That means the function route was not deployed.

## What the 404 means

If this URL returns Netlify's Page Not Found page:

`/.netlify/functions/ohmboy-api-events`

then the Netlify functions are missing from the active deploy.

This is not a drawing/schedule simulation payload problem. It is a deployment/configuration issue.

## Confirm these files are in the deployed repo root

- `netlify.toml`
- `package.json`
- `netlify/functions/ohmboy-api-health.js`
- `netlify/functions/ohmboy-api-intake.js`
- `netlify/functions/ohmboy-api-events.js`
- `netlify/functions/ohmboy-api-promote-packet.js`
- `netlify/functions/_lib/ohmboy-backend-store.js`

## Best deploy method

Use a Git-connected Netlify deploy from the repo root.

Do not deploy only `index.html`.
Do not deploy a static-only folder that excludes `netlify/functions`.
Do not drag/drop only the frontend file.

## First test after deploy

Open this directly in the browser:

`https://YOUR-SITE.netlify.app/.netlify/functions/ohmboy-api-health`

Expected result: JSON with `"ok": true`.

If you still get Page Not Found, the functions are still not deployed.
