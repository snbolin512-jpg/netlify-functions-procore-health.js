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


## V0.20.3 High-Level Roll-Up Explainability

This revision backs off the overly-busy V0.20.2 approach.

Tooltips are now limited to high-level roll-up cards/bubbles only:
- Financial Source Map source cards
- Financial Command KPI cards
- Open PO Report top KPI cards
- Aging Report top KPI cards
- Risk Register summary cards
- Procurement summary cards
- Change Order summary cards

It no longer annotates every little table value or line-item dollar figure.

The UI background was also shifted cleaner ivory/white to reduce the tan-heavy feel.


## V0.20.4 Ivory Gold PM Daily Update

Palette update:
- Ivory/white UI background.
- Gold outlines for bubbles, roll-ups, KPI cards, source map cards, and high-level reports.
- Avenir Next LT Pro-first font stack.
- Black text.
- Bold high-level values/headings.

Cockpit update:
- OhmBoy PM Daily Update is forced to the top of the cockpit.
- Jackson remains the PM guide/highlight context.

Font note:
- The CSS uses `Avenir Next LT Pro` first. If that licensed font is not installed on the viewing device, the browser falls back to Avenir Next, Avenir, Helvetica, then Arial.


## V0.21 Luxe Dashboard Redesign

This revision makes the generated mockup the new UI target.

Visual system:
- Minimalist luxury SaaS dashboard.
- Ivory/white background.
- Gold outlines around high-level rollups and command cards.
- Black Avenir-style typography.
- Light font weight with bold high-level headings/values.
- Soft dimensionality, subtle shadows, lots of whitespace.

Cockpit structure:
- OhmBoy PM Daily Update hero at the top with Jackson.
- Four daily summary cards.
- Financial Source Map in the middle.
- Command Modules at the bottom.

Functionality:
- The underlying V0.20.4 backend/storage/functions remain intact.
- The old sidebar is visually removed in favor of bottom command modules.
- Legacy DOM metric targets remain hidden so existing render logic does not break.
