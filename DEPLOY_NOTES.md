# Ωboy V0.25.0 — Deploy Notes

## Netlify settings (unchanged)
- Build command: **leave blank**
- Publish directory: `.`
- Functions directory: `netlify/functions`

There is no `package.json` and no build step. Everything is static plus CommonJS functions.
Nothing changed under `netlify/` in this release; the Procore section at the bottom is carried over as-is.

## Your saved data carries over

v0.25 uses the same saved data as v0.23 and v0.24, and adopts a v0.22 save the first time it loads
if there is no newer one. Nothing to do. Download a backup from **Job Setup** before deploying anyway.

## What is new in v0.25: the Circuit Tracker

**Circuit Tracker** reads the field's circuit completion workbook (.xlsx) — the **Feeders** tab
milestone by milestone and the **Branch Circuits** tab. Once it is loaded:

- **Terminations has its own number.** The page, the vitals bar on every screen and each node card
  show how far along feeder terminations are — the average across feeders, and how many are fully
  landed. Feeders, Branch and Combined percent sit beside it.
- **Find any circuit.** Press `/` and type part of a board, panel, feed ID or load (`MSDB-1.2`,
  `TAHU`, `OPP 03`). Results narrow as you type; Enter opens the board with that circuit marked.
- **Every board and panel has a page.** Its circuits, each step's percent, status, ref, field
  notes, spares, and where it is named on other boards. Previous / next walks them in workbook order.
- **Pick a status to get a list.** "Terminating", "Pulling Wire", or *pulled and not yet
  terminated* — the feeders ready to land.
- **What changed.** Load each new copy of the workbook; the page lists what moved since the last
  one, board by board, with anything that went **down** at the top.
- **Enter progress here if you need to.** On a board page pick a value in any cell, or set one step
  for the whole board. Cells entered here carry a copper edge until the workbook catches up.
  **Download Tracker (.xlsx)** gives the tracker back in the same columns with live formulas.
- **On the project map.** Boards are grouped by the number in their name (1.1, 1.2 … 2.6). File a
  group under a node with one picker; that node's Schedule slot then shows feeders, terminations,
  wire pulled and branch percent, and its area rolls them up.

The module strip gains three tiles — **Circuit Tracker**, **Map Links** and **Risk Register** — and
now shows 27. The vitals bar gains **Circuits** and **Terminations**.

### One thing to know about the workbook's Dashboard tab

The Dashboard works out Branch Circuits % with `AVERAGE` / `AVERAGEIF`, and those skip blank
cells. Until every branch circuit has a value, its **Branch**, **Combined** and per-panel figures
are the average of the circuits someone has touched, not of all 1,433 — so they read high. OhmBoy
counts a blank as zero and, when it can tell from the workbook's saved Dashboard figure that the
two differ, shows both numbers on the page. The **Feeders** figures are the same in both. Once the
Dashboard's formulas count blanks, the note stops appearing. To make the workbook agree, on the
Dashboard tab:

- C7 → `=IFERROR(SUM('Branch Circuits'!H5:H1437)/COUNTA('Branch Circuits'!A5:A1437),0)`
- C8 → `=IFERROR((C6*439+C7*1433)/1872,0)`
- C23 and down (percent by panel) →
  `=IFERROR(SUMIF('Branch Circuits'!A$5:A$1437,A23,'Branch Circuits'!H$5:H$1437)/COUNTIF('Branch Circuits'!A$5:A$1437,A23),0)`

## What came in v0.24: the Cost Report

**Cost Report** reads accounting's *Detail Job Overview by Cost Type* PDF — the job header and
every phase-code row. Once it is loaded:

