# Ωboy V0.20 Full Restore — Clean Storage

This is the full-feature OhmBoy restoration package.

It restores the last full-feature UI from V0.18.11, including:

- Jackson mascot and assets
- Executive cockpit
- packet triage
- branch/resolution workflow
- internal resolution audit
- CO/RFI logs
- schedule compare
- manpower loading
- graph mode
- guide mode
- financial / CO simulation
- Procore health/mock/webhook controls

It removes the broken API/storage mess:

- no `ohmboy-api-*` functions
- no `*-v2.mjs` functions
- no mixed V1/V2 handlers
- one storage helper: `netlify/functions/_lib/store.js`

## First test

After deployment, open:

```text
/.netlify/functions/procore-health
```

Expected:

```json
{
  "ok": true,
  "version": "v0.20-full-restore-clean-storage",
  "storage": {
    "backend": "netlify-blobs",
    "durable": true
  },
  "roundTrip": {
    "ok": true
  }
}
```

The UI's existing Health button calls `/.netlify/functions/procore-health`, so this preserves the original UI behavior while fixing the storage layer.
