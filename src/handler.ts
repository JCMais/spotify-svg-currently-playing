import { Handler } from 'aws-lambda'

import { getCurrentlyPlaying } from './spotify/getCurrentlyPlaying'
import { makeSvg } from './svg/makeSvg'
import { resolveFilePath } from './utils'

const svgTemplateFilePath = resolveFilePath(
  'src/lambda-built/handler/svg.template.html',
)

export const handler: Handler = async (_event, _context) => {
  const nowPlaying = await getCurrentlyPlaying()
  const svg = await makeSvg(svgTemplateFilePath, nowPlaying)

  return {
    statusCode: 200,
    body: svg,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=1',
    },
  }
}
