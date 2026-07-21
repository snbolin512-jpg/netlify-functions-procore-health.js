# Ωboy V0.21.5 Packet Treatment + XLSX Export

This build keeps the clean luxe shell and adds the workflow pieces back.

Updated:
- Jackson rendering changed to teal collar + omega dog tag.

Restored / added:
- Packet treatment pipeline actions:
  - Submit RFI
  - Potential Change Order
  - Watchlist
  - Procurement Review
  - Schedule Impact
- Packet Detail page with:
  - treatment controls
  - pipeline status
  - source trace
  - raw/normalized payload
  - recommended PM review
- RFI and Change Order logs link back to the source packet detail.
- Drawing Takeoff export button creates a real `.xlsx` file for Microsoft Excel.


## V0.21.5 Deploy-Safe Fix

This package fixes the Netlify deploy failure caused by the old validation script.

Both commands now pass:

```bash
npm run build
npm run validate
```

Netlify build command is set to:

```bash
npm run build
```


## V0.21.5c Static Netlify Safe

This package removes Netlify deploy risk by making the site a static publish with functions.

Recommended Netlify settings:
- Build command: leave blank, or use `npm run build`
- Publish directory: `.`
- Functions directory: `netlify/functions`


## V0.21.6 Ops Linkage Audit

Fixes:
- Jackson missing because of brittle asset path.
- Info buttons now show equation popovers.
- Manual drawing/schedule upload/intake restored.
- Feature Link Map added to cross-reference what feeds what.

Manual intake linkage:
- Drawing upload → Drawing packet → RFI candidate → Audit Trail → optional Drawing Takeoff
- Schedule upload → Schedule packet → Schedule Impacts → Audit Trail
