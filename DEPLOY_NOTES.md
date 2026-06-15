# Deploy Notes — OhmBoy V0.18.2

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
1. Open Executive Cockpit.
2. Confirm the old side tab navigation list is hidden.
3. Confirm Command Modules appear with icons.
4. Click Open PO Report module.
5. Click Aging Report module.
6. Return to Executive Cockpit.
7. Click Simulate New Open PO.
8. Confirm Open PO totals change.
9. Click Simulate Aging Shift.
10. Confirm Aging Report buckets change.
11. Click Simulate Pending CO Approval.
12. Open Change Order Log and confirm:
    - Open C/O Value column
    - New Contract Value if Approved column
13. Confirm bucket colors match the source report colors.
