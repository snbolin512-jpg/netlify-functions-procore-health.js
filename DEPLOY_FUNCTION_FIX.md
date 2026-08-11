# Ωboy V0.21.8 Function Deployment Fix

This package fixes the current 404 at:

https://zesty-cucurucho-18064f.netlify.app/.netlify/functions/procore-health

Netlify settings:
- Base directory: blank
- Build command: npm run build
- Publish directory: .
- Functions directory: netlify/functions

Important GitHub rule:
The files in this zip must be at the repository root. Do not upload the containing folder as a nested folder.

Correct root:
index.html
netlify.toml
package.json
_redirects
netlify/functions/procore-health.js

Wrong root:
ohmboy_v021_8_function_deployment_fix/index.html
ohmboy_v021_8_function_deployment_fix/netlify/functions/procore-health.js

After deploy, test:
https://zesty-cucurucho-18064f.netlify.app/function-test.html
https://zesty-cucurucho-18064f.netlify.app/.netlify/functions/procore-health
https://zesty-cucurucho-18064f.netlify.app/api/health
