import { curly, CurlOptionValueType } from 'node-libcurl'

import { resolveFilePath } from '../utils'

import { clientId, secretId } from './config'

const certFilePath = resolveFilePath('src/lambda-built/handler/cert.pem')

type SpotifyApiRequestOptionsOptional = {
  method?: 'get' | 'post'
  data?: any
  headers?: string[]
  isAuthAware?: boolean
  bearerToken?: string
  extraOptions?: CurlOptionValueType
}

type SpotifyApiRequestOptions = (
  | {
      path: string
      url?: never
    }
  | {
      url: string
      path?: never
    }
) &
  SpotifyApiRequestOptionsOptional

export const spotifyApiRequest = async <Result extends any>({
  path,
  url = `https://api.spotify.com/v1${path}`,
  method = 'get',
  data,
  headers = [],
  bearerToken,
  extraOptions,
}: SpotifyApiRequestOptions): Promise<Result | null> => {
  const httpHeader = [
    bearerToken ? `Authorization: Bearer ${bearerToken}` : '',
    ...headers,
  ].filter(Boolean)

  let options = {
    caInfo: certFilePath,
    username: clientId,
    password: secretId,
    httpHeader,
    ...extraOptions,
  }

  if (data) {
    options = {
      postFields: data,
      ...options,
    }
  }

  const { data: responseData, statusCode } = await curly[method](url, options)

  if (statusCode === 204) return

  if (statusCode !== 200)
    throw new Error(`Invalid status code from Spotify: ${statusCode}`)

  return JSON.parse(responseData)
}
