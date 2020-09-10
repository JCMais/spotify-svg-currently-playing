export const barGen = (barCount: number) => {
  return new Array(barCount)
    .fill(null)
    .map((_, idx) => {
      const left = idx * 4

      const anim = (1000 + Math.random() * 350) | 0

      return `.bar:nth-child(${
        idx + 1
      }) { left: ${left}px; animation-duration: ${anim}ms; }`
    })
    .join('')
}
