# OhmBoy V0.19.6 Dynamic Blobs Patch

This patch uses the already-working `.js` Netlify function routes and fixes durable storage with dynamic import.

Upload/replace at repo root:
```text
index.html
package.json
```

Upload/replace inside `netlify/functions`:
```text
ohmboy-api-health.js
ohmboy-api-events.js
ohmboy-api-intake.js
```

Upload/replace inside `netlify/functions/_lib`:
```text
ohmboy-backend-store.js
```

After redeploy, test:
```text
/.netlify/functions/ohmboy-api-health
```

Expected:
```text
runtime: lambda-js-dynamic-import-blobs
storage.backend: netlify-blobs-dynamic
```
