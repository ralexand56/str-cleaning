'use client'

import { useState } from 'react'
import Link from 'next/link'

type Section = { heading?: string; bullets: string[] }
type Item = { title: string; sections: Section[]; note?: Section }

const PACKAGES: Item[] = [
  {
    title: 'Startup Cleaning',
    sections: [
      {
        bullets: [
          'Property standards setup with documentation of host rules, info, and preferred staging',
          'Getting and guest experience audit with aesthetic and presentation recommendations',
          'Kitchen and dining organisation for tableware, cookware, and overall order',
          'Bedroom and living area setup standards for pillows, throws, and furniture layout',
          'Bathroom and laundry standards, including supply checklists and towel organisation',
          'Documentation and handover with a customised photo guide and full report for the host and cleaning team',
        ],
      },
    ],
  },
  {
    title: 'Standard STR Cleaning (Turn Over)',
    sections: [
      {
        heading: 'Bedrooms',
        bullets: [
          'Full room inspection and issue reporting',
          'Dusting of all surfaces and décor',
          'Cobweb removal',
          'Interior windows, sills, and sliding doors cleaned',
          'Closet and wardrobe organisation',
          'Bed linens changed and beds styled per host guide',
          'Trash emptied and linens replaced',
          'Floors vacuumed and mopped',
        ],
      },
      {
        heading: 'Kitchen',
        bullets: [
          'Full kitchen inspection',
          'Countertops disinfected, sink scrubbed, faucet polished',
          'Stovetop cleaned (no grease or residue)',
          'Backsplash cleaned',
          'Appliances exteriors polished',
          'Microwave cleaned (inside spatters, outside wiped)',
          'Cabinets wiped, interiors checked and organised',
          'Kitchen supplies restocked (or purchased if requested)',
          'Trash removed, bin sanitised if needed',
          'Floors vacuumed and mopped',
        ],
      },
      {
        heading: 'Living Room & Common Areas',
        bullets: [
          'Full area inspection',
          'Dusting of all furniture, décor, and lamps',
          'Mirrors and glass cleaned',
          'Windows and sliding doors wiped',
          'High-touch surfaces disinfected (remotes, switches, handles)',
          'Cameras replaced in rotation and locks (purchased if needed)',
          'Sofas vacuumed, pillows fluffed, throws styled per reference photo',
          'Carpets and floors vacuumed and mopped',
          'Trash emptied',
        ],
      },
      {
        heading: 'Bathrooms',
        bullets: [
          'Full bathroom inspection',
          'Mirrors and chrome polished',
          'Shower, tub, tiles, grout, and drains cleaned',
          'Toilet cleaned and disinfected',
          'Sink, faucet, and countertop cleaned',
          'Towels replaced',
          'Bathroom supplies restocked (or purchased if needed)',
          'Trash emptied',
          'Floors vacuumed and mopped',
        ],
      },
      {
        heading: 'Outdoor Areas (if applicable)',
        bullets: [
          'Outdoor inspection (patio, balcony, yard, pool area)',
          'Cobweb removal',
          'Outdoor furniture wiped and arranged',
          'Cushion shaken and wiped',
          'Glass doors and railings cleaned',
          'Floors swept or blown clear of debris',
          'Trash emptied',
          'Pool & spa usability check',
          'Towels replaced if provided',
        ],
      },
      {
        heading: 'Inspection & Reporting',
        bullets: [
          'Detailed inspection report after each service',
          'Photo report for quality control and confirmation',
          'On-site restocking and extra services as needed',
        ],
      },
      {
        heading: 'Additional Services (Upon Request)',
        bullets: [
          'Camera and smart device charging',
          'Full fridge cleaning',
          'Oven interior deep cleaning',
          'Stove deep cleaning',
          'Dishwashing',
          'Wall wiping',
          'Spot cleaning for carpets and upholstery',
          'Laundry wash & dry services',
          'Baby crib or fold-out bed setup',
          'Pet hair removal',
          'Pet waste removal & disinfection',
          'Ozone odor removal treatment',
          'Grill deep cleaning',
          'Outdoor stair washing',
          'Extra trash removal',
          'Flower or grocery pickup',
          'Contracted specialty services',
        ],
      },
      {
        heading: 'Policies & Fees',
        bullets: [
          'Same-day emergency call-in surcharge',
          'Late cancellation fee',
          'Waiting time charges',
          'Holiday cleaning surcharge',
          'Emergency service hourly rates',
        ],
      },
    ],
  },
  {
    title: 'Deep Cleaning',
    sections: [
      {
        heading: 'Bedrooms',
        bullets: [
          'Baseboards and moldings hand wiped',
          'Walls spot cleaned (scuffs and marks)',
          'Closet interiors wiped and shelves organised',
          'Bed frame cleaned around perimeter and surfaces',
          'Lampshades and fixtures deep-dusted',
          'Ceiling light fixtures, chandeliers, and ceiling fans washed and wiped (accessible heights only)',
        ],
      },
      {
        heading: 'Kitchen',
        bullets: [
          'Inside cabinets and drawers emptied and cleaned',
          'Refrigerator deep cleaned (shelves, drawers, seals)',
          'Oven interior scrubbed, racks degreased',
          'Stove burners, drip pans, and grease trays dismantled and cleaned',
          'Backsplash degreased and polished',
        ],
      },
      {
        heading: 'Living Room & Common Areas',
        bullets: [
          'Ceiling fixtures, chandeliers, and ceiling fans washed and wiped (accessible heights only)',
          'Furniture vacuumed under cushions and in crevices',
          'Window tracks and frames wiped',
          'Baseboards and high areas (vents, fans) hand wiped',
        ],
      },
      {
        heading: 'Bathrooms',
        bullets: [
          'Tile and grout scrubbed with descaling solution',
          'Shower and tub walls polished, calcium and lime removed',
          'Cabinet interiors cleaned and organised',
          'Exhaust fans deep cleaned',
          'Chrome and polished fixtures detailed',
        ],
      },
      {
        heading: 'Laundry Room',
        bullets: [
          'Areas behind and under the washer and dryer cleaned',
          'Washer and dryer drums wiped',
          'Cabinet shelves dusted and organised',
        ],
      },
      {
        heading: 'Outdoor Areas',
        bullets: [
          'Outdoor furniture deep scrubbed',
          'Cushions vacuumed and stains spot cleaned',
          'Glass doors and railings polished, streak-free',
          'Outdoor stains washed (patio, deck, garage spots)',
          'Patio sliding doors cleaned (inside and outside if accessible)',
        ],
      },
    ],
  },
  {
    title: 'Emergency Kit (Products & Package Options)',
    sections: [
      {
        bullets: [
          'Toothbrush & Toothpaste kit',
          'Razors Pack',
          'Sheet Set (Twin / Queen / King)',
          'Paper Towels',
          'Travel Kit (Small & Large)',
          'Shampoo, Conditioner & Body Wash Set',
          'STR Kit (Toothbrush, Toothpaste, Bathrobes & Bath Bombs)',
        ],
      },
    ],
  },
  {
    title: 'Seasonal Cleaning',
    sections: [
      {
        bullets: [
          'Mattress vacuuming & rotation (if needed)',
          'Vents & AC filters deep cleaned (replacement if needed)',
          'Curtains, blinds, and shutters deep cleaned',
          'Carpets and rugs deep cleaned',
          'Interior & exterior windows cleaned (if accessible)',
          'Dishwasher and hood filters cleaned & descaled',
          'Fridge cleaned and water filter replaced (if accessible)',
          'Pantry checked and sanitised',
          'Exhaust fans and shower heads descaled',
          'Silicone, grout, and caulking inspected',
          'Shower curtains washed',
          'Washer and dryer filters, vents, and surrounding areas cleaned',
          'Outdoor furniture deep cleaned and protected',
          'Patio, deck, or garage pressure washed (via contractor)',
          'Pool, spa, and grill inspection (service scheduled if needed)',
          'Smoke/CO batteries and lightbulbs replaced',
          'Minor maintenance issues noted and reported',
          'Basic pest prevention check',
        ],
      },
      {
        heading: 'Contracted Services (if needed, through partners)',
        bullets: [
          'Carpet & upholstery cleaning',
          'Window cleaning',
          'Pressure washing',
          'Pool & spa service',
          'Grill full service',
          'Roof & gutter cleaning',
          'Gardening services',
          'Specialised pest control',
        ],
      },
    ],
  },
  {
    title: 'Emergency Response & Restorative Services',
    sections: [
      {
        bullets: [
          'On-site supervisor coordination',
          'Damage inspection and host communication',
          'Contractor management (painting, repairs, replacements)',
          'Upholstery, carpet, and window cleaning after incidents',
          'Pest control and sanitation consultation',
          'Urgent purchases and replacements',
          'Biohazard and hazardous cleanup (quoted individually)',
          'On-site supervision: $150/day',
          '15% service fee on total restoration cost',
          'Mileage charged for emergency runs or extra site visits',
        ],
      },
    ],
  },
]

export function BusinessAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col w-full">
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
                      <p className="font-marcellus text-sm text-dark-brown mb-2 font-semibold">
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
          Schedule a Cleaning
        </Link>
      </div>
    </div>
  )
}
