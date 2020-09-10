export const replaceTemplateValues = async (
  content: string,
  values: Record<string, string>,
) => {
  let result = content
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(`::${key}::`, value)
  }

  return result
}
