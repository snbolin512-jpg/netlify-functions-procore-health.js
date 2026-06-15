# OhmBoy V0.17 Data Model Notes

V0.17 establishes the rigid Senior PM project-control data model.

North star:
OhmBoy converts project noise into linked, prioritized, financially aware action.

Core requirement:
Every item must be integrated, trackable, searchable, linked, auditable, financially aware, schedule aware, procurement aware, and risk aware.

Objects introduced:
- Project
- SOV Line
- Phase Code
- Packet
- Branch
- RFI
- Change Order
- Procurement Item
- Risk
- Financial Snapshot

Next likely build:
V0.18 should add editable forms and persistence-ready CRUD structure for phase codes, SOV lines, risks, procurement items, and financial snapshots.


## V0.18 Financial Report Additions

New financial source objects:
- Open PO
- Billing Aging Item
- Financial Source Map

Financial source-map logic:
- Contract / SOV = brown
- Open PO Report = blue
- Aging Report = purple
- Change Orders = amber
- Risk Register = red
- EAC Forecast = green

Purpose:
High-level totals should not be mystery numbers. Each high-level financial value should visually correspond to the report that feeds it.
