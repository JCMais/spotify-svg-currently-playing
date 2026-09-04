# spotify-svg-currently-playing

This will return a SVG that can be used to display what you are playing currently on Spotify, directly on your profile README.md

All credits for the original idea (and svg code) goes to [@novatorem](https://github.com/novatorem/novatorem), I just converted it to a JS/TS project using Netlify Functions.


## Setup

1. Fork this
2. Run: `yarn`
3. Run: `yarn netlify init`
4. Setup your application on Spotify (read the [original instructions here](https://github.com/novatorem/novatorem/blob/16c6bb64572dcfc61fb759c5fcc8a7972306f219/SetUp.md))
5. Add the environment variables on Netlify - See the .env.sample
6. Deploy
7. ...?
8. Profit

## Getting a new refresh token

Spotify revokes refresh tokens now and then (rotated secret, app removed, inactive
development-mode app). When the function starts answering 502 with
`Invalid status code from Spotify: 400`, mint a new one:

1. In the Spotify developer dashboard, add `http://127.0.0.1:8888/callback` to the app's Redirect URIs and make sure Web API is enabled.
2. Run `SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... node scripts/get-refresh-token.mjs`, approve the consent page, and copy the token it prints.
3. Set `SPOTIFY_REFRESH_TOKEN` on Netlify and trigger a deploy.
