# STR Cleaning Crew — Pricing Calculator Build Spec

**For:** Web developer building the online pricing calculator **Prepared for:** STR Cleaning Crew LLC (Southern California) **Source of numbers:** **STR\_Complete\_Pricing\_Guide\_REVISED** (Google Drive), **May 12 2026** — the current, authoritative pricing. **Companion file:** `str_pricing_config.json` — every number below in machine-readable form. Import that as the single source of truth; this document explains how to use it.

> **Pricing model:** Unlike an earlier draft, this sheet uses **flat prices per property type**, not a "base rate \+ surcharges" formula. The customer picks a service and a property size; the price is a direct lookup. Add-ons and surcharges are added on top. To change a price later, edit `str_pricing_config.json` only.

---

## 1\. What the calculator does

A visitor picks a service and describes their property; the calculator returns an **estimate shown as a range (±10%)** with a note that the final price is confirmed after a walkthrough. Two customer modes:

- **STR (Airbnb / short-term rental):** emphasize the **two monthly subscription tiers** (Standard, Premium Care); also offer per-clean pricing.  
- **Residential:** emphasize **frequency** (weekly / biweekly / monthly), which requires a one-time first-visit deep clean to start.

One-time services (Deep, Move-In/Out, Post-Construction, Seasonal, STR Startup) are direct lookups by size. An agent partnership program exists but is B2B — keep it on a separate page, not the customer calculator.

---

## 2\. Core logic (per-clean / per-service)

1\. Customer selects Service Type and Property Category (STR or Residential).

2\. Customer enters bedrooms \+ bathrooms (+ optional sqft).

3\. Map that to the nearest row of THAT service's size table (each service has its own table).

4\. price \= flat lookup from the table.

5\. price \+= sum(selected add-on line totals)      // line \= price × qty

6\. price \+= applicable flat surcharges (§8)

7\. Display price ±10% as a range, rounded to nearest $5.

There is no sqft-plus-surcharge arithmetic in this model. **Property-type mapping** is the one piece of logic: take the customer's beds/baths/sqft and snap to the closest defined size row. If it falls outside the defined sizes, show **"Contact us for a custom quote."**

---

## 3\. STR turnover — per clean

Flat price per turnover (identical to the subscription per-clean rate).

| Property type | Sq ft | Price |
| :---- | :---- | :---- |
| Studio / 1b1b | ≤ 800 | $175 |
| 2b 1.5b | 800–1,200 | $225 |
| 2b 2b | 800–1,200 | $240 |
| 3b 2b | 1,200–1,500 | $265 |
| 3b 2.5b | 1,500–2,000 | $315 |
| 4b 3b | 2,000–2,500 | $355 |
| 5b 4b | 2,500–3,000 | $430 |
| 5b 5b+ | 3,000+ | $495 |

---

## 4\. STR monthly subscriptions (two tiers)

Base \= **5 turnovers/month.** Show the monthly price prominently, plus a "per-clean equivalent" \= monthly ÷ 5 in smaller text.

| Property type | Standard /mo | Premium Care /mo | Per-clean | Extra clean |
| :---- | :---- | :---- | :---- | :---- |
| Studio / 1b1b | $875 | $1,125 | $175 | $160 |
| 2b 1.5b | $1,125 | $1,425 | $225 | $200 |
| 2b 2b | $1,200 | $1,500 | $240 | $215 |
| 3b 2b | $1,325 | $1,625 | $265 | $240 |
| 3b 2.5b | $1,575 | $1,925 | $315 | $285 |
| 4b 3b | $1,775 | $2,175 | $355 | $320 |
| 5b 4b | $2,150 | $2,600 | $430 | $385 |
| 5b 5b+ | $2,475 | $2,975 | $495 | $445 |

### What's included per tier

