# Deploy Notes — OhmBoy V0.19 API Intake Backend

Upload/replace the full package at the GitHub repo root.

Confirm these files/folders exist:
- `index.html`
- `package.json`
- `netlify.toml`
- `netlify/functions/ohmboy-api-intake.js`
- `netlify/functions/ohmboy-api-events.js`
- `netlify/functions/ohmboy-api-promote-packet.js`
- `netlify/functions/ohmboy-api-health.js`
- `netlify/functions/_lib/ohmboy-backend-store.js`

Netlify test:
1. Deploy the site.
2. Let Netlify install dependencies from package.json.
3. Optional: set `OHMBOY_WEBHOOK_SECRET`.
4. Open `/.netlify/functions/ohmboy-api-health`.

Frontend test:
1. Open the deployed app.
2. Open API Intake Monitor.
3. Click Sim Drawing Revision Event.
4. Confirm event appears.
5. Click Sim Schedule Revision Event.
6. Confirm event appears.
7. Refresh browser.
8. Confirm events persist if Netlify Blobs is active.

Manual webhook test: POST JSON to `/.netlify/functions/ohmboy-api-intake`.


## V0.19.1 Critical API Deploy Test

Before using the simulation buttons, open:

`/.netlify/functions/ohmboy-api-health`

If this returns Netlify Page Not Found HTML, then the backend functions are not deployed. Fix the deploy before testing simulations.
