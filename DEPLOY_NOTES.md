# Deploy Notes — OhmBoy V0.18.7

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
5. Confirm columns are:
   - Audit ID
   - Time
   - Action
   - Detail
   - Linked Item
   - Branch Status
   - Resolution Note
   - User
6. Confirm Detail and Resolution Note are not mixed together.
7. Confirm Branch Status says Resolved for resolved branches.
8. Confirm records do not open code drilldowns.
