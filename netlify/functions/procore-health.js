exports.handler = async function(event, context) {
  const required = [
    'PROCORE_CLIENT_ID',
    'PROCORE_CLIENT_SECRET',
    'PROCORE_REDIRECT_URI',
    'PROCORE_WEBHOOK_URL'
  ];

  const env = Object.fromEntries(
    required.map(k => [k, Boolean(process.env[k])])
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      service: 'jarvis-procore-integration',
      mode: process.env.PROCORE_MOCK_MODE === 'false' ? 'live-ready' : 'mock-first',
      env,
      notes: [
        'Client secrets must stay in Netlify environment variables.',
        'Webhook receiver is available at /.netlify/functions/procore-webhook.',
        'OAuth start is available at /.netlify/functions/procore-auth-start.'
      ]
    })
  };
};
