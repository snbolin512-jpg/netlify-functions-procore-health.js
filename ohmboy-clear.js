const { json, clearPrefix, EVENT_PREFIX } = require("./_lib/store");
exports.handler = async function () {
  const cleared = await clearPrefix(EVENT_PREFIX);
  return json(200, { ok: true, cleared });
};
