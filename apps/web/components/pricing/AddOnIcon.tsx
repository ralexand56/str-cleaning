import type { AddOnIcon as IconKey } from '@/lib/pricing/prices'

/** One consistent 24×24 line-icon set for the add-on tiles (plan §5 / §10 design notes). */
const PATHS: Record<IconKey, string[]> = {
  fridge: ['M6 2h12v20H6z', 'M6 9h12', 'M9 5v2', 'M9 12v3'],
  oven: ['M3 4h18v16H3z', 'M3 8h18', 'M6 11h12v6H6z', 'M7 6h.01', 'M10 6h.01'],
  microwave: ['M2 5h20v14H2z', 'M5 8h10v8H5z', 'M18 9v.01', 'M18 12v.01', 'M18 15v3'],
  stove: ['M3 10h18v11H3z', 'M7 6a2 2 0 1 0 0-.01', 'M17 6a2 2 0 1 0 0-.01', 'M3 14h18', 'M8 17h8'],
  cabinet: ['M3 3h18v18H3z', 'M12 3v18', 'M9 11v2', 'M15 11v2'],
  dishes: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8'],
  window: ['M4 3h16v18H4z', 'M12 3v18', 'M4 12h16'],
  'window-both': ['M4 3h16v18H4z', 'M12 3v18', 'M4 12h16', 'M1 8l2 2-2 2', 'M23 8l-2 2 2 2'],
  blinds: ['M4 3h16', 'M5 7h14', 'M5 11h14', 'M5 15h14', 'M5 19h14', 'M12 3v18'],
  baseboard: ['M3 3v15h18', 'M3 18v3h18v-3', 'M7 8h4', 'M7 12h8'],
  door: ['M6 2h12v20H6z', 'M15 12h.01', 'M3 22h18'],
  wall: ['M3 4h18v16H3z', 'M3 9h18', 'M3 14h18', 'M9 4v5', 'M15 9v5', 'M9 14v6'],
  fan: ['M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0', 'M12 10.5V3', 'M12 13.5V21', 'M10.5 12H3', 'M13.5 12H21', 'M12 3c3 0 3 7 0 7', 'M12 21c-3 0-3-7 0-7'],
  spot: ['M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z', 'M10 15a2 2 0 0 0 2 2'],
  alert: ['M12 3l10 18H2z', 'M12 10v5', 'M12 18h.01'],
  paw: ['M8 8a1.5 2 0 1 0 0-.01', 'M16 8a1.5 2 0 1 0 0-.01', 'M5 12a1.5 2 0 1 0 0-.01', 'M19 12a1.5 2 0 1 0 0-.01', 'M12 13c-3 0-5 3-5 5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2c0-2-2-5-5-5z'],
  poop: ['M5 20h14a3 3 0 0 0 0-6h-1a3 3 0 0 0-1-5h-1a3 3 0 0 0-5-3c0 1 1 3-1 3H8a3 3 0 0 0-1 5H5a3 3 0 0 0 0 6z'],
  'trash-bag': ['M7 9h10l1 12H6z', 'M9 9c0-3 1-5 3-6 2 1 3 3 3 6', 'M10 4l2 2 2-2'],
  odor: ['M6 20c0-3 3-3 3-6s-3-3-3-6', 'M12 20c0-3 3-3 3-6s-3-3-3-6', 'M18 20c0-3 3-3 3-6s-3-3-3-6'],
  bed: ['M2 19V7', 'M2 15h20v4', 'M22 15v-3a3 3 0 0 0-3-3h-8v6', 'M6 11a2 2 0 1 0 0-.01'],
  laundry: ['M4 2h16v20H4z', 'M4 6h16', 'M12 9a5 5 0 1 0 0 10 5 5 0 1 0 0-10', 'M7 4h.01'],
  bag: ['M5 8h14l-1 13H6z', 'M9 8V6a3 3 0 0 1 6 0v2'],
  'trash-can': ['M4 6h16', 'M10 3h4', 'M6 6l1 15h10l1-15', 'M10 10v7', 'M14 10v7'],
  garage: ['M3 10l9-7 9 7v11H3z', 'M7 21v-8h10v8', 'M7 16h10'],
  patio: ['M12 3v6', 'M3 9h18L12 3z', 'M12 9v12', 'M6 21v-5h12v5', 'M8 16v-3h8v3'],
  grill: ['M4 9h16a8 8 0 0 1-16 0z', 'M8 17l-2 4', 'M16 17l2 4', 'M8 5c0-1 1-1 1-2', 'M12 5c0-1 1-1 1-2', 'M16 5c0-1 1-1 1-2'],
  stain: ['M4 20h16', 'M8 16a4 3 0 1 0 8 0 4 3 0 1 0-8 0', 'M17 4l-2 5', 'M20 6l-4 4'],
  crib: ['M3 6v15', 'M21 6v15', 'M3 10h18', 'M3 18h18', 'M7 10v8', 'M11 10v8', 'M15 10v8', 'M19 10v8'],
  flower: ['M12 13a3 3 0 1 0 0-6 3 3 0 1 0 0 6', 'M12 7a3 3 0 1 1 0-.01', 'M12 13v8', 'M12 17c-3 0-5-2-5-4', 'M12 19c3 0 5-2 5-4'],
}

export function AddOnIcon({ icon, className }: { icon: IconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[icon].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
