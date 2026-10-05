# Ωboy V0.23.0 — Deploy Notes

## Netlify settings (unchanged)
- Build command: **leave blank**
- Publish directory: `.`
- Functions directory: `netlify/functions`

There is no `package.json` and no build step. Everything is static plus CommonJS functions.
Nothing changed under `netlify/` in this release; the Procore section at the bottom is carried over as-is.

## Your saved data carries over

Earlier builds changed the storage key every release, so each deploy started empty.
v0.23 adopts whatever v0.22 saved in the same browser the first time it loads. Nothing to do.

The cockpit's contract, cost-to-date and EAC figures were always placeholders with no way to
edit them. They are now labelled **DEMO** everywhere until you save real figures in **Job Setup**.

## First run for CMH-232

1. **WBS + Cost** → upload the WBS + Cost workbook → **Load WBS**.
   Check the "By cost type" table (every row should say it matches the sheet) and read
   "Worth confirming in the workbook".
2. **Build Project Map From WBS**. This creates the areas and systems from the labor phase codes
   and files every budget line under its node.
3. **Project Map** → rename anything you want. `98`, `MG`, `SEC`, `R1`–`R12` and `P1` are left
   exactly as the workbook writes them. Add keywords where your RFIs and POs use other words.
4. **Job Setup** → enter the real contract, cost to date, EAC, and a few key dates → save.
5. **Schedule Intake** → upload the P6 export (include the WBS column). **Schedule of Values**,
   **Open PO Report** as you have them. Then open **Map Links** (button on the Project Map and
   One-Line pages) and place anything that did not file.
6. On each node you own: **Edit this node** → owner, counterpart, in/out of scope, watch items.
7. **Job Setup → Download Backup.** Do this after any day you would not want to re-enter.

Then the daily loop: **Morning Walk** (start with "Areas only"), **Cold Drill**, and log forecasts
in the **Prediction Log** as you make them.

## What is new

| Module | What it does |
|---|---|
| WBS + Cost | Reads the phase-code budget: hours and dollars, projection and estimate. Checks its own totals against the sheet's subtotal rows. |
| Project Map | Areas and systems. Builds from the WBS phase codes, a schedule's WBS, the SOV, or a starter breakdown. Imports/exports `project-map.json`. |
| One-Line | The map drawn as a single-line. Breaker colour is node status. Every node opens its card. Also on the cockpit. |
| Node Card | Six slots in fixed order: Scope, Money, Schedule, People, Risks, Open Items. Areas roll up their systems. |
| Map Links | Every record, the node it filed under, and why. Lists whatever did not file. |
| Schedule of Values | Pay-app (G703-style) upload. Skips subtotal rows, reads section headers as groups. |
| Job Setup | Real contract/cost/EAC, key dates, backup and restore. |
| Vitals bar | Contract, EAC, margin, billed %, earned hours %, PF, CPI, open RFIs, pending COs, next key date, top risks — on every screen. |
| Morning Walk | Recall each node's six slots, reveal, mark hits and misses. Misses become the study list. |
| Cold Drill | Random node and slot, 30-second clock, spaced repetition (1/3/7/14 days). Space = reveal, 1 = hit, 2 = miss. |
| Prediction Log | Forecasts with a % and a date; Brier score and calibration table once scored. |

"Map Links" has no tile on the cockpit strip (the strip stays at 24); reach it from Project Map or One-Line.

## Fixes to existing behaviour

- **Spreadsheet reader read currency as dates.** Any `.xlsx` whose first custom number format was a
  currency format had its dollar cells converted to date serials: a $4,380,000 PO line came in as
  $13,892. This affected the Open PO and Aging report uploads in v0.22. Fixed; re-upload any
  `.xlsx` report you loaded before.
- **P6 actual dates.** Dates exported as `05-Oct-26 A` (actual) were not parsed, so slip detection
  silently skipped every started activity. Fixed, including `*` constraint markers.
- **Native P6 export header.** The two header rows (field codes, then captions) are both handled;
  float exported in hours is converted to days.
- **Schedule WBS** is now its own field. It used to stand in for a missing Activity ID, which keyed
  slip comparison to the wrong rows.
- **RFI overdue** flagged from 8 pm the evening before the due date (UTC date math). An RFI is now
  overdue the day after its due date, in local time. "Today" in date fields is the local day.
- **Negative dollars** read `−$405,000` instead of `$-405,000`.
- **Clear Local State** now asks first.
- A save that fails (storage full/blocked) says so. An unreadable save is set aside under
  `ohmboy_unreadable_save` instead of being overwritten.

## Limits to know about

- **Everything lives in one browser on one computer.** Another browser, another machine, or cleared
  site data starts empty. Backup/restore in Job Setup is the only way to move or protect it.
- Browser storage holds roughly 5 MB. A 12,000-activity schedule uses about half of that.
- A node's schedule % is the plain average of its activities' percent complete — not weighted by
  duration or hours.
- Budget only: the WBS upload carries projected and estimated hours/dollars. Actual and earned
  hours by phase code are not read yet, so there is no per-node PF.
- Keyword filing can put a record on the wrong node. Map Links shows the matched word for every
  record, and a hand placement always wins.
- Walk and drill are self-graded.
- The cockpit's "PM Simulation Controls" still create demo packets in the live record.

## Verify the deploy

- Vitals bar across the top of every page; contract/EAC/margin tagged DEMO until Job Setup is saved
- Command Modules strip shows 24 tiles including One-Line, Morning Walk, Cold Drill, Prediction Log,
  Project Map, WBS + Cost, Schedule of Values, Job Setup
- WBS + Cost → load the workbook → "By cost type" rows all read "matches sheet subtotal"
- Build Project Map From WBS → One-Line draws; open a node → six cards, Money shows labor hours
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
