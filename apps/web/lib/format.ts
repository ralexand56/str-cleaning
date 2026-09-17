/** 'IN_PROGRESS' -> 'In Progress', 'STR_TURNOVER' -> 'STR Turnover' */
export function humanize(value?: string | null): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((w) => (w === 'str' ? 'STR' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
