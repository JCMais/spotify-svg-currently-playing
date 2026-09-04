# spotify-svg-currently-playing

This will return a SVG that can be used to display what you are playing currently on Spotify, directly on your profile README.md

All credits for the original idea (and svg code) goes to [@novatorem](https://github.com/novatorem/novatorem), I just converted it to a JS/TS project using Netlify Functions.


It is a single Netlify Function (`netlify/functions/handler.mts`) with no build step, doing HTTP through [node-libcurl](https://github.com/JCMais/node-libcurl). Runs on Node 24 on Netlify (the newest AWS Lambda runtime) and on Node 26 locally.

## Setup

1. Fork this and create a Netlify site from it (the `netlify.toml` already points at the function).
2. Create an app in the [Spotify developer dashboard](https://developer.spotify.com/dashboard) with Web API enabled and `http://127.0.0.1:8888/callback` as a redirect URI.
3. Run `SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... node scripts/get-refresh-token.mjs` and approve the consent page; it prints `SPOTIFY_REFRESH_TOKEN`.
4. Add the three environment variables on Netlify (see `.env.sample`) and deploy.
5. Embed `https://<your-site>.netlify.app/.netlify/functions/handler` as an image.

To try it locally: `SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... SPOTIFY_REFRESH_TOKEN=... node scripts/run-local.mjs` writes `out.svg`.

## Getting a new refresh token

Spotify revokes refresh tokens now and then (rotated secret, app removed, inactive
development-mode app). When the function starts answering 502 with
`Invalid status code from Spotify: 400`, mint a new one:

1. In the Spotify developer dashboard, add `http://127.0.0.1:8888/callback` to the app's Redirect URIs and make sure Web API is enabled.
2. Run `SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... node scripts/get-refresh-token.mjs`, approve the consent page, and copy the token it prints.
3. Set `SPOTIFY_REFRESH_TOKEN` on Netlify and trigger a deploy.
