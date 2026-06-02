exports.handler = async function(event, context) {
  const kind =
    (event.queryStringParameters && event.queryStringParameters.kind) ||
    'drawing';

  const detectedAt = new Date().toISOString();

  const payload =
    kind === 'schedule'
      ? {
          source: 'procore',
          eventType: 'schedule.updated',
          detectedAt,
          companyId: 'demo-company',
          projectId: 'demo-project',
          object: {
            id: 'schedule-demo-001',
            name: 'Mission Critical Schedule Import',
            change:
              'Startup / Commissioning shifted +2 weeks; Corridor C feeder pathway duration increased; revised crew loading required.'
          }
        }
      : {
          source: 'procore',
          eventType: 'drawing_revision.created',
          detectedAt,
          companyId: 'demo-company',
          projectId: 'demo-project',
          object: {
            id: 'drawing-demo-001',
            drawingNumber: 'E6.0',
            title: 'One-Line / Gear Schedule',
            revision: 'REV-007',
            discipline: 'Electrical',
            area: 'Main Electrical Room'
          }
        };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
};
