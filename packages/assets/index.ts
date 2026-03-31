// Web (Next.js) — string paths served from /images/* (via public/ symlink)
export const images = {
  heroBg: '/images/unsplash-image-kF3KNcoXQXY.jpg',
  logo: '/images/logo.webp',
  hero1: '/images/7G2A8406.webp',
  hero2: '/images/7G2A8931.webp',
  room1: '/images/imgg-od3-0foqj0o1.webp',
  room2: '/images/imgg-od3-5k5b5qrm.webp',
  room3: '/images/imgg-od3-579qcx59.webp',
  room4: '/images/imgg-od3-_2zi79y5.webp',
} as const

export type ImageKey = keyof typeof images
