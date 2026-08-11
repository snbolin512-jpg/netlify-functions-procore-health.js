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

| | Development Sandbox | Production |
|---|---|---|
| `PROCORE_OAUTH_BASE`| `https://login-sandbox.procore.com` | `https://login.procore.com`|
| `PROCORE_API_BASE`  | `https://sandbox.procore.com`       | `https://api.procore.com`  |

There is a third environment, the **Monthly Sandbox**, on
`https://login-sandbox-monthly.procore.com` — only available to Procore
customers. And an **On-Demand Sandbox**, which confusingly runs on *production*
endpoints and *production* credentials. If you're using either of those rather
than the Development Sandbox that came with your app, the hosts above are
wrong for you.

---

## Step 1 — Create the app in Procore

### 1a. Get a Developer Portal account

1. Go to **developers.procore.com** and click **Sign Up**.
2. Fill in first name, last name, email, set a password, complete the reCAPTCHA,
   click **Create Free Account**.
3. Check your inbox and verify the email.

This account is separate from your normal Procore login. It's free, and you do
not need to be a Procore customer to have one.

### 1b. Create the app

1. Sign in to the Developer Portal.
2. Go to **My Apps** → **Create a New App**.
3. Enter a name — `OhmBoy`. Procore's docs note the first name you choose
   matters, so get it right rather than renaming later.
4. Click **Create**.

**A Development Sandbox is created automatically.** Within a few minutes you'll
get a second email prompting you to set a sandbox password. That sandbox is a
complete Procore instance pre-loaded with fake project data — cost codes, RFIs,
drawings, submittals. Nothing you do in it touches a real job.

Only the app creator is added to the sandbox automatically. If you want anyone
else testing, add them to the sandbox Company Directory.

### 1c. Tell Procore what kind of app it is

In the app's **Configuration Builder**:

1. Expand **Data Connector Components**.
2. Click **Add Components**.
3. Select **User Level Authentication** — this is the OAuth 2.0 Authorization
   Code flow, where OhmBoy acts on behalf of whoever signs in.
4. Click **Save Component**.

> **Pick User Level, not Service Account.** Service Account Authentication uses
> a Developer Managed Service Account and the Client Credentials flow — no user
> login, and you define permissions in a Permissions Builder. OhmBoy is built
> for the User Level flow. Its API access is simply whatever the person who
> authorised can already see in Procore, which is usually what you want for a
> PM tool: it can't reach anything you couldn't reach yourself.

### 1d. Get the credentials and set the Redirect URI

On the **Manage App** page, find the **OAuth Credentials** section. Sandbox and
production are listed separately and **have completely different Client IDs and
Secrets** — tokens from one will not work against the other.

Under **Sandbox OAuth Credentials**:

- Copy the **Client ID** and **Client Secret**.
- In **Redirect URIs**, add this exact line:

  ```
  https://YOUR-SITE.netlify.app/.netlify/functions/procore-auth-callback
  ```

  OhmBoy shows you the exact string with a Copy button on the Procore Link
  page. Use that instead of typing it.

- Click **Update**.

It must match **character for character**. Procore does not support wildcards
or dynamic redirect URIs. A mismatch gives you `invalid redirect_uri` at login
and nothing else.

### 1e. Save a version and install it in your sandbox

This is the step people skip, and skipping it produces the most confusing
failure in the whole process.

1. In the Configuration Builder, click **Save Version** and enter a version
   number such as `0.0.1`.
2. Copy the **Sandbox App Version Key** — a 36-character ID.
3. Log into your **Development Sandbox** Procore (the URL is in the Sandbox
   OAuth Credentials section; the password came in that second email).
4. Go to **Company Tools → Admin → App Management**.
5. Click **Install App** → **Install Custom App**.
6. Paste the 36-character App Version Key → **Install** → **Install** again to
   confirm.

> **If you skip 1e, OAuth still succeeds and Procore returns an empty company
> list with no error.** OhmBoy will say "connected, but no projects came back",
> and it looks like a bug in OhmBoy or a wrong company ID. It isn't — the app
> was authorised but never installed anywhere, so there is nothing for it to
> see. If that's your symptom, come back to this step.

### Later: moving to production

Everything above is the sandbox. When you're ready for the real job:

1. In the Configuration Builder, click **Promote Version**.
2. Procore shows your **production Client ID and Client Secret** in a popup.
   **Copy the secret now.** Unlike the sandbox secret, the production one is
   shown exactly once and cannot be retrieved afterwards — only reset.
3. Add the production Redirect URI under **Production OAuth Credentials**.
4. Install the **Production App Version Key** in your real company the same way
   as step 1e.
5. Update the Netlify variables to the production values and the production
   hosts, then redeploy.

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
| Connected, but no projects listed | Most likely step 1e was skipped. Otherwise `PROCORE_COMPANY_ID` points at the wrong company, or the authorising user has no project access. |
| `invalid redirect_uri` | The URI registered in step 1d and `PROCORE_REDIRECT_URI` differ. No wildcards allowed. |
| Production secret lost | It is shown once at promotion. Reset it in OAuth Credentials and update Netlify. |
| 403 partway through | The Procore user who authorised lacks permission on that tool. With User Level auth, OhmBoy can only see what that person can see. |
| Empty company list, no error | The app version was never installed to the company — see step 1e. |
| Webhooks registered, nothing arrives | Check **Check Failing Deliveries**. `response_status` and `response_error` say why. |

**One current limitation.** Token storage is in-memory, and Netlify functions
cold-start, so the connection drops after a period of inactivity and you'll
re-authorise (step 3 only — the environment variables stay put). Swapping
`netlify/functions/_lib/store.js` for a real database fixes this permanently
and is a single-file change; everything routes through `get`/`put`/`del`.

Nothing else in OhmBoy needs Procore. Uploads, the Schedule of Values, manpower
loading, takeoffs, and the logs all work with no connection at all.
