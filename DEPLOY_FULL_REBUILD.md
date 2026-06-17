# Deploy Ωboy V0.20 Full Restore

Upload this package into the empty repo exactly as-is.

Root should contain:

```text
assets/
netlify/
scripts/
BUILD_VALIDATION_REPORT.md
DATA_MODEL_NOTES.md
DATA_MODEL_SCHEMA.json
DEPLOY_FULL_REBUILD.md
DEPLOY_NOTES.md
README.md
index.html
netlify.toml
package.json
```

Function folder should contain only:

```text
netlify/functions/_lib/store.js
netlify/functions/procore-health.js
netlify/functions/procore-mock-event.js
netlify/functions/procore-webhook.js
netlify/functions/procore-process-event.js
netlify/functions/procore-auth-start.js
netlify/functions/procore-auth-callback.js
netlify/functions/ohmboy-health.js
netlify/functions/ohmboy-events.js
netlify/functions/ohmboy-clear.js
```

There should be no:

```text
ohmboy-api-health.js
ohmboy-api-events.js
ohmboy-api-intake.js
ohmboy-api-health-v2.mjs
ohmboy-api-events-v2.mjs
ohmboy-api-intake-v2.mjs
```

## Netlify settings

Use:

```text
Base directory: blank or /
Build command: echo OhmBoy V0.20 full restore static build
Publish directory: .
Functions directory: netlify/functions
```

## First test

Open:

```text
https://YOUR-SITE.netlify.app/.netlify/functions/procore-health
```

If the latest deploy failed, Netlify will keep serving the previous successful deploy. Only a successful published deploy changes the live site.
