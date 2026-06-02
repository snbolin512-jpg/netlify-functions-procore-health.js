exports.handler = async function(event, context) {
  const clientId = process.env.PROCORE_CLIENT_ID;
  const redirectUri = process.env.PROCORE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return { statusCode:500, headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ error:'Missing PROCORE_CLIENT_ID or PROCORE_REDIRECT_URI in Netlify environment variables.' }) };
  }
  const state = Math.random().toString(36).slice(2);
  const authUrl = new URL('https://login.procore.com/oauth/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  return { statusCode:302, headers:{ Location: authUrl.toString() }, body:'' };
};
