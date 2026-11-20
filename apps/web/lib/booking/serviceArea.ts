/**
 * Cities we serve (Tatiana, Nov 19 2026). An address outside this list isn't blocked: the visitor
 * sees a note and the team decides, so a misspelled or neighbouring city never loses a booking.
 */
export const SERVICE_AREA_CITIES = [
  'Long Beach',
  'Torrance',
  'Redondo Beach',
  'Irvine',
  'Newport Beach',
  'Costa Mesa',
  'Lake Forest',
  'Aliso Viejo',
  'Laguna Hills',
  'Laguna Beach',
  'Laguna Niguel',
  'Mission Viejo',
] as const

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

/** True when the city matches one we serve ("Redondo" and "Newport" count too). */
export function inServiceArea(city: string): boolean {
  const c = norm(city)
  if (!c) return true
  return SERVICE_AREA_CITIES.some((s) => {
    const n = norm(s)
    return n === c || n.replace(/beach$/, '') === c
  })
}

export function serviceAreaText(): string {
  return `${SERVICE_AREA_CITIES.slice(0, -1).join(', ')} and ${SERVICE_AREA_CITIES[SERVICE_AREA_CITIES.length - 1]}`
}
