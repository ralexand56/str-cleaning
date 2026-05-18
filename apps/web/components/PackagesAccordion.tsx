'use client'

import { useState } from 'react'
import Link from 'next/link'

type Item = {
  title: string
  sections: { heading?: string; bullets: string[] }[]
  note?: { heading: string; bullets: string[] }
}

const PACKAGES: Item[] = [
  {
    title: 'Regular Cleaning',
    sections: [
      {
        bullets: [
          'Full inspection of all areas',
          'Removal of cobwebs and dust from ceilings, corners, and surfaces',
          'Dusting of furniture, décor, electronics, and visible items (dry method only)',
          'Light organization of visible spaces',
          'Bed making with existing linens',
          'Trash removal (linens replaced if provided)',
          'Complete floor care: vacuuming and mopping',
          'Kitchen cleaning including counters, sink and faucet scrubbing, appliance exterior wiping, cabinet doors and handles, stovetop surface, and microwave interior spot cleaning',
          'Living room and common areas: mirrors and glass cleaning, window sills and blinds dusting (dry), sofa and rug vacuuming, pillow fluffing, and basic arrangement of throws',
          'Bathroom sanitation: sinks, countertops, mirrors, chrome fixtures, showers, tubs, toilets, and floor care',
          'Laundry area: exterior wipe-down of washer and dryer, surface dusting, trash removal, and floor care',
        ],
      },
      {
        heading: 'Add-Ons (Services Available)',
        bullets: [
          'Linen organization to prepare spaces for cleaning',
          'Bed linen change',
          'Laundry washing, drying, and folding',
          'Exterior window cleaning',
          'Wet cleaning of blinds',
          'Hot tub removal',
          'Stove/oven grease removal (surface components only)',
          'Refrigerator interior wipe-down',
          'Oven exterior surface cleaning (no disassembly)',
          'Inside cabinet cleaning (as requested)',
          'Dishwashing service',
          'Patio or backyard sweeping',
          'Hand styling (bathroom)',
        ],
      },
    ],
  },
  {
    title: 'Deep Cleaning',
    sections: [
      {
        bullets: [
          'Full inspection of all areas',
          'Removal of cobwebs and dust from ceilings, corners, and surfaces',
          'Dusting of furniture, décor, electronics, and visible items (dry method only)',
          'Light organization of visible spaces',
          'Bed making with existing linens',
          'Trash removal (linens replaced if provided)',
          'Complete floor care: vacuuming and mopping',
          'Kitchen deep cleaning: counters, thorough disinfecting of sink and faucets, appliance exterior wiping, interior cabinet wipe-down, stovetop degreasing, and microwave deep clean inside and out',
          'Living room and common areas: deep dust of surfaces, mirrors and glass cleaning, thorough window sills and blinds cleaning, sofa and rug vacuuming, pillow fluffing, and full arrangement of throws',
          'Bathroom deep sanitation: sinks, countertops, mirrors, chrome fixtures, scrubbing of showers, tubs, and toilets, grout brushing, and floor care',
          'Laundry area: thorough wipe-down of washer and dryer, surface deep cleaning, trash removal, and floor care',
        ],
      },
      {
        heading: 'Add-Ons (Services Available)',
        bullets: [
          'Linen organization to prepare spaces for cleaning',
          'Bed linen change',
          'Laundry washing, drying, and folding',
          'Exterior window cleaning',
          'Wet cleaning of blinds',
          'Hot tub removal',
          'Stove/oven grease removal (surface components only)',
          'Refrigerator interior wipe-down',
          'Oven exterior surface cleaning (no disassembly)',
          'Inside cabinet cleaning (as requested)',
          'Dishwashing service',
          'Patio or backyard sweeping',
          'Hand styling (bathroom)',
        ],
      },
    ],
  },
  {
    title: 'Move-Out Cleaning (Empty Unit – Full Reset for Lease Return)',
    sections: [
      {
        bullets: [
          'Property must be completely empty of personal belongings',
          'Service designed to meet landlord and property management move-out standards',
          'Full inspection of the entire unit',
          'Removal of all debris from ceilings, corners, and fixtures',
          'Walls spot cleaned to remove marks, smudges, and residue',
          'Ceiling fan blades cleaned (if present)',
          'Doors, door frames, baseboards, switches, outlets, and handles hand-wiped',
          'Interior windows, window sills, and tracks cleaned',
          'Blinds slot cleaned',
        ],
      },
      {
        heading: 'Kitchen (Move-Out)',
        bullets: [
          'Full kitchen inspection',
          'Sink and faucet scrubbing',
          'Cabinet and drawer interiors emptied and wiped',
          'Cabinet exteriors, handles, and frames cleaned',
          'Countertops scrubbed and disinfected',
          'Sink scrubbed, faucet polished, buildup removed',
          'Backsplash degreased and cleaned',
          'Range hood degreased, filters removed and cleaned',
          'Oven cleaned inside and out',
          'Refrigerator cleaned inside and out',
          'Microwave cleaned inside and out',
          'Dishwasher cleaned inside and out',
          'Trash removed',
        ],
      },
      {
        heading: 'Bathrooms (Move-Out)',
        bullets: [
          'Full bathroom inspection',
          'Mirrors, glass, and light fixtures cleaned',
          'Sink, faucet, and countertop deeply scrubbed',
          'Shower wall-to-wall, tiles, grout, corners, and edges scrubbed',
          'Hard water stains and mineral buildup removed',
          'Shower glass and tracks cleaned and polished',
          'Toilet fully cleaned and disinfected',
          'Vanity cabinets cleaned as needed',
          'Floors scrubbed and mopped',
        ],
      },
      {
        heading: 'Laundry Area (Move-Out)',
        bullets: [
          'Washer and dryer cleaned inside and out',
          'Lint trap cleaned',
          'Cabinets and shelves cleaned',
          'Walls spot cleaned as needed',
          'Floors cleaned',
        ],
      },
    ],
    note: {
      heading: 'Important Note',
      bullets: [
        'Not included unless quoted separately',
        'Items in compliance with lease and landlord requirements',
        'Subject to unit repair',
        'Grease accumulation or excessive buildup',
        'Carpet replacement or repair',
        'Hazardous material removal',
      ],
    },
  },
  {
    title: 'Move-In Cleaning (Preparation & Sanitation for New Occupancy)',
    sections: [
      {
        bullets: [
          'Designed to prepare the home for safe, hygienic, and comfortable living',
          'Focus on persistent disinfection and readiness for daily use',
          'Full move-in inspection of the entire unit',
          'Cobweb removal from ceilings, corners, and fixtures',
          'Walls dry dusted and spot cleaned',
          'Doors, baseboards, window sills, outlets, and handles cleaned and disinfected',
          'Interior windows, window sills, and tracks cleaned',
          'Blinds spot cleaned',
        ],
      },
      {
        heading: 'Kitchen (Move-In)',
        bullets: [
          'Full kitchen inspection',
          'Cabinet and drawer interiors cleaned and disinfected',
          'Cabinet exteriors, handles, and frames cleaned and disinfected',
          'Countertops scrubbed and disinfected',
          'Sink scrubbed, faucet polished, and sanitized',
          'Backsplash scrubbed and degreased',
          'Range hood interior wiped and degreased',
          'Refrigerator cleaned inside and out',
          'Microwave cleaned inside and out',
          'Dishwasher cleaned inside and out',
        ],
      },
      {
        heading: 'Bathrooms (Move-In)',
        bullets: [
          'Full bathroom inspection',
          'Walls spot checked and wiped to sanitize',
          'Mirrors, glass, and light fixtures cleaned and polished',
          'Sink, faucet, and countertop deeply scrubbed and disinfected',
          'Shower wall-to-wall, tiles, grout, corners, and edges scrubbed and sanitized',
          'Hard water stains and mineral buildup removed',
          'Shower glass and tracks cleaned and polished',
          'Toilet fully cleaned and disinfected',
          'Vanity cabinets cleaned inside and out',
          'Floors thoroughly cleaned and disinfected',
        ],
      },
      {
        heading: 'Laundry Area (Move-In)',
        bullets: [
          'Washer and dryer cleaned inside and out',
          'Lint trap cleaned',
          'Cabinets and shelves cleaned',
          'Floors cleaned and disinfected',
          'Shelves cleaned and disinfected',
        ],
      },
    ],
  },
]