| Feature | Standard | Premium Care |
| :---- | :---- | :---- |
| 5 Regular Turnovers / Month | ✓ | ✓ |
| Post-Clean Inspection Report | ✓ | ✓ |
| Photo Documentation (per clean) | ✓ | ✓ |
| Supply Level Monitoring & Alerts | ✓ | ✓ |
| Restock Coordination | ✓ | ✓ |
| Priority Same-Day Scheduling | — | ✓ |
| Maintenance Issue Reporting \+ Vendor Coordination | — | ✓ |
| 1 Seasonal Deep Clean Included / Year | — | ✓ |
| Dedicated Account Manager | — | ✓ |
| Guest-Ready Styling & Staging Check | — | ✓ |

### Subscription rules

1. Base is 5 turnovers/month. Fewer bookings → crew double-teams for a deeper clean (no refund).  
2. Turnovers beyond 5 bill at the **Extra clean** rate (10% below per-clean).  
3. Minimum commitment 3 months, then month-to-month with 30-day cancellation notice.  
4. Prepay 10% off any tier (paid quarterly or annually).  
5. Premium Care seasonal deep clean: scheduled twice/year — one included free, second at 50% off.  
6. Non-standard size → "Contact us for a custom quote."

---

## 5\. Residential

Residential subscriptions require a **one-time first-visit deep clean** to start, then recurring visits.

### First-visit deep clean (required to start)

| Home size | Price |
| :---- | :---- |
| Small (≤ 1,200 sqft) | $350 |
| Medium (1,200–1,800) | $450 |
| Large (1,800–2,500) | $595 |
| XL (2,500–3,500) | $795 |
| Estate (3,500+) | $995 |

### Recurring price **per visit** (weekly is cheapest per visit; monthly highest)

| Home size | Weekly | Biweekly | Monthly |
| :---- | :---- | :---- | :---- |
| Small | $165 | $195 | $225 |
| Medium | $195 | $235 | $275 |
| Large | $245 | $295 | $345 |
| XL | $295 | $355 | $415 |
| Estate | $365 | $435 | $495 |

### Monthly cost to client (per-visit × visits/month: weekly 4×, biweekly 2×, monthly 1×)

| Home size | Weekly (4×) | Biweekly (2×) | Monthly (1×) |
| :---- | :---- | :---- | :---- |
| Small | $660 | $390 | $225 |
| Medium | $780 | $470 | $275 |
| Large | $980 | $590 | $345 |
| XL | $1,180 | $710 | $415 |
| Estate | $1,460 | $870 | $495 |

---

## 6\. One-time & specialty services (lookups by size)

**Deep Cleaning:** 1b1b ≤800 $295 · 2b2b 800–1,200 $425 · 3b2b 1,200–1,500 $545 · 3b2.5b–4b3b 1,500–2,500 $695 · 5b4b+ 2,500–3,500 $895.

**Move-In / Move-Out:** Apt/Condo ≤1,200 $495 · Small House 1,200–1,800 $695 · Medium House 1,800–2,500 $895 · Large House 2,500–3,500 $1,195 · Estate 3,500+ $1,495.

**Post-Construction (rough \+ detail):** Small Remodel ≤500 $495 · Medium Remodel 500–1,200 $895 · Full Home ≤2,000 $1,495 · Full Home 2,000–3,000 $1,995 · Large/New Build 3,000+ $2,495.

**Seasonal (full-property reset):** Studio $1,095 · 2b1.5b $1,295 · 2b2b $1,495 · 3b2b $1,595 · 3b2.5b $1,795 · 4b3b $2,395 · 5b4b $3,195 · 5b5b+ $3,695.

**STR Startup / Onboarding (one-time):** ≤2,000 sqft $895 · over 2,000 sqft $1,195 (over 3,500 quoted separately). Optional hourly add-ons: General/Excessive Condition $50/hr per cleaner (min 2, manager approval); Kitchen & Dining Organization $70/hr; Bedrooms & Living Areas Organization $70/hr.

---

## 7\. Add-ons ("Customize Your Clean")

From the REVISED sheet, aligned to Regular Turnover. **Line total \= price × quantity.** Items marked "+cost"/"+receipt" are pass-through at cost.

