# OhmBoy / Ωboy V0.18.8 — Audit Resolution Columns

V0.18.8 corrects the Audit Trail behavior.

Changed:
- Branch resolution no longer creates a separate AUDIT ID.
- Standalone `Branch resolved` rows are hidden from the Audit Trail.
- Resolution Note is now a column on the related audit row.
- Resolved Date / Time is now a column on the related audit row.
- Branch Status remains a column and is based on the linked Triage Packet branch.

Audit columns now:
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
- Audit Trail cleanup
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
