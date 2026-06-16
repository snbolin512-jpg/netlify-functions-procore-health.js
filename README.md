# OhmBoy / Ωboy V0.19 — API Intake Backend Readiness

V0.19 is the serious backend readiness build for testing real-world API/webhook intake.

Added:
- Backend event intake endpoint
- Event-store abstraction with Netlify Blobs support
- Raw event storage
- Normalized event storage
- Drawing revision normalization
- Schedule revision normalization
- API Intake Monitor page
- Drawing and schedule simulation buttons
- Event listing API
- Packet candidate promotion endpoint
- Backend health endpoint

New backend endpoints:
- `POST /.netlify/functions/ohmboy-api-intake`
- `GET /.netlify/functions/ohmboy-api-events`
- `DELETE /.netlify/functions/ohmboy-api-events`
- `POST /.netlify/functions/ohmboy-api-promote-packet`
- `GET /.netlify/functions/ohmboy-api-health`

Safety:
- Read-only intake only.
- No Procore writeback.
- No automatic RFI creation.
- No automatic CO creation.
- No automatic project mutation until reviewed/promoted.

Environment variable:
- `OHMBOY_WEBHOOK_SECRET` optional for simulation. When configured, intake requires an HMAC SHA-256 signature.

Retained:
- V0.18.11 internal resolution audit fix
- No Code Drilldowns
- Branch Resolution Notes
- Audit Trail resolution columns
- Existing cockpit/reporting/financial/Procore skeleton features


## V0.19.1 Function Deploy Diagnostics

This version specifically addresses the `Non-JSON response` / Netlify `Page not found` issue.

Meaning:
- A Netlify 404 HTML page from `/.netlify/functions/...` means the function route does not exist in the active deploy.
- The most likely cause is that the deployed site does not include the `netlify/functions` folder or Netlify did not run a function-capable deploy.

New:
- Run Backend Health Check button.
- Diagnostic box showing HTTP status, content-type, and first part of the returned response.
- Functions now catch errors and return JSON 500s instead of crashing silently.
- Added `API_BACKEND_DEPLOY_CHECKLIST.md`.

Start with:
`/.netlify/functions/ohmboy-api-health`


## V0.19.2 API Route Compatibility

This version adds API aliases and route testing.

The app now tries:
- `/.netlify/functions/...`
- `/api/ohmboy-api-*`
- short `/api/*` aliases

If every route returns 404, the active deploy does not include Netlify Functions.


## V0.19.3 Storage Persistence Diagnostics

This version separates two problems:

1. API intake route works
2. Durable backend storage works

If simulations show in the session mirror but the backend event count is 0, then intake is working but durable storage is not active.

Check the Health response:
- `storageMode: "netlify-blobs"` = durable storage active
- `storageMode: "memory-fallback"` = events disappear between function calls

If memory fallback is active, Netlify likely did not install/use `@netlify/blobs` or the deployed environment does not support Netlify Blobs.


## V0.19.4 Modern Blobs Functions

This version adds modern Netlify Functions v2-style `.mjs` endpoints to avoid Lambda compatibility issues with Netlify Blobs.

New endpoints:
- `/.netlify/functions/ohmboy-api-health-v2`
- `/.netlify/functions/ohmboy-api-events-v2`
- `/.netlify/functions/ohmboy-api-intake-v2`
- `/.netlify/functions/ohmboy-api-promote-packet-v2`

Aliases:
- `/api/v2/health`
- `/api/v2/events`
- `/api/v2/intake`
- `/api/v2/promote-packet`

The frontend tries the v2 routes first, then falls back to the older Lambda-style routes.
