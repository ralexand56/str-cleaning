import type { ServiceType } from './types'

/**
 * Maps service + package to the closest existing Job `type`. The schema has no separate
 * residential standard/deep or STR long-stay type, so the exact package is also stored
 * in the job's propertySize text and in the notification email.
 */
export function jobTypeFor(service: ServiceType, packageKey: string): string {
  if (service === 'post_construction') return 'POST_CONSTRUCTION'
  if (service === 'residential') {
    if (packageKey === 'recurring') return 'RESIDENTIAL_RECURRING'
    if (packageKey === 'move') return 'MOVE_IN_OUT'
    return 'RESIDENTIAL_FIRST_VISIT'
  }
  switch (packageKey) {
    case 'plan_standard': return 'STR_SUBSCRIPTION_STANDARD'
    case 'plan_premium':  return 'STR_SUBSCRIPTION_PREMIUM'
    case 'long_stay':     return 'STR_DEEP'
    case 'seasonal':      return 'STR_SEASONAL'
    case 'startup':       return 'STR_STARTUP'
    default:              return 'STR_TURNOVER'
  }
}

/** The package key the job type mapping needs, from the calculator state. */
export function packageKeyOf(s: { service: ServiceType; strPackage: string; resPackage: string; pcPass: string }): string {
  return s.service === 'str' ? s.strPackage : s.service === 'residential' ? s.resPackage : s.pcPass
}
