import { curly } from 'node-libcurl'
import { resolveFilePath } from '../utils'

const certFilePath = resolveFilePath('src/lambda-built/handler/cert.pem')

export const loadImageBase64 = async (url: string) => {
  // I really need to improve the api on curly to allow to fetch binary data directly
  let rawData = Buffer.from([])
  await curly.get(url, {
    caInfo: certFilePath,
    writeFunction(data, size, nmemb) {
      rawData = Buffer.concat([rawData, data])
      return size * nmemb
    },
  })

  return rawData.toString('base64')
}
