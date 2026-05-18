'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      '"We are extremely happy with this cleaning service for our Airbnb. They are reliable, detail-oriented and communication is always smooth. Highly recommend!!"',
    author: 'Trina K.',
  },
  {
    quote:
      '"I am beyond thankful for the services STR Cleaning providing. As a construction company manager it is important for me to handover complete and clean project. I am very happy with post construction cleaning STR Cleaning provided for several projects. They always leave the project spotless. Thank you guys for your hard work and help."',
    author: 'Emily M.',
  },
  {
    quote:
      '"STR is an extremely professional and detailed cleaning service that focuses on your specific needs, not just a general service. They walk through the residence with you and listen to your needs and make recommendations. They are very thorough and complete in their work and always adhere to timelines. They are available with new schedule changes and have the great flexibility needed. I highly recommend STR!"',
    author: 'Steve R.',
  },
  {
    quote:
      '"STR cleaning provides an excellent service to our investment property. Attentive to details, reliable, and proactive; STR takes the weight of worries away from our shoulders and brings confidence that our property is always presented in a crispy clean condition to our guests."',
    author: 'Galina A.',
  },
  {
    quote: '"Excellent job! Would highly recommend to friends and family!"',
    author: 'John J.',
  },
]

const GAP = 16
const SWIPE_THRESHOLD = 50

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function measure() {
      const card = containerRef.current?.querySelector<HTMLElement>('[data-card]')
      if (card) setCardWidth(card.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  function paginate(dir: 1 | -1) {
    setIndex(i => Math.max(0, Math.min(TESTIMONIALS.length - 1, i + dir)))
  }

  return (
    <div className="relative">
      {/* Overflow clip — the whole track slides as one unit */}
      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          className="flex"
          style={{ gap: GAP }}
          animate={{ x: -(cardWidth + GAP) * index }}
          transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.9 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, { offset }) => {
            if (offset.x < -SWIPE_THRESHOLD) paginate(1)
            else if (offset.x > SWIPE_THRESHOLD) paginate(-1)
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              data-card
              className="flex-shrink-0 w-[52%] max-lg:w-[80%] max-sm:w-[90%] rounded-xl p-8 flex flex-col justify-between min-h-[260px] cursor-grab active:cursor-grabbing select-none bg-[#E0D8D0]"
            >
              <p className="font-marcellus text-[clamp(1.2rem,2.2vw,1.75rem)] text-dark-brown leading-relaxed">
                {t.quote}
              </p>
              <p className="font-marcellus text-sm text-dark-brown opacity-50 mt-6">
                {t.author}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Arrows */}
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={() => paginate(-1)}
          disabled={index === 0}
          aria-label="Previous testimonial"
          className="w-10 h-10 rounded-full bg-dark-brown/15 flex items-center justify-center text-dark-brown hover:bg-dark-brown hover:text-stone transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <button
          onClick={() => paginate(1)}
          disabled={index === TESTIMONIALS.length - 1}
          aria-label="Next testimonial"
          className="w-10 h-10 rounded-full bg-dark-brown/15 flex items-center justify-center text-dark-brown hover:bg-dark-brown hover:text-stone transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  )
}
