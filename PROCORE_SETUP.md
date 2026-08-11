# Connecting OhmBoy to Procore

## What this actually is

Procore won't hand your project data to any website that asks for it. Before it
will talk to OhmBoy, three things have to be true:

1. **Procore has to know OhmBoy exists.** You register OhmBoy as an "app" in
   Procore's developer portal. Procore gives you back a **Client ID** and a
   **Client Secret** — effectively a username and password that belong to the
   app rather than to you.

2. **Those credentials have to live somewhere safe.** They go into Netlify as
   environment variables, not into the OhmBoy page. Anything in the page can be
   read by anyone who opens the browser console. Netlify keeps them on the
   server where the browser never sees them.

3. **You have to grant permission once.** You log into Procore and approve
   OhmBoy reading the account. Procore hands back an access token, which OhmBoy
   stores and refreshes on its own from then on.

That's the whole idea. The steps below are just the mechanics.

**The errors you're seeing are step 1 not being done yet.** The buttons are
refusing because there are no credentials to use. Nothing is broken.

---

## Before you start

Decide **sandbox or production**.

- **Sandbox** is a free practice Procore with fake data. Nothing you do there
  touches a real job. Start here.
- **Production** is your live company account.

They use different addresses, and mixing them up produces a "401 Unauthorized"
that looks exactly like a wrong password. The sandbox login host is
`login-sandbox.procore.com` — note it is *not* `sandbox.procore.com`, which is
the API host. Getting these two backwards is the single most common failure.

|                     | Sandbox                            | Production                 |
|---------------------|------------------------------------|----------------------------|
| `PROCORE_OAUTH_BASE`| `https://login-sandbox.procore.com` | `https://login.procore.com`|
| `PROCORE_API_BASE`  | `https://sandbox.procore.com`       | `https://api.procore.com`  |

---

## Step 1 — Register OhmBoy in Procore

1. Go to **developers.procore.com** and sign in.
2. Create a new app. Name it OhmBoy.
3. Open the app's **OAuth credentials**. Copy the **Client ID** and
   **Client Secret**. The secret is shown once — save it now.
4. Find **Redirect URIs** and add this exact line, replacing the site name with
   your Netlify address:

   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/procore-auth-callback
   ```

   OhmBoy shows you the exact string to paste, with a Copy button, on the
   Procore Link page. Use that rather than typing it.

   It must match **character for character** — `https://`, no trailing slash,
   correct spelling. A mismatch gives you an "invalid redirect_uri" error at
   login and nothing else.

5. Under **Permissions / Scopes**, make sure the app can read Projects,
   Drawings, and Schedule, and that Webhooks are enabled.

> **Two silent failures worth knowing about.** If you skip installing an app
> *version* to your company, Procore returns an empty company list with no
> error at all — it looks like you have no companies. And if scopes are under-
> configured, everything works until the first real data call, which then
> returns 403. Both look like bugs in OhmBoy. Neither is.

---

## Step 2 — Put the credentials in Netlify

In Netlify: **Site settings → Environment variables → Add a variable.**

| Variable | What to put |
|---|---|
| `PROCORE_CLIENT_ID` | from step 1 |
| `PROCORE_CLIENT_SECRET` | from step 1 |
| `PROCORE_REDIRECT_URI` | the same URL you registered in step 1 |
| `PROCORE_OAUTH_BASE` | see the sandbox/production table above |
| `PROCORE_API_BASE` | see the sandbox/production table above |
| `PROCORE_WEBHOOK_SECRET` | any long random string you invent — see below |
| `PROCORE_WEBHOOK_NAMESPACE` | `ohmboy-packets` |

`PROCORE_WEBHOOK_SECRET` is not issued by anyone. You make it up. Procore sends
it back on every webhook so OhmBoy can tell a genuine delivery from something
forged. Treat it like a password — 30+ random characters, and don't reuse it.

**Then redeploy.** Netlify only picks up environment variables on a fresh
deploy. Changing a variable on a running site does nothing until you deploy
again. In Netlify: **Deploys → Trigger deploy → Deploy site.**

Now open OhmBoy → **Procore Link** → **Re-check**. Step 1 should turn green.

---

## Step 3 — Authorise

Click **Open Procore Authorisation**. A new tab opens, you log into Procore and
approve OhmBoy. The tab comes back with a page listing your companies.

**Leave that tab open** — you need a number off it.

If you get "invalid redirect_uri", the URL in step 1 and the one in
`PROCORE_REDIRECT_URI` don't match. Compare them character by character.

---

## Step 4 — Tell OhmBoy which company

On that callback page, find the company this job belongs to and copy its `id`.

Back in Netlify, add:

| Variable | Value |
|---|---|
| `PROCORE_COMPANY_ID` | the id you just copied |

**Redeploy again.**

Yes, a second redeploy. Procore doesn't tell you the company id until *after*
you've authorised, so it can't go in on the first pass. This is a Procore
ordering constraint, not something OhmBoy can work around.

---

## Step 5 — Link the project and turn on webhooks

Back in OhmBoy → **Procore Link**:

1. **Re-check** — steps 1 through 3 should all be green.
2. **Load Projects from Procore** — the dropdown fills with your projects.
3. Pick your project → **Link Selected Project**.
4. **Register Webhooks** — this tells Procore to push drawing revisions and
   schedule changes to OhmBoy as they happen. Safe to run more than once.

Done. Revisions and schedule movement now arrive as packets on their own.

---

## When something doesn't work

**Press Re-check first.** The checklist tells you which step is actually
outstanding, and the Output box shows the raw response.

| Symptom | Cause |
|---|---|
| "Can't reach the OhmBoy backend functions" | Site opened as a local file, or the deploy hasn't finished. Use the Netlify URL. |
| Buttons look faded | Their prerequisite isn't met. Hover for which step. |
| "invalid redirect_uri" at Procore login | The registered URI and `PROCORE_REDIRECT_URI` differ. |
| 401 that looks like a bad password | Sandbox/production hosts crossed. Check the table above. |
| Connected, but no projects listed | `PROCORE_COMPANY_ID` points at the wrong company, or the Procore user who authorised has no project access. |
| 403 partway through | Scopes under-configured on the Procore app. |
| Empty company list, no error | The app version was never installed to the company. |
| Webhooks registered, nothing arrives | Check **Check Failing Deliveries**. `response_status` and `response_error` say why. |

**One current limitation.** Token storage is in-memory, and Netlify functions
cold-start, so the connection drops after a period of inactivity and you'll
re-authorise (step 3 only — the environment variables stay put). Swapping
`netlify/functions/_lib/store.js` for a real database fixes this permanently
and is a single-file change; everything routes through `get`/`put`/`del`.

Nothing else in OhmBoy needs Procore. Uploads, the Schedule of Values, manpower
loading, takeoffs, and the logs all work with no connection at all.
