/* Confirms the OAuth connection and surfaces company_id / projects. */
const { json } = require("./_lib/store");
const { api, cfg, missingEnv } = require("./_lib/procore");

exports.handler = async function () {
  const missing = missingEnv();
  if (missing.length) return json(400, { ok: false, error: "Not configured", missingEnv: missing });
  try {
    const me = await api("/rest/v1.0/me");
    const companies = await api("/rest/v1.0/companies");
    let projects = [];
    const companyId = cfg().companyId || (Array.isArray(companies) && companies[0] && companies[0].id);
    if (companyId) {
      try {
        projects = await api(`/rest/v1.0/projects?company_id=${companyId}`);
      } catch (e) { projects = { error: e.message }; }
    }
    return json(200, {
      ok: true,
      connected: true,
      me,
      companies: Array.isArray(companies) ? companies.map(c => ({ id: c.id, name: c.name })) : companies,
      companyIdInUse: companyId || null,
      projects: Array.isArray(projects) ? projects.map(p => ({ id: p.id, name: p.name })) : projects
    });
  } catch (err) {
    return json(502, { ok: false, connected: false, error: err.message, detail: err.detail || null });
  }
};
