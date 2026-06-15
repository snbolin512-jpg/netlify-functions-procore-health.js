# Deploy Notes — OhmBoy V0.18.1

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
2. Confirm Financial Source Map appears.
3. Click Sim Open PO Impact.
4. Confirm Open PO Report, Financial Source Map, and EAC-related numbers update.
5. Click Sim Aging Shift.
6. Confirm Aging Report updates NET 120+ exposure.
7. Click Sim CO Approval.
8. Open CO Log and confirm:
   - Open C/O Value column
   - New Contract Value if Approved column
9. Confirm Global Search finds PO, invoice, aging, CO, SOV, phase code terms.