- **Job figures set themselves.** Contract, executed and pending changes, cost to date and EAC
  (the report's projected cost) replace the DEMO numbers on the cockpit, vitals bar and Financial
  Source Map. The contract is original plus executed changes, as the report has it; pending and
  proposed changes are shown on the Cost Report page and not counted. Open commitments stand in for
  open PO exposure until a PO report is loaded. If you
  have typed figures into Job Setup yourself, a report leaves them alone until you press
  *Use this report's figures in Job Setup*.
- **Every node card gets actuals.** Hours and cost used against projection, the current month,
  open commitments.
- **Manpower Loading can take its estimate from it** — one button sets the estimate to the report's
  projected labor hours.
- **The Project Map builds from it.** The cost report's phase codes are the ones hours are charged
  to, so they are the source for the map when a report is loaded.
- **Week over week.** Load each new report; the previous one is kept and the page lists what moved.
- **It checks the report.** Line sums against every subtotal row and the Totals row, then: lines
  described as one place but coded to another, one description on two codes, a labor line priced
  off its task's usual rate, projections far from their estimates, codes over projected hours or
  cost, cost with no budget.
- **It reconciles against the WBS + Cost workbook** when both are loaded: which lines carry a
  different code in the books, which differ in hours or dollars, which exist on one side only.

The vitals bar gains **Cost to date**, **Overbilled / Underbilled** and **Hours used**. The Cost
Report tile takes the slot the Cockpit tile had on the module strip (the Cockpit button at the top
left of every page does the same job).

## First run for CMH-232

1. **Cost Report** → choose the report PDF → **Load Cost Report**.
   The "By cost type" table should say every row matches the report. Read
   "Worth confirming with accounting".
2. **Build Project Map From Cost Report.** Areas and systems come from the labor phase codes and
   every line files under its node.
3. **WBS + Cost** → load the workbook (optional). It becomes the cross-check: the Cost Report page
   gains "Against the WBS workbook".
4. **Project Map** → rename anything you want. `98`, `MG`, `SEC`, `R1`–`R12` and `P1` are left
   exactly as the report writes them. Add keywords where your RFIs and POs use other words.
5. **Job Setup** → add the key dates you want to carry (start and complete come from the report).
6. **Schedule Intake** → upload the P6 export (include the WBS column). **Schedule of Values**,
   **Open PO Report** as you have them. Then open **Map Links** (button on the Project Map and
   One-Line pages) and place anything that did not file.
7. On each node you own: **Edit this node** → owner, counterpart, in/out of scope, watch items.
8. **Circuit Tracker** → choose the tracker workbook → **Load Circuit Tracker**. Under "Boards
   and panels", use the picker beside each group (1.1, 1.2 …) to file it under its node.
9. **Job Setup → Download Backup.** Do this after any day you would not want to re-enter.

Weekly: load the new cost report. As the field updates it: load the new circuit tracker. Daily: **Morning Walk** (start with "Areas only"),
**Cold Drill**, and log forecasts in the **Prediction Log** as you make them.

If you already built the map from the WBS workbook in v0.23: load the cost report and press
**Build Project Map From Cost Report**. Existing nodes are kept (matched by phase-code prefix,
then by name); only what is missing is added.

## Modules added since v0.22

| Module | What it does |
|---|---|
| Circuit Tracker | Reads the circuit completion workbook: feeders by milestone, branch circuits by percent. Terminations and overall percent, find box, a page per board, changes between workbooks, entry and download. |
| Cost Report | Reads the accounting cost report PDF: job header and every phase-code row. Sets job figures, feeds node actuals, checks the report, tracks movement between reports. |
| WBS + Cost | Reads the phase-code budget workbook: hours and dollars, projection and estimate. Checks its own totals against the sheet's subtotal rows. Cross-check for the cost report. |
| Project Map | Areas and systems. Builds from phase codes, a schedule's WBS, the SOV, or a starter breakdown. Imports/exports `project-map.json`. |
| One-Line | The map drawn as a single-line. Breaker colour is node status. Every node opens its card. Also on the cockpit. |
| Node Card | Six slots in fixed order: Scope, Money, Schedule, People, Risks, Open Items. Areas roll up their systems. |
| Map Links | Every record, the node it filed under, and why. Lists whatever did not file. Has its own tile from v0.25. |
| Schedule of Values | Pay-app (G703-style) upload. Skips subtotal rows, reads section headers as groups. |
| Job Setup | Contract/cost/EAC (from the cost report or typed), key dates, backup and restore. |
| Vitals bar | Contract, EAC, margin, cost to date, billed %, over/under billed, hours used, circuits %, terminations %, earned hours %, PF, CPI, open RFIs, pending COs, next key date, top risks — on every screen. |
| Morning Walk | Recall each node's six slots, reveal, mark hits and misses. Misses become the study list. |
| Cold Drill | Random node and slot, 30-second clock, spaced repetition (1/3/7/14 days). Space = reveal, 1 = hit, 2 = miss. |
| Prediction Log | Forecasts with a % and a date; Brier score and calibration table once scored. |

## Fixes carried from v0.23

- **Spreadsheet reader read currency as dates.** Any `.xlsx` whose first custom number format was a
  currency format had its dollar cells converted to date serials. Fixed; re-upload any `.xlsx`
  report you loaded in v0.22.
- **P6 actual dates** (`05-Oct-26 A`) and `*` constraint markers now parse; slip detection no
  longer skips started activities.
- **Native P6 export header** (two rows) handled; float exported in hours is converted to days.
- **Schedule WBS** is its own field, not a stand-in for a missing Activity ID.
- **RFI overdue** is the day after the due date, local time.
- **Negative dollars** read `−$405,000`. **Clear Local State** asks first. A failed save says so.

## Limits to know about

- **Everything lives in one browser on one computer.** Another browser, another machine, or cleared
  site data starts empty. Backup/restore in Job Setup is the only way to move or protect it.
- Browser storage holds roughly 5 MB. The cost report, the previous one, the WBS workbook and the
  map together use under half a megabyte, and the circuit tracker about a quarter of a megabyte
  more; a 12,000-activity schedule uses about half the total.
- **Circuit tracker layout.** The reader looks for a tab with Board and Ckt columns and one with
  Panel and Ckt columns, and takes step weights from the row above the Feeders headings. Rename
  those columns or move the weights and it will say it cannot find them rather than guess.
- **A blank counts as zero** in every circuit percentage. The workbook's Dashboard skips blanks for
  branch circuits (see above), so the two differ until every circuit has a value.
- **Circuits are matched between workbooks by board and breaker number.** If the field renumbers a
  breaker, that circuit shows as one removed and one added, and anything entered here for it is dropped.
- **"Where a board is named" is not a feed tree.** A circuit can name another board because it
  feeds it, controls it, or is its shunt trip. The page lists the mentions; read the description.
- Progress entered in OhmBoy lives in this browser like everything else. The download is how it
  gets back to the field's workbook — it does not write to their file.
- The downloaded tracker carries the Feeders and Branch Circuits tabs with formulas, not the
  original's Dashboard tab, drop-downs or colours. Paste its milestone columns into the field's
  file to keep those.
- **Cost report layout.** The reader is built for *Detail Job Overview by Cost Type* v3.1, saved as
  a PDF straight from the accounting system, one job per file. A scan or a copy made with
  Print to PDF cannot be read, and the page says so. If a future version of the report moves
  columns, the sum checks against the report's own subtotals are there to catch a misread.
- The report's cost column is **job to date plus open commitments**. Node cards show that figure
  as "Spent + committed" and split out the commitments.
- The report cuts descriptions at 25 characters. Two long descriptions that differ only past the
  cut read the same; the duplicate-description check ignores those.
- Hours used come from the cost report. Earned hours, PF and CPI still come from Manpower Loading.
- A node's schedule % is the plain average of its activities' percent complete — not weighted.
- Keyword filing can put a record on the wrong node. Map Links shows the matched word for every
  record, and a hand placement always wins. Cost lines file by phase code only.
- Walk and drill are self-graded.
- The cockpit's "PM Simulation Controls" still create demo packets in the live record.

## Verify the deploy

- Vitals bar across the top of every page; contract/EAC/margin tagged DEMO until a cost report is
  loaded or Job Setup is saved
- Command Modules strip shows 27 tiles including Cost Report and Circuit Tracker
- Cost Report → load the PDF → "By cost type" rows all read "matches report subtotal", and the
  DEMO tags clear
- Build Project Map From Cost Report → One-Line draws; open a node → six cards, Money shows
  projected hours and "Used to date"
- Circuit Tracker → load the workbook → the toast reads "439 feeders, 1,433 branch circuits";
  **Circuits** and **Terminations** appear in the vitals bar; press `/`, type a feed ID, Enter
- Job Setup → Download Backup produces a `.json` file

## Procore setup (unchanged from v0.22)

Set these in **Netlify → Site settings → Environment variables**, then redeploy:

| Variable | Value |
|---|---|
| `PROCORE_CLIENT_ID` | from your Procore app |
| `PROCORE_CLIENT_SECRET` | from your Procore app |
| `PROCORE_REDIRECT_URI` | `https://<your-site>/.netlify/functions/procore-auth-callback` |
| `PROCORE_OAUTH_BASE` | `https://login.procore.com` (sandbox: `https://login-sandbox.procore.com`) |
| `PROCORE_API_BASE` | `https://api.procore.com` (sandbox: `https://sandbox.procore.com`) |
| `PROCORE_COMPANY_ID` | read it off the auth callback response |
| `PROCORE_WEBHOOK_SECRET` | a long random string you choose |
| `PROCORE_WEBHOOK_NAMESPACE` | `ohmboy-packets` |
| `PROCORE_SERVICE_USER_ID` | optional, for loop filtering |

`PROCORE_REDIRECT_URI` must match a Redirect URI registered on the Procore app
**exactly**, including scheme and trailing path.

### Order of operations

1. `/.netlify/functions/procore-health` — shows what's configured and what isn't.
2. `/.netlify/functions/procore-auth-start` — authorise. Add `?json=1` to see the
   URL instead of redirecting.
3. The callback prints your companies. Set `PROCORE_COMPANY_ID` and redeploy.
4. `/.netlify/functions/procore-webhook-register` — creates the hook and triggers.
   Safe to run repeatedly; it reuses an existing hook in the namespace.
5. `/.netlify/functions/procore-webhook-deliveries?status=failing` — first stop
   when events stop arriving.

### Storage is not durable yet

`netlify/functions/_lib/store.js` is in-memory. Netlify functions cold-start,
so tokens and events do not survive. **Before you rely on webhook data, swap that one file for a
real store** — everything routes through `get`/`put`/`del`, so it's a single-file change.
