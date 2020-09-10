import querystring from 'querystring'

import { refreshToken } from './config'
import { spotifyApiRequest } from './spotifyApiRequest'

export const getRefreshToken = async (): Promise<string> => {
  const postData = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }

  const { access_token } = await spotifyApiRequest({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    data: querystring.stringify(postData),
  })

  return access_token
}
