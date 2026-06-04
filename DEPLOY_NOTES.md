# Deploy Notes — V0.16.3 Embedded Jackson Fix

Upload/replace these at GitHub repo root:
- index.html
- package.json
- README.md
- DEPLOY_NOTES.md
- BUILD_VALIDATION_REPORT.md
- netlify.toml
- netlify/
- assets/

Critical:
- This build embeds Jackson directly in index.html.
- After deploy, the sidebar should show a small note: "Jackson embedded — No old mascot asset path."
- If you still see the old mascot, Netlify is not serving this commit yet or your browser is showing an old cached deploy.
- Use Netlify Deploys → latest published deploy → Open production deploy, or use an incognito window.
