# Ωboy V0.26.0 — Deploy Notes

## Netlify settings (unchanged)
- Build command: **leave blank**
- Publish directory: `.`
- Functions directory: `netlify/functions`

There is no `package.json` and no build step. Everything is static plus CommonJS functions.
Nothing changed under `netlify/` in this release; the Procore section at the bottom is carried over as-is.

## Your saved data carries over

v0.26 uses the same saved data as v0.23, v0.24 and v0.25, and adopts a v0.22 save the first time it
loads if there is no newer one. Nothing to do. Download a backup from **Job Setup** before deploying
anyway.

**One thing to do after deploying: load the schedule again.** Schedule Intake now also reads each
activity's *duration*, *activity type* and *status*. A schedule loaded in v0.25 still works — a
milestone is then told by its start and finish being the same day — but a one-day task would be
read as a milestone until the file is loaded again.

## What is new in v0.26: the 6-Week Lookahead

**6-Week Lookahead** puts the schedule and the labor budget together. The schedule says when each
activity runs; the **WBS + Cost** workbook (or the cost report, when no workbook is loaded) says how
many labor hours it carries. Paired, they give a crew for every working day of the next six weeks,
laid out in three bands:

- **Weeks 1–2 — Committed / Locked In.** One table a week: every activity under way, its hours for
  the week, the crew it needs each day, and the phase code the hours are charged to. Type the
  **lead** and the **crew** you are sending; tick **Material** and **Manpower** as each is verified.
  Both ticked is *locked in*. A crew below what the hours need is marked. The bottom row is the
  crew needed each day.
- **Weeks 3–4 — Make-Ready / Constraint Check.** Every activity that starts in these two weeks,
  with five constraints to clear — **Prefab, Material, Equipment, Other trades, Drawings / RFIs**
  — and a last column that lists what the schedule, the PO report and the RFI log already say about
  that start: a delivery due, the milestone it follows, an open or overdue RFI on its node, a
  drawing waiting for review.
- **Weeks 5–6 — Looking Out.** Major equipment (deliveries in the schedule, PO report dates, the
  first activity on each piece of gear), utility work, inspections and third parties, the nodes
  where work starts, and the other milestones.

Around the bands:

- **Move the window** a week at a time, pick any starting date, or go back to this week. Pick
  **one area** to see only its activities.
- **Add something to watch** — a utility outage, an inspection, a delivery the schedule does not
  show. It appears in whichever weeks its date falls.
- **Past finish and not complete.** Activities whose finish date has gone by without reaching 100%
  are listed at the top and left out of the crew numbers: the schedule gives them no days to run on.
- **Download Lookahead (.xlsx)** — a summary tab, one tab per band, and what was added by hand.
- **Where the hours come from** shows how every activity got its hours, lists the ones worth a
  look, and lets you put an activity on a different line or mark it *No labor hours*.

The module strip gains the **6-Week Lookahead** tile and now shows 28. **Schedule Intake** and
**WBS + Cost** each gain a button that opens it.

### How an activity gets its hours

1. **By name.** "R1 ER Cable Tray Rough-In" on the schedule is the line "R1 ER Tray RI" in the
   budget. Abbreviations, dropped vowels and descriptions cut at 25 characters are read through.
   An activity and a line that agree outright pair one to one.
2. **By the work it names, on its own node.** Where the schedule is finer than the budget, several
   activities can land on one line ("Rough-in — East" and "Rough-in — West" on one Rough-In line).
   The line's hours are then divided among them by working days.
3. **What no name claimed** on a node is shared by working days among the activities there that
   have no line. Where a node has a single labor line, every activity on it divides that line.
4. **Otherwise the activity has no hours**, and its row says *no labor line found*. Put it on a
   line under *Where the hours come from*, or mark it *No labor hours*.

A pick by hand adds the activity to the line; it takes the line away from no one. Lines no activity
is on — supervision, safety, material handling — are reported as a total and are not in the crew.

### How hours become a crew

An activity's remaining hours (projected hours less the schedule's percent complete) are spread
evenly over its working days from today to its finish. Crew is hours for the day divided by hours
per person per day — 8 unless you change it (8, 9, 10 or 12). The working week is read from the
days the schedule's dates fall on (Monday–Friday, Monday–Saturday or all seven) and can be set.

### What it shows for CMH-232 today

