import { getRefreshToken } from './getRefreshToken'
import { spotifyApiRequest } from './spotifyApiRequest'

import { SpotifyCurrentlyPlaying } from './types'

export const getCurrentlyPlaying = async () => {
  const bearerToken = await getRefreshToken()

  return spotifyApiRequest<SpotifyCurrentlyPlaying>({
    path: '/me/player/currently-playing',
    bearerToken,
  })
}
