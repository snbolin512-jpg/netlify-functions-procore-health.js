# Deploy Notes — OhmBoy V0.18.5

Upload/replace at GitHub repo root:
- index.html
- package.json
- README.md
- DEPLOY_NOTES.md
- BUILD_VALIDATION_REPORT.md
- DATA_MODEL_SCHEMA.json
- DATA_MODEL_NOTES.md
- netlify.toml
- netlify/
- assets/

Test:
1. Open Packet Triage.
2. Create a branch from a packet.
3. Try Resolve Branch without a note.
4. Confirm the app requires a resolution note.
5. Add a note explaining what led to closeout.
6. Click Resolve Branch.
7. Confirm the branch shows Resolved and displays the note.
8. Open Audit Trail.
9. Confirm the row has:
   - linked Branch ID
   - linked Packet ID
   - Resolution Note column populated
10. Confirm Final Close still requires all branches to be resolved.
