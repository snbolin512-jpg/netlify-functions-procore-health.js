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


## V0.18.1 Simulation + CO Projection Additions

Added simulation controls:
- Simulate New Open PO
- Simulate Aging Shift
- Simulate Pending CO Approval

Added CO contract projection:
- Open C/O Value
- New Contract Value if Approved

Color behavior:
- Open PO report remains blue.
- Aging report remains purple.
- Change Order report remains amber.
- Contract/SOV value remains brown.
- Risk remains red.
- EAC remains green.

The high-level overview should visually match the report source that created each total.

## V0.18.2 Cockpit Navigation + Simulation Hard Fix

Navigation:
- Left-side tab list is hidden.
- Executive Cockpit now includes segmented module cards with icons.
- Module cards route to the same underlying views.

Simulation:
- Buttons now use delegated click handling.
- Simulation functions are exposed globally.
- Buttons update report DOM directly after mutating the data model.

Color alignment:
- Open PO bucket cards use the Open PO blue source color.
- Aging bucket cards use the Aging Report purple source color.
- Change Order values use amber.
- Contract projection uses brown.
- EAC uses green.
