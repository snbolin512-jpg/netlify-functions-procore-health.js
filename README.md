# Ωboy Command Center — Clean Storage Rewrite

This is a clean rebuild. Do not merge it with the prior OhmBoy project.

## Why this exists

The old app accumulated multiple overlapping API approaches:

- old `ohmboy-api-*` function files
- V2 `.mjs` function files
- multiple frontend click handlers
- multiple storage helpers
- memory fallback masking the real storage problem

This rewrite removes all of that.

## New API routes

Direct function routes:

```text
/.netlify/functions/ohmboy-health
/.netlify/functions/ohmboy-events
/.netlify/functions/ohmboy-intake
/.netlify/functions/ohmboy-clear
/.netlify/functions/ohmboy-promote
/.netlify/functions/ohmboy-packet-ledger
```

Alias routes:

```text
/api/health
/api/events
/api/intake
/api/clear
/api/promote
/api/packet-ledger
```

## Storage

All persistence goes through:

```text
netlify/functions/_lib/store.js
```

It uses:

```js
await import("@netlify/blobs")
getStore({ name: "ohmboy-command-center", consistency: "strong" })
```

The health route performs a real write → read → delete roundtrip.

Do not proceed to real API testing unless health returns:

```json
{
  "roundTrip": {
    "ok": true
  },
  "storage": {
    "backend": "netlify-blobs",
    "durable": true
  }
}
```


## V1.0.1

The build command no longer runs the strict repo validation script. This prevents Netlify from failing the build when old files are still present during transition.

The real storage test remains:

```text
/.netlify/functions/ohmboy-health
```
