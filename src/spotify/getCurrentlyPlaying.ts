import { getRefreshToken } from './getRefreshToken'
import { spotifyApiRequest } from './spotifyApiRequest'

import { SpotifyCurrentlyPlaying } from './types'

export const getCurrentlyPlaying = async () => {
  const bearerToken = await getRefreshToken()

  const data = await spotifyApiRequest<SpotifyCurrentlyPlaying>({
    path: '/me/player/currently-playing?additional_types=track',
    bearerToken,
  })

  if (data.currently_playing_type !== 'track') return null

  return data
}
