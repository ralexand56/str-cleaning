/**
 * Hardcoded US federal holiday list for the Sunday/Holiday surcharge.
 * The pricing spec leaves the holiday calendar as an open item — this is a v1 default,
 * covers 2026–2028, and should be extended by whoever maintains config.json in future years.
 */
export const US_HOLIDAYS_2026_2028 = new Set<string>([
  // 2026
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25', '2026-06-19',
  '2026-07-04', '2026-09-07', '2026-10-12', '2026-11-11', '2026-11-26', '2026-12-25',
  // 2027
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-05-31', '2027-06-19',
  '2027-07-04', '2027-09-06', '2027-10-11', '2027-11-11', '2027-11-25', '2027-12-25',
  // 2028
  '2028-01-01', '2028-01-17', '2028-02-21', '2028-05-29', '2028-06-19',
  '2028-07-04', '2028-09-04', '2028-10-09', '2028-11-11', '2028-11-23', '2028-12-25',
])

export function isHolidayOrSunday(isoDate: string): boolean {
  if (!isoDate) return false
  if (US_HOLIDAYS_2026_2028.has(isoDate)) return true
  const day = new Date(`${isoDate}T12:00:00`).getDay()
  return day === 0
}
