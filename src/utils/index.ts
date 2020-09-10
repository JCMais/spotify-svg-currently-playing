import fs from 'fs'
import path from 'path'
import util from 'util'

const { LAMBDA_TASK_ROOT } = process.env

export const resolveFilePath = (filePath: string) =>
  LAMBDA_TASK_ROOT
    ? path.resolve(LAMBDA_TASK_ROOT, filePath)
    : path.resolve(filePath.replace('src/lambda-built/', 'src/'))

export const readFileAsync = util.promisify(fs.readFile)

export const htmlEntities = (value: string) => value.replace('&', '&amp;')
