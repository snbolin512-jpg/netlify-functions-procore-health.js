# Deploy Clean Rewrite

## Stop patching. Replace the repo.

In GitHub:

1. Delete old root files from the previous OhmBoy build.
2. Delete the old `netlify/functions` folder.
3. Upload this clean package exactly as-is.

Root must contain:

```text
index.html
netlify.toml
package.json
README.md
DEPLOY_CLEAN_REWRITE.md
```

Function folder must contain:

```text
netlify/functions/ohmboy-health.js
netlify/functions/ohmboy-events.js
netlify/functions/ohmboy-intake.js
netlify/functions/ohmboy-clear.js
netlify/functions/ohmboy-promote.js
netlify/functions/ohmboy-packet-ledger.js
netlify/functions/_lib/store.js
```

There should be no old `ohmboy-api-*` files.

## Netlify settings

Use:

```text
Base directory: blank or /
Build command: npm install && npm run validate
Publish directory: .
Functions directory: netlify/functions
```

## First test after deploy

Open:

```text
https://YOUR-SITE.netlify.app/.netlify/functions/ohmboy-health
```

Expected:

```json
{
  "ok": true,
  "version": "rewrite-v1-clean-storage",
  "storage": {
    "backend": "netlify-blobs",
    "durable": true
  },
  "roundTrip": {
    "ok": true
  }
}
```

If that fails, do not test the UI. Open the function log and read the JSON error.
