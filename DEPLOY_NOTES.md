exports.handler = async function(event, context) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) return { statusCode:400, body:'Missing OAuth code from Procore.' };
  const clientId = process.env.PROCORE_CLIENT_ID;
  const clientSecret = process.env.PROCORE_CLIENT_SECRET;
  const redirectUri = process.env.PROCORE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return { statusCode:500, body:'Missing Procore OAuth environment variables in Netlify.' };
  try {
    const response = await fetch('https://login.procore.com/oauth/token', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ grant_type:'authorization_code', code, client_id:clientId, client_secret:clientSecret, redirect_uri:redirectUri })
    });
    const token = await response.json();
    return { statusCode: response.ok ? 200 : response.status, headers:{ 'Content-Type':'text/html' },
      body:`<h1>Procore OAuth Callback</h1><p>Status: ${response.status}</p><p>Token exchange ${response.ok ? 'succeeded' : 'failed'}.</p><p>V0.12 does not persist tokens. V0.13 should store encrypted refresh tokens in a backend database.</p><pre>${JSON.stringify({ has_access_token:Boolean(token.access_token), has_refresh_token:Boolean(token.refresh_token), expires_in:token.expires_in, token_type:token.token_type, error:token.error, error_description:token.error_description }, null, 2)}</pre>` };
  } catch (err) {
    return { statusCode:500, body:'OAuth token exchange failed: ' + err.message };
  }
};
