# OhmBoy / Ωboy V0.16.3 — Embedded Jackson Fix

This version fixes the mascot issue by embedding Jackson directly inside `index.html` as a base64 image.

Why this matters:
- The UI no longer depends on `assets/omegaboy-mascot.png` being replaced correctly.
- Browser/Netlify cache cannot keep showing the old mascot path because the image is embedded directly in the HTML.
- The `assets/` folder still includes Jackson as a backup, but the active UI uses the embedded image.

Carried over:
- Manual Compare Backup
- Drawing REV compare
- Schedule compare
- Raw Events
- Normalized Output
- Packet Triage
- Weighted Scoring
- Ωboy Guide Mode
- CO Log
- RFI Log
- Schedule Command
- Manpower Loading
- Graph View
- Audit Log
- Procore Integration / Netlify Functions
