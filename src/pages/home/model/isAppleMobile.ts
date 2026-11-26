export function isAppleMobile({ userAgent, maxTouchPoints }: Navigator) {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}
