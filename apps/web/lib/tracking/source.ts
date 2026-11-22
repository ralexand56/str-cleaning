/**
 * Where a visitor came from (Tatiana, Nov 2026): flyers and Instagram link to the site with
 * ?src=mail, ?src=instagram and so on. The tag is kept for the visit (sessionStorage) and saved
 * with each booking and lead, so the admin shows which campaign brought it in. No tag = "direct".
 */
const KEY = 'str_src'

/** Lowercase letters, digits, - and _, up to 40 characters. Anything else is dropped. */
export function cleanSource(raw: string | null | undefined): string {
  return (raw ?? '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 40)
}

/** Reads ?src= (or utm_source) from the current URL and keeps it for the visit. */
export function captureSource(): void {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const src = cleanSource(params.get('src') ?? params.get('utm_source'))
    if (src) sessionStorage.setItem(KEY, src)
  } catch {
    // Storage blocked (private mode, in-app browsers): the booking just says "direct".
  }
}

export function getSource(): string {
  if (typeof window === 'undefined') return 'direct'
  try {
    captureSource()
    return sessionStorage.getItem(KEY) || 'direct'
  } catch {
    return 'direct'
  }
}
