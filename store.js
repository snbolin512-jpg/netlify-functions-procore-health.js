const KEY = "__OHMBOY_EVENTS__";
function mem(){ globalThis[KEY] = globalThis[KEY] || {}; return globalThis[KEY]; }
async function setJSON(key, val){ mem()[key]=val; return {backend:"memory",durable:false}; }
async function getJSON(key){ return mem()[key] || null; }
async function listJSON(prefix="", limit=100){ return Object.keys(mem()).filter(k=>k.startsWith(prefix)).map(k=>mem()[k]).slice(0, limit); }
async function clearPrefix(prefix=""){ const keys=Object.keys(mem()).filter(k=>k.startsWith(prefix)); keys.forEach(k=>delete mem()[k]); return keys.length; }
module.exports = { setJSON, getJSON, listJSON, clearPrefix };
