# OhmBoy / Ωboy V0.18.11 — Internal Resolution Audit Fix

V0.18.11 fixes the real carryover failure.

Root cause:
- The UI click handler calls the original internal `resolveBranch()` function.
- The Audit page is rendered by the original internal `renderAudit()` function.
- Prior versions added external overrides, but those were not the functions actually being used by the original app flow.

Corrected:
- Original internal `branch()` now links the branch-created audit row immediately.
- Original internal `resolveBranch()` now saves:
  - branch status
  - resolution note
  - resolved date/time
  - internal resolution ledger
  - related audit row fields
- Original internal `closePacket()` syncs the resolution ledger before Final Close.
- Original internal `renderAudit()` reads from the resolution ledger and displays the note on the related audit row.

Audit columns:
- Audit ID
- Time
- Action
- Detail
- Linked Item
- Branch Status
- Resolution Note
- Resolved Date / Time
- User

Retained:
- No Code Drilldowns
- Branch Resolution Notes
- Compact Sidebar button
- Back to Cockpit button
- Sidebar hide/show
- Cockpit module navigation
- Financial simulation fixes
- Open PO Report
- Aging Report
- CO Log with Open C/O Value
- New Contract Value if Approved
- Matching report/source color buckets
- Data Model Foundation
- Risk Register
- Procurement Command
- Global Search
- Embedded Jackson mascot
- Manual Compare Backup
- Weighted Scoring
- Ωboy Guide Mode
- RFI Log
- Schedule Command
- Manpower Loading
- Graph View
- Procore Functions