All 798 activities of the converted P6 schedule pair by name with a labor line of the WBS + Cost
workbook (391,241 hours); 138,000 hours of indirect labor on Project-Wide Labor sit on no activity.
The schedule works Monday to Saturday. In the six weeks from today only the 38 site activities are
under way — about 60 people a day at 8 hours — and each is marked *start date passed*, because the
schedule has them starting in July and still at 0%. Move the window to see the building work:
from 12-Jul-27, for example, about 6,800 hours a week.

## What came in v0.25: the Circuit Tracker

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

The module strip gained three tiles in v0.25 — **Circuit Tracker**, **Map Links** and **Risk
Register**. The vitals bar gained **Circuits** and **Terminations**.

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
6. **Schedule Intake** → upload the schedule (.xlsx or .csv; include the WBS column, and the
   duration and activity type columns if the export has them). On **Project Map**, press
   **Build Map From Schedule WBS** so every schedule WBS has its node. **Schedule of Values**,
   **Open PO Report** as you have them. Then open **Map Links** and place anything that did not file.
7. On each node you own: **Edit this node** → owner, counterpart, in/out of scope, watch items.
8. **Circuit Tracker** → choose the tracker workbook → **Load Circuit Tracker**. Under "Boards
   and panels", use the picker beside each group (1.1, 1.2 …) to file it under its node.
9. **6-Week Lookahead** → check *Where the hours come from* once, then use the three bands.
10. **Job Setup → Download Backup.** Do this after any day you would not want to re-enter.

Weekly: load the new cost report and the schedule update, then run the lookahead meeting from the
**6-Week Lookahead** and download it. As the field updates it: load the new circuit tracker. Daily: **Morning Walk** (start with "Areas only"),
**Cold Drill**, and log forecasts in the **Prediction Log** as you make them.

If you already built the map from the WBS workbook in v0.23: load the cost report and press
**Build Project Map From Cost Report**. Existing nodes are kept (matched by phase-code prefix,
then by name); only what is missing is added.

## Modules added since v0.22

| Module | What it does |
|---|---|
| 6-Week Lookahead | Pairs schedule activities with their labor lines. Weeks 1–2: crew by day, lead, crew, material and manpower verified. Weeks 3–4: constraints before each start. Weeks 5–6: equipment, utility, inspections, what starts. Download as .xlsx. |
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

- **Lookahead hours left come from the schedule's percent complete**, not from hours charged on the
  cost report. An activity at 0% on the schedule carries all its projected hours, whatever has been
  charged to its phase code.
- **Hours are spread evenly** over an activity's remaining working days. A crew that ramps up or
  down shows as the same number every day.
- **An activity past its finish date and not complete is left out of the crew.** It is listed at
  the top of the page with its hours. Update its dates or percent complete and it comes back.
- **Indirect labor is not in the crew.** Supervision, safety, material handling and any labor line
  no activity is on are reported as one total under *Where the hours come from*.
- **Pairing is by name.** Where the schedule and the budget word the same work differently, the
  pair is listed under *Where the hours come from* as worth a look; where no line names the
  activity's work, it has no hours until you give it a line. Hours divided among several
  activities, or shared, are marked ≈ on the row.
- **Equipment, utility and inspection items in weeks 5–6 are found by the words in the activity
  name** (transformer, switchgear, generator, inspection, energize, utility …). What the schedule
  does not name, add by hand.
- **Lead, crew, ticks and added items are kept by activity ID.** If a schedule update renumbers an
  activity, what was entered for it stays with the old ID and does not show.

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
- Command Modules strip shows 28 tiles including Cost Report, Circuit Tracker and 6-Week Lookahead
- Cost Report → load the PDF → "By cost type" rows all read "matches report subtotal", and the
  DEMO tags clear
- Build Project Map From Cost Report → One-Line draws; open a node → six cards, Money shows
  projected hours and "Used to date"
- Circuit Tracker → load the workbook → the toast reads "439 feeders, 1,433 branch circuits";
  **Circuits** and **Terminations** appear in the vitals bar; press `/`, type a feed ID, Enter
- 6-Week Lookahead (with the cost report or WBS + Cost, the map and the schedule loaded) → six week
  cards with hours and crew, three bands, and *Where the hours come from* counts every activity;
  **Download Lookahead (.xlsx)** produces a workbook with five tabs
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
