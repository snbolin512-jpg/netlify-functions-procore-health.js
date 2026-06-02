# Deploy Notes

Replace/add at GitHub repo root:

index.html
package.json
README.md
DEPLOY_NOTES.md
netlify.toml
netlify/functions/

Keep Netlify environment variables:
PROCORE_CLIENT_ID
PROCORE_CLIENT_SECRET
PROCORE_REDIRECT_URI
PROCORE_WEBHOOK_URL
PROCORE_MOCK_MODE=true

Test after deploy:
1. Open site root.
2. Click Check Procore Health.
3. Click Procore Drawing REV.
4. Click Procore Schedule Update.
5. Click Simulate PM Day.
6. Open Packet Triage, Daily PM Workflow, Schedule Command, Manpower Loading, Graph View.
