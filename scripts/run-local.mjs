#!/usr/bin/env node
// Runs the function once locally and writes the SVG to out.svg.
//   SPOTIFY_CLIENT_ID=... SPOTIFY_SECRET_ID=... SPOTIFY_REFRESH_TOKEN=... node scripts/run-local.mjs
import { writeFileSync } from 'node:fs'

const { default: handler } = await import('../netlify/functions/handler.mts')
const res = await handler(new Request('http://localhost/.netlify/functions/handler'))
const svg = await res.text()
writeFileSync('out.svg', svg)
console.log(`${res.status} ${res.headers.get('content-type')} ${svg.length} bytes -> out.svg`)
