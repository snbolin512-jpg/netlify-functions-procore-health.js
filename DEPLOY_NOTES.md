# Deploy Notes — Ωboy V0.13.2

Upload/replace these at GitHub repo root:

- index.html
- package.json
- README.md
- DEPLOY_NOTES.md
- BUILD_VALIDATION_REPORT.md
- netlify.toml
- netlify/
- assets/

Important:
- The mascot image is located at `assets/omegaboy-mascot.png`.
- Do not place `assets/` inside `netlify/`.
- Keep Procore credentials only in Netlify environment variables.

Test:
1. Confirm sidebar says Ωboy.
2. Confirm dog mascot appears.
3. Check Procore Health.
4. Procore Drawing REV.
5. Packet Triage → CO Candidate → Change Order Log.
6. Packet Triage → RFI → RFI Log.
