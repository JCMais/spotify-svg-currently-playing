import { getRecentlyPlayed } from '../spotify/getRecentlyPlayed'
import { SpotifyCurrentlyPlaying, SpotifyTrack } from '../spotify/types'
import { htmlEntities } from '../utils'

import { barGen } from './barGen'
import { loadImageBase64 } from './loadImageBase64'
import { loadTemplate } from './loadTemplate'

export const makeSvg = async (
  svgTemplatePath: string,
  data: SpotifyCurrentlyPlaying,
) => {
  const barCount = 84
  const bars = new Array(barCount)
    .fill(null)
    .map(() => '<div class="bar"></div>')
    .join('')
  const css = barGen(barCount)

  let status = ''
  let item: SpotifyTrack = null

  if (!data || data.item === 'None') {
    // if we wanted to show the bars if there are no songs being played
    // contentBar = ""
    status = 'Was Playing:'

    const recentPlays = await getRecentlyPlayed()

    if (!recentPlays) {
      return ''
    }

    const randomIndex = (Math.random() * (recentPlays.items.length - 1)) | 0
    const randomItem = recentPlays.items[randomIndex]

    item = randomItem && randomItem.track
  } else {
    item = data.item
    status = 'Vibing To:'
  }

  // images sizes: 640px, 300px, 64px
  const image = await loadImageBase64(item.album.images[1].url)
  const artist = htmlEntities(item.artists[0].name)
  const song = htmlEntities(item.name)

  return loadTemplate(svgTemplatePath, {
    bars,
    css,
    artist,
    song,
    image,
    status,
  })
}
