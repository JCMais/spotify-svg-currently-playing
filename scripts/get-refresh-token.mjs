#!/usr/bin/env node
// Mints a new SPOTIFY_REFRESH_TOKEN for this function.
//
//   SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... node scripts/get-refresh-token.mjs
//
// 1. Add http://127.0.0.1:8888/callback to the app's Redirect URIs in the Spotify
//    developer dashboard (https://developer.spotify.com/dashboard), if it is not there.
// 2. Run this. It opens the consent page; after you approve, it prints the refresh token.
// 3. Paste that value into the SPOTIFY_REFRESH_TOKEN environment variable on Netlify
//    and redeploy the function.
import http from 'node:http'
import { exec } from 'node:child_process'

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_SECRET_ID: secret } = process.env
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_SECRET_ID in the environment first.')
  process.exit(1)
}

const redirect = 'http://127.0.0.1:8888/callback'
const scope = 'user-read-currently-playing user-read-recently-played'
const authorize = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: id,
  response_type: 'code',
  redirect_uri: redirect,
  scope,
  show_dialog: 'true',
})}`

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect)
  if (url.pathname !== '/callback') return res.end()
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  if (!code) {
    res.end(`Spotify said: ${error ?? 'no code'}`)
    server.close()
    return
  }
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
  })
  const json = await r.json()
  if (!r.ok) {
    console.error('Token exchange failed:', json)
    res.end('Failed, see the terminal.')
  } else {
    console.log('\nSPOTIFY_REFRESH_TOKEN=' + json.refresh_token + '\n')
    res.end('Done. You can close this tab; the refresh token is in the terminal.')
  }
  server.close()
})

server.listen(8888, '127.0.0.1', () => {
  console.log('Opening Spotify consent page...\n' + authorize)
  exec(`open "${authorize}"`)
})
