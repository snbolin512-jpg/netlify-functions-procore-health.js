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


## V0.20.1 Cockpit Recovery

This revision keeps the V0.20 full restore base and adds a cockpit/button recovery layer.

Changes:
- Hard click delegation for primary buttons and navigation.
- Jackson/OhmBoy moved to top of cockpit with daily command highlights.
- Financial Source Map moved to the middle of the cockpit.
- Command Modules moved to the bottom of the cockpit.
- Financial source bubbles now expose math/explanation tooltips on hover/focus.
- Palette shifted to white primary with copper, red, and teal secondary accents.


## V0.20.2 Financial Explainability

This revision adds roll-up explanations to financial dollar figures across:

- Financial Source Map
- Financial Command
- Open PO Report
- Aging Report
- Risk Register / exposure cards
- Procurement / buyout roll-ups
- Change Order financial roll-ups
- other card-like financial buckets that show `$` values

Hover/focus any marked financial bubble to see:
- the displayed figure
- source records feeding the roll-up
- equation path
- audit logic

The palette was also shifted to a cleaner ivory/white base to reduce the tan-heavy look.
