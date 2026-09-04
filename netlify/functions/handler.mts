// Netlify Function (v2): returns an SVG with what is currently playing on Spotify,
// or a random recently played track when nothing is playing.
// Served at /.netlify/functions/handler. HTTP goes through node-libcurl.
import { existsSync } from 'node:fs'
import { curly, type CurlyOptions } from 'node-libcurl'

import { template } from '../lib/template.ts'

const { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET_ID, SPOTIFY_REFRESH_TOKEN, CURL_CA_BUNDLE } = process.env

// The prebuilt libcurl needs a CA bundle it can find; on Amazon Linux (Netlify's Lambda
// image) that is not always where it was built to look. Honor CURL_CA_BUNDLE, else probe.
const caInfo =
  CURL_CA_BUNDLE ??
  ['/etc/pki/tls/certs/ca-bundle.crt', '/etc/ssl/certs/ca-certificates.crt', '/etc/ssl/cert.pem'].find((p) =>
    existsSync(p),
  )

interface Track {
  name: string
  artists: { name: string }[]
  album: { images: { url: string; width?: number }[] }
}
interface CurrentlyPlaying {
  item: Track | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
}
interface RecentlyPlayed {
  items: { track: Track }[]
}

const base: CurlyOptions = {
  // raw Buffer back; we parse JSON ourselves and need bytes for the cover art
  curlyResponseBodyParser: false,
  followLocation: true,
  timeout: 15,
  ...(caInfo ? { caInfo } : {}),
}

async function accessToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_SECRET_ID || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing SPOTIFY_CLIENT_ID, SPOTIFY_SECRET_ID or SPOTIFY_REFRESH_TOKEN')
  }
  const { statusCode, data } = await curly.post('https://accounts.spotify.com/api/token', {
    ...base,
    username: SPOTIFY_CLIENT_ID,
    password: SPOTIFY_SECRET_ID,
    postFields: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }).toString(),
    httpHeader: ['Content-Type: application/x-www-form-urlencoded'],
  })
  if (statusCode !== 200) throw new Error(`Spotify token refresh failed: ${statusCode} ${data.toString()}`)
  return (JSON.parse(data.toString()) as { access_token: string }).access_token
}

async function api<T>(path: string, token: string): Promise<T | null> {
  const { statusCode, data } = await curly.get(`https://api.spotify.com/v1${path}`, {
    ...base,
    httpHeader: [`Authorization: Bearer ${token}`],
  })
  if (statusCode === 204) return null
  if (statusCode !== 200) throw new Error(`Invalid status code from Spotify: ${statusCode}`)
  return JSON.parse(data.toString()) as T
}

async function imageBase64(url: string): Promise<string> {
  const { statusCode, data } = await curly.get(url, base)
  return statusCode === 200 ? Buffer.from(data).toString('base64') : ''
}

const escape = (v: string) =>
  v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function bars(count: number) {
  const html = '<div class="bar"></div>'.repeat(count)
  const css = Array.from({ length: count }, (_, i) => {
    const duration = (1000 + Math.random() * 350) | 0
    return `.bar:nth-child(${i + 1}) { left: ${i * 4}px; animation-duration: ${duration}ms; }`
  }).join('')
  return { html, css }
}

async function makeSvg(track: Track | null): Promise<string> {
  if (!track) return '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'
  const { html, css } = bars(84)
  // album images come as 640, 300, 64; take the middle one
  const cover = track.album.images[1] ?? track.album.images[0]
  const image = cover ? await imageBase64(cover.url) : ''
  const values: Record<string, string> = {
    bars: html,
    css,
    artist: escape(track.artists[0]?.name ?? ''),
    song: escape(track.name),
    image,
  }
  let svg = template
  for (const [key, value] of Object.entries(values)) svg = svg.replace(`::${key}::`, value)
  return svg
}

async function pickTrack(): Promise<Track | null> {
  const token = await accessToken()
  const now = await api<CurrentlyPlaying>('/me/player/currently-playing?additional_types=track', token)
  if (now?.item && now.currently_playing_type === 'track') return now.item

  const recent = await api<RecentlyPlayed>('/me/player/recently-played?limit=10', token)
  const items = recent?.items ?? []
  if (!items.length) return null
  return items[(Math.random() * items.length) | 0]?.track ?? null
}

export default async function handler(_req: Request): Promise<Response> {
  try {
    const svg = await makeSvg(await pickTrack())
    return new Response(svg, {
      headers: {
        'content-type': 'image/svg+xml',
        'cache-control': 'no-cache, s-maxage=1',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>', {
      status: 200,
      headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-cache' },
    })
  }
}