> The source labels this menu "Manager-only — do not share with cleaners." Decide with the client which of these should appear on the **public** calculator vs. stay internal.

| Category | Add-on | Price | Unit |
| :---- | :---- | :---- | :---- |
| Kitchen | Full Fridge Cleaning | $30 | flat |
| Kitchen | Oven Interior Deep Clean | $30 | flat |
| Kitchen | Stove Deep Clean | $15 | flat |
| Kitchen | Dishwashing — 1st load | Free | included |
| Kitchen | Dishwashing — additional loads | $15 | per load |
| Pet | Pet Hair Removal | $30 | flat |
| Pet | Pet Waste Removal & Disinfection | $30 | flat |
| Walls/Floors/Fabrics | Wipe Walls | $25 | per wall side |
| Walls/Floors/Fabrics | Spot Cleaning (fabric/carpet) | $20 | per spot |
| Laundry | Wash & Dry Laundry (light items) | $20 | per load |
| Laundry | Laundry Run (bulky items) | $30 \+ cost | per run |
| Outdoor | Grill Deep Clean | $85 | flat |
| Outdoor | Outdoor Stain Washing | $15 | per spot |
| Odor | Ozone Machine Odor Removal | $50 | per hour (min 4\) |
| Windows | Windows — inside \+ outside | $10 | per window |
| Windows | Windows — inside only | $5 | per window |
| Misc | Charging Cameras / Smart Devices | Free | included |
| Misc | Baby Crib / Fold-Out Bed Packing | $10 | flat |
| Misc | Extra Trash Removal | $20 | per 13-gal bag |
| Misc | Flower / Fruit Pickup | $20 \+ receipt | flat |

**Condition escalations (manager-applied, usually off the public calculator):** Deep Beyond Normal Cleaning $50/room · Extra Cleaning/Excessive Condition $50/hr per cleaner (min 2\) · Contracted Extra Services \+10% of contractor invoice.

---

## 8\. Surcharges

Flat, added after the service price \+ add-ons.

| Surcharge | Amount | On calculator? | Trigger |
| :---- | :---- | :---- | :---- |
| Emergency Same-Day Call-Out | $50 | Yes | Checkbox "I need this today" |
| Sunday & Holiday | $50 | Yes | Auto if date \= Sunday or holiday |
| Late Cancellation (\< 24 hrs) | $100 | No | Policy fee, billed manually |
| Waiting Time (\> 15 min) | $25 / 30 min | No | Billed manually |

Emergency/restoration (custom-quoted, off the self-serve calculator): Emergency Supervisor Dispatch 10% of approved damage claim · Ozone Treatment $75 (min 4 hrs, vacant) · Flood/Water Damage custom.

---

## 9\. Display & UX notes

1. Show the estimate as a **range (±10%)**: "Your estimate: $250 – $305," with "Final price confirmed after a property walkthrough."  
2. **STR** → surface the two subscription tiers. **Residential** → surface frequency (and flag the required first-visit deep clean).  
3. Show **Regular** first, then **Seasonal** and **Deep** as upgrades with the price difference shown.  
4. Add-ons appear **after** the base price, in a "Customize Your Clean" section.  
5. For subscriptions, show the **monthly price** plus the **per-clean equivalent** (monthly ÷ 5).  
6. "Not sure?" CTA → contact form / phone for a custom quote.  
7. "Starting at $X" on service pages using the smallest property size.  
8. Mobile: accordions for the add-on list.  
9. Trust row: "5-Star Rated · Insured · Background Checked · Bilingual Teams."

---

## 10\. Open items for the client to confirm

- Prices are from the **May 12 2026** REVISED sheet. Confirm still current before launch.  
- Which add-ons should appear on the **public** calculator vs. stay manager-only.  
- Provide the holiday-calendar list for the Sunday & Holiday surcharge.  
- Provide the booking phone number for the CTA.  
- Sales tax: currently `tax_rate: 0`. Set if cleaning services are taxable in your jurisdiction.  
- The agent partnership program (§ in JSON) — keep on a separate B2B page, not the customer calculator?

