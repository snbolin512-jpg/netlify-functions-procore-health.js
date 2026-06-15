# OhmBoy / Ωboy V0.18.10 — Resolution Ledger Fix

V0.18.10 fixes the Resolution Note carryover after Resolve Branch and Final Close.

Fixed:
- Resolution notes now persist into an internal Branch Resolution Ledger.
- Final Close syncs resolved branches into the ledger before closing.
- Audit Trail reads the note from the ledger first.
- Audit Trail falls back to the linked Triage branch if needed.
- Audit Trail falls back to the audit row only after that.
- Resolving a branch still does not create a separate AUDIT ID.

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
