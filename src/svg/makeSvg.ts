import { getRecentlyPlayed } from '../spotify/getRecentlyPlayed'
import { SpotifyCurrentlyPlaying, SpotifyTrack } from '../spotify/types'
import { htmlEntities } from '../utils'

import { barGen } from './barGen'
import { loadImageBase64 } from './loadImageBase64'
import { loadTemplate } from './loadTemplate'

export const makeSvg = async (
  svgTemplatePath: string,
  status: string,
  track?: SpotifyTrack,
) => {
  if (!track)
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'

  const barCount = 84
  const bars = new Array(barCount)
    .fill(null)
    .map(() => '<div class="bar"></div>')
    .join('')
  const css = barGen(barCount)

  // images sizes: 640px, 300px, 64px
  const image = await loadImageBase64(track.album.images[1].url)
  const artist = htmlEntities(track.artists[0].name)
  const song = htmlEntities(track.name)

  return loadTemplate(svgTemplatePath, {
    bars,
    css,
    artist,
    song,
    image,
    status,
  })
}
