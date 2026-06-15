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


## V0.18.3 Sidebar Toggle

- Hide Sidebar button inside the left rail.
- Floating Show Sidebar button when collapsed.
- Ctrl+B / Cmd+B keyboard shortcut.
- Sidebar collapsed state persists in localStorage.
- Cockpit module navigation remains the primary navigation surface.


## V0.18.4 Compact Sidebar + Back to Cockpit

- Reduced floating Show Sidebar button size.
- Changed label to `☰ Sidebar`.
- Added global `⌂ Cockpit` button.
- Added Ctrl+H / Cmd+H shortcut to return to cockpit.
- Back to Cockpit works whether sidebar is visible or hidden.


## V0.18.5 Branch Resolution Notes

Closeout logic:
- Resolve Branch now requires a Resolution Note.
- The note captures why the branch is safe to resolve before final packet close.
- The note is stored directly on the branch record.
- The most recent branch resolution note is also tied to the packet.
- Audit Trail now displays a Resolution Note column with linked branch / packet references.

Purpose:
A Senior PM needs the closeout record to show not just that a branch was closed, but what verification, decision, approval, or context led to closing it.


## V0.18.6 No Code Drilldowns

Clean UI correction:
- Raw JSON/code drilldown drawers are hidden.
- `openDrawer()` is disabled.
- Drawer/backdrop/codeBox elements are suppressed with CSS.
- Record clicks no longer open developer payload popups.
- Buttons, inputs, selects, module navigation, simulation buttons, and branch resolution controls remain functional.

Purpose:
The user-facing interface should show structured PM information, not internal code or raw payloads.


## V0.18.7 Audit Trail Cleanup

- Detail is its own clean column.
- Resolution Note is its own clean column.
- Added Branch Status column.
- Branch Status is derived from the linked Triage Packet branch when available.
- Future Branch Resolved audit entries store detail and resolution notes separately.
