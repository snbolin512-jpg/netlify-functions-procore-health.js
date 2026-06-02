exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode:405, body:'POST only' };
  let raw;
  try { raw = JSON.parse(event.body || '{}'); }
  catch (err) { return { statusCode:400, body:JSON.stringify({ error:'Invalid JSON', detail:err.message }) }; }
  const obj = raw.object || raw.data || {};
  const eventType = raw.eventType || raw.event_type || 'unknown';
  let normalized;
  if (eventType.includes('drawing')) {
    normalized = { source:'procore', eventType:'drawing_revision_detected', detectedAt:raw.detectedAt || new Date().toISOString(),
      packet:{ type:'REV', title:`Procore Drawing REV: ${obj.drawingNumber || 'Unknown Drawing'} — ${obj.title || 'Drawing Revision'}`, summary:`${obj.revision || 'REV'} detected from Procore. Review for scope, procurement, schedule, and CO exposure.`, severity:'HIGH', critical:true },
      recommendedBranches:['RFI','CO','RISK','COORDINATION'] };
  } else if (eventType.includes('schedule')) {
    normalized = { source:'procore', eventType:'schedule_update_detected', detectedAt:raw.detectedAt || new Date().toISOString(),
      packet:{ type:'SCH', title:`Procore Schedule Update: ${obj.name || obj.id || 'Schedule File'}`, summary:obj.change || 'Schedule update requires baseline comparison.', severity:'HIGH', critical:true },
      recommendedBranches:['RISK','COORDINATION','MANPOWER'] };
  } else {
    normalized = { source:'procore', eventType:'unknown', detectedAt:new Date().toISOString(), packet:null };
  }
  return { statusCode:200, headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(normalized) };
};
