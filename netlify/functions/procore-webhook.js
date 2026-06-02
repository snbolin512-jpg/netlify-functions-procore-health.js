exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok:true, message:'Jarvis Procore webhook receiver is live. POST Procore events here.' }) };
  }
  let payload = {};
  try { payload = event.body ? JSON.parse(event.body) : {}; }
  catch (err) { payload = { rawBody:event.body, parseError:err.message }; }
  console.log('Procore webhook received:', JSON.stringify(payload));
  return { statusCode: 202, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accepted:true, receivedAt:new Date().toISOString(), source:'procore', message:'Raw Procore webhook accepted. Add database persistence in V0.13.', payloadPreview:payload }) };
};
