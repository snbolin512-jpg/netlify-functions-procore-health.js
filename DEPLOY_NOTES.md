# Deploy Notes — OhmBoy V0.18.8

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
2. Create a branch.
3. Add a Resolution Note and resolve the branch.
4. Open Audit Trail.
5. Confirm there is no separate `Branch resolved` AUDIT ID row.
6. Confirm the related row shows:
   - Branch Status = Resolved
   - Resolution Note populated
   - Resolved Date / Time populated
7. Confirm Detail remains separate from Resolution Note.
8. Confirm records do not open code drilldowns.
