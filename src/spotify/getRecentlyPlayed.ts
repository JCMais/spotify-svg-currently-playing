import { getRefreshToken } from './getRefreshToken'
import { spotifyApiRequest } from './spotifyApiRequest'

import { SpotifyRecentlyPlayed } from './types'

export const getRecentlyPlayed = async () => {
  const bearerToken = await getRefreshToken()

  return spotifyApiRequest<SpotifyRecentlyPlayed>({
    path: '/me/player/recently-played?limit=10',
    bearerToken,
  })
}
