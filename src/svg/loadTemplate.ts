import { readFileAsync } from '../utils'

import { replaceTemplateValues } from './replaceTemplateValues'

export const loadTemplate = async (
  svgTemplateFilePath: string,
  data: Record<string, string>,
) => {
  const svgTemplate = await readFileAsync(svgTemplateFilePath, 'utf-8')

  return replaceTemplateValues(svgTemplate, data)
}
