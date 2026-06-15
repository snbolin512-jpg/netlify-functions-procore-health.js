# OhmBoy / Ωboy V0.18.9 — Resolution Note Carryover Fix

V0.18.9 fixes the missing Resolution Note carryover.

Fixed:
- Resolution notes entered on the Triage Packet page now carry over to the Audit Trail.
- Audit Trail pulls the Resolution Note directly from the linked Triage branch when needed.
- Resolved Date / Time also pulls from the linked branch.
- Existing audit rows are enriched with branch linkage when possible.
- Resolving a branch still does not create a new standalone AUDIT ID.

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
