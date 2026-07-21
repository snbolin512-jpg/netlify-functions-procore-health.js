# Ωboy V0.21.6b Netlify Initialization-Safe Deploy

Netlify settings:
- Build command: leave blank
- Publish directory: .
- Functions directory: netlify/functions

This package intentionally has no package.json, no npm install, no build command, and no external npm dependencies.

Storage note: function storage is memory-initialization-safe. Front-end packet/takeoff workflow still uses browser localStorage. After this deploys, durable Blobs can be reintroduced separately.
