/**
 * Proposed prices (calculator-spec.md "Proposed" items, README "Not final yet") stay off the
 * public site until Tatiana confirms them. Set NEXT_PUBLIC_SHOW_PROPOSED_PRICES=true on a
 * preview deployment to review them; leave it unset in production.
 *
 * The admin quote builder always sees proposed items (flagged), regardless of this switch.
 */
export const SHOW_PROPOSED = process.env.NEXT_PUBLIC_SHOW_PROPOSED_PRICES === 'true'
