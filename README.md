# OhmBoy / Ωboy V0.19 — API Intake Backend Readiness

V0.19 is the serious backend readiness build for testing real-world API/webhook intake.

Added:
- Backend event intake endpoint
- Event-store abstraction with Netlify Blobs support
- Raw event storage
- Normalized event storage
- Drawing revision normalization
- Schedule revision normalization
- API Intake Monitor page
- Drawing and schedule simulation buttons
- Event listing API
- Packet candidate promotion endpoint
- Backend health endpoint

New backend endpoints:
- `POST /.netlify/functions/ohmboy-api-intake`
- `GET /.netlify/functions/ohmboy-api-events`
- `DELETE /.netlify/functions/ohmboy-api-events`
- `POST /.netlify/functions/ohmboy-api-promote-packet`
- `GET /.netlify/functions/ohmboy-api-health`

Safety:
- Read-only intake only.
- No Procore writeback.
- No automatic RFI creation.
- No automatic CO creation.
- No automatic project mutation until reviewed/promoted.

Environment variable:
- `OHMBOY_WEBHOOK_SECRET` optional for simulation. When configured, intake requires an HMAC SHA-256 signature.

Retained:
- V0.18.11 internal resolution audit fix
- No Code Drilldowns
- Branch Resolution Notes
- Audit Trail resolution columns
- Existing cockpit/reporting/financial/Procore skeleton features