export function PackagesAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-0 w-full">
      {PACKAGES.map((pkg, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="border-b border-dark-brown/20">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-marcellus text-[clamp(0.95rem,1.8vw,1.15rem)] text-dark-brown pr-4">
                {pkg.title}
              </span>
              <span className="text-dark-brown text-xl flex-shrink-0 leading-none">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="pb-8">
                {pkg.sections.map((sec, j) => (
                  <div key={j} className={j > 0 ? 'mt-6' : ''}>
                    {sec.heading && (
                      <p className="font-marcellus text-sm text-dark-brown mb-2 opacity-90">
                        {sec.heading}
                      </p>
                    )}
                    <ul className="flex flex-col gap-1.5">
                      {sec.bullets.map((b, k) => (
                        <li
                          key={k}
                          className="font-marcellus text-xs text-dark-brown opacity-70 leading-relaxed before:content-['*'] before:mr-2 before:opacity-50"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {pkg.note && (
                  <div className="mt-6 pt-4 border-t border-dark-brown/15">
                    <p className="font-marcellus text-sm text-dark-brown mb-2 opacity-90">
                      {pkg.note.heading}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {pkg.note.bullets.map((b, k) => (
                        <li
                          key={k}
                          className="font-marcellus text-xs text-dark-brown opacity-70 leading-relaxed before:content-['*'] before:mr-2 before:opacity-50"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="mt-12">
        <Link
          href="/book"
          className="inline-block px-10 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-sm no-underline hover:opacity-75 transition-opacity"
        >
          Book a Cleaning
        </Link>
      </div>
    </div>
  )
}
