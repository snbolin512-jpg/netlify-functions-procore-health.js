const config = require("./config");
const { getTokens, saveTokens } = require("./tokenStore");

const REFRESH_SKEW_MS = 2 * 60 * 1000; // refresh 2 min before actual expiry

async function refreshAccessToken(refreshToken) {
  const tokenUrl = new URL("/oauth/token", config.oauthBase);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    refresh_token: refreshToken,
  });

  const resp = await fetch(tokenUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Procore token refresh failed (${resp.status}): ${text}`);
  }

  const tokens = await resp.json();
  return saveTokens(tokens);
}

/** Returns a valid access token, refreshing first if it's near expiry. */
async function getValidAccessToken() {
  let record = getTokens();
  if (!record) {
    throw new Error(
      "No Procore tokens on file yet. Visit GET /auth/procore/login once to connect the app."
    );
  }
  if (Date.now() > record.expires_at - REFRESH_SKEW_MS) {
    record = await refreshAccessToken(record.refresh_token);
  }
  return record.access_token;
}

/** Thin wrapper around fetch() that adds the Procore auth header. */
async function procoreApiRequest(pathAndQuery, options = {}) {
  const token = await getValidAccessToken();
  const url = new URL(pathAndQuery, config.apiBase);
  const resp = await fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Procore API ${resp.status} on ${pathAndQuery}: ${text}`);
  }
  return resp.json();
}

/**
 * Webhooks only tell you an event happened plus some IDs — they don't carry
 * the full resource. Fetch the actual drawing revision detail so we have
 * something worth putting in front of a crew.
 *
 * NOTE: confirm this exact endpoint/path against the current Procore API
 * reference for your account's enabled tools (Drawings vs. Drawing Areas
 * vs. Drawing Sets differ by API version) — adjust the path if yours is
 * different.
 */
async function fetchDrawingRevision({ projectId, drawingId }) {
  return procoreApiRequest(`/rest/v1.0/projects/${projectId}/drawings/${drawingId}`);
}

/**
 * Same idea for a schedule activity. Confirm this against the Scheduling
 * Tool endpoints for your Procore API version.
 */
async function fetchScheduleActivity({ projectId, activityId }) {
  return procoreApiRequest(`/rest/v1.0/projects/${projectId}/schedule/activities/${activityId}`);
}

module.exports = { getValidAccessToken, procoreApiRequest, fetchDrawingRevision, fetchScheduleActivity };
