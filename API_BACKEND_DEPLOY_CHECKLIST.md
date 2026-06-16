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


## V0.19.2 Route Compatibility Check

The frontend now tests these routes:

Health:
- `/.netlify/functions/ohmboy-api-health`
- `/api/ohmboy-api-health`
- `/api/health`

Events:
- `/.netlify/functions/ohmboy-api-events`
- `/api/ohmboy-api-events`
- `/api/events`

Intake:
- `/.netlify/functions/ohmboy-api-intake`
- `/api/ohmboy-api-intake`
- `/api/intake`

If all routes return 404, the functions are not deployed.

Most likely causes:
1. Netlify is deploying from the wrong base directory.
2. The repo root on Netlify does not contain `netlify.toml`.
3. The deployed branch does not contain `netlify/functions`.
4. A drag-and-drop/static deploy was used instead of a function-capable deploy.
5. Netlify publish directory points to a folder that excludes the function config/deploy context.

Netlify deploy log should show function bundling. Look for lines like:
- Packaging Functions from netlify/functions directory
- Functions bundling complete
