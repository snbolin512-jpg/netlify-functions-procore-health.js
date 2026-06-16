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


## V0.19.2 Route Alias Test

After deployment, test these directly:

1. `/.netlify/functions/ohmboy-api-health`
2. `/api/health`

Both should return JSON.

If both return 404, inspect:
- Netlify deploy branch
- Base directory
- Publish directory
- Whether `netlify/functions` exists in the deployed branch
- Deploy log for function bundling


## V0.19.3 Storage Test

After redeploy:
1. Run Backend Health Check.
2. Look for storageMode.
3. If storageMode is `memory-fallback`, simulation events will not persist in backend list.
4. If storageMode is `netlify-blobs`, events should persist and Loaded count should increase.


## V0.19.4 Modern Blobs Function Test

After deploy, test directly:

`/.netlify/functions/ohmboy-api-health-v2`

Expected:
- `ok: true`
- `runtime: "modern-netlify-functions"`
- `storage.backend: "netlify-blobs-modern"`

Then test:
- Sim Drawing Revision Event
- Sim Schedule Revision Event
- Refresh Intake Events


## V0.19.5 Deploy Requirements

Upload/confirm these V2 files in GitHub:

```text
netlify/functions/ohmboy-api-health-v2.mjs
netlify/functions/ohmboy-api-events-v2.mjs
netlify/functions/ohmboy-api-intake-v2.mjs
netlify/functions/ohmboy-api-promote-packet-v2.mjs
netlify/functions/_lib/ohmboy-blob-store-v2.mjs
```

Also replace root:
```text
index.html
netlify.toml
package.json
```

Direct test:
```text
/.netlify/functions/ohmboy-api-health-v2
```


## V0.19.6 Deploy Requirements

Upload/replace:
```text
index.html
package.json
netlify/functions/ohmboy-api-health.js
netlify/functions/ohmboy-api-events.js
netlify/functions/ohmboy-api-intake.js
netlify/functions/_lib/ohmboy-backend-store.js
```

Direct health test:
```text
/.netlify/functions/ohmboy-api-health
```

Expected:
```text
runtime: lambda-js-dynamic-import-blobs
storage.backend: netlify-blobs-dynamic
```
