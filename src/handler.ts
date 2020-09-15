import { Handler } from 'aws-lambda'

import { getCurrentlyPlaying } from './spotify/getCurrentlyPlaying'
import { getRecentlyPlayed } from './spotify/getRecentlyPlayed'
import { SpotifyTrack } from './spotify/types'

import { makeSvg } from './svg/makeSvg'

import { resolveFilePath } from './utils'

const svgTemplateFilePath = resolveFilePath(
  'src/lambda-built/handler/svg.template.html',
)

export const handler: Handler = async (_event, _context) => {
  const nowPlaying = await getCurrentlyPlaying()

  let status = 'Vibing To'
  let item: SpotifyTrack = null

  if (!nowPlaying || nowPlaying.item === 'None') {
    const recentPlays = await getRecentlyPlayed()

    if (recentPlays) {
      status = 'Was Playing:'

      const randomIndex = (Math.random() * (recentPlays.items.length - 1)) | 0
      const randomItem = recentPlays.items[randomIndex]

      item = randomItem && randomItem.track
    }
  }

  const svg = await makeSvg(svgTemplateFilePath, status, item)

  return {
    statusCode: 200,
    body: svg,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=1',
    },
  }
}
