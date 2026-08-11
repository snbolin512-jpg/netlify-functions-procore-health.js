# Ωboy V0.21.7 Consolidated 9-Fix Command Center

Static Netlify-safe package. No root package.json. No npm install. No build command.

Fixed / added:
1. Jackson is embedded as a data URI and also included under assets/.
2. Saved takeoff line items support delete and duplicate.
3. Triage packets support treatment suggestions, packet detail, resolution note, close, and reopen.
4. Report Upload Center feeds Open PO, Aging, Cost, and Procurement report rollups.
5. Change Order Log and RFI Log are manual PM-controlled official logs.
6. Schedule Control supports schedule uploads/manual rows and creates schedule impact packets.
7. Manpower Loading includes bell-curve style chart for estimated/earned/actual and labor health.
8. Drawing Intelligence uploads drawing files/notes and extracts likely revision metadata for PM review.
9. Procore Integration Setup includes read-only metadata-first setup, endpoints, env vars, and backend source reference.

Netlify settings:
- Build command: blank
- Publish directory: .
- Functions directory: netlify/functions


## V0.21.9 Recovery Diagnostics

Adds:
- Clear Local OhmBoy State button
- Function Health Diagnostic page
- Safer JSON fetch wrapper that refuses to save HTML/404 responses as packet source trace
- Diagnostics module in command center

Use this after a failed function deploy caused saved packets to contain `Unexpected token '<', "<!DOCTYPE"...`.
