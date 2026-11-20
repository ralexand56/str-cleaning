'use client'

import { ADD_ON_GROUPS } from '@/lib/pricing/prices'
import { addOnUnitLabel, visibleAddOns } from '@/lib/pricing/engine'
import type { QuoteOptions, SelectedAddOn, ServiceType } from '@/lib/pricing/types'
import { AddOnIcon } from './AddOnIcon'

export function ProposedTag() {
  return (
    <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-amber-800">
      Proposed
    </span>
  )
}

/**
 * Add-ons as picture tiles: icon, name, price and unit, a + / − counter for per-item add-ons.
 * In residential deep / move-out / first recurring visit, bundled tiles show "Included".
 */
export function AddOnTiles({
  service,
  selected,
  onChange,
  bundledIncluded,
  options,
}: {
  service: ServiceType
  selected: SelectedAddOn[]
  onChange: (next: SelectedAddOn[]) => void
  bundledIncluded: boolean
  options?: QuoteOptions
}) {
  const addOns = visibleAddOns(service, options)

  function setQty(id: string, qty: number) {
    const rest = selected.filter((s) => s.id !== id)
    onChange(qty > 0 ? [...rest, { id, qty }] : rest)
  }

  return (
    <div className="flex flex-col gap-6">
      {bundledIncluded && (
        <p className="font-marcellus text-sm opacity-60">
          Kitchen appliances, inside windows, blinds, baseboards and doors are already part of this clean.
        </p>
      )}
      {ADD_ON_GROUPS.map((group) => {
        const items = addOns.filter((a) => a.group === group)
        if (!items.length) return null
        return (
          <div key={group}>
            <p className="font-marcellus text-xs opacity-40 uppercase tracking-widest mb-3">{group}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((a) => {
                const included = bundledIncluded && !!a.bundled
                const sel = selected.find((s) => s.id === a.id)
                const qty = sel?.qty ?? 0
                const on = !included && qty > 0
                const min = a.min ?? 1
                return (
                  <div
                    key={a.id}
                    className={[
                      'relative flex flex-col gap-2 rounded-2xl border p-4 text-left transition-colors',
                      included
                        ? 'border-dark-brown/10 bg-dark-brown/[0.03]'
                        : on
                          ? 'border-dark-brown bg-dark-brown/5'
                          : 'border-dark-brown/15 hover:border-dark-brown/40',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      disabled={included}
                      aria-pressed={on}
                      onClick={() => setQty(a.id, on ? 0 : min)}
                      className="flex flex-col gap-2 text-left bg-transparent border-none p-0 cursor-pointer disabled:cursor-default"
                    >
                      <AddOnIcon icon={a.icon} className={included ? 'opacity-40' : 'opacity-80'} />
                      <span className="font-marcellus text-sm leading-snug">
                        {a.name}
                        {a.proposed && <ProposedTag />}
                      </span>
                      <span className="font-marcellus text-xs opacity-55">
                        {included ? 'Included in this clean' : addOnUnitLabel(a)}
                        {!included && a.note ? ` · ${a.note}` : ''}
                      </span>
                    </button>
                    {included && (
                      <span className="absolute top-3 right-3 rounded-full bg-dark-brown text-stone px-2 py-0.5 font-marcellus text-[10px] uppercase tracking-wider">
                        Included
                      </span>
                    )}
                    {on && a.perItem && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          aria-label={`Fewer ${a.name}`}
                          onClick={() => setQty(a.id, qty - 1 < min ? 0 : qty - 1)}
                          className="w-7 h-7 rounded-full border border-dark-brown/30 flex items-center justify-center cursor-pointer bg-transparent"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-marcellus text-sm" aria-live="polite">{qty}</span>
                        <button
                          type="button"
                          aria-label={`More ${a.name}`}
                          onClick={() => setQty(a.id, Math.min(99, qty + 1))}
                          className="w-7 h-7 rounded-full border border-dark-brown/30 flex items-center justify-center cursor-pointer bg-transparent"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
