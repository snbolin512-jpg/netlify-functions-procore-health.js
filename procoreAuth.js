const express = require("express");
const config = require("./config");
const { saveTokens } = require("./tokenStore");

const router = express.Router();

/**
 * Step 1: send the user (you, once, as the connecting admin) to Procore to
 * approve the app. Visit GET /auth/procore/login in a browser.
 */
router.get("/login", (req, res) => {
  const url = new URL("/oauth/authorize", config.oauthBase);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  res.redirect(url.toString());
});

/**
 * Step 2: Procore redirects back here with ?code=... . Exchange it for an
 * access_token/refresh_token pair and store them.
 */
router.get("/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Procore returned an error: ${error}`);
  if (!code) return res.status(400).send("Missing ?code param on callback.");

  try {
    const tokenUrl = new URL("/oauth/token", config.oauthBase);
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    });

    const resp = await fetch(tokenUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[procoreAuth] Token exchange failed:", resp.status, text);
      return res.status(502).send("Token exchange with Procore failed. Check server logs.");
    }

    const tokens = await resp.json();
    saveTokens(tokens);
    res.send(
      "Procore connected. Access and refresh tokens are stored. " +
        "You can close this tab and go set up your webhook Hook + Triggers next."
    );
  } catch (err) {
    console.error("[procoreAuth] Callback error:", err);
    res.status(500).send("Unexpected error during token exchange.");
  }
});

module.exports = router;
