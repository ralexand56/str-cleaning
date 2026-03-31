// React Native — static require() references resolved by Metro
export const images = {
  heroBg: require('./images/unsplash-image-kF3KNcoXQXY.jpg'),
  logo: require('./images/logo.webp'),
  hero1: require('./images/7G2A8406.webp'),
  hero2: require('./images/7G2A8931.webp'),
  room1: require('./images/imgg-od3-0foqj0o1.webp'),
  room2: require('./images/imgg-od3-5k5b5qrm.webp'),
  room3: require('./images/imgg-od3-579qcx59.webp'),
  room4: require('./images/imgg-od3-_2zi79y5.webp'),
} as const

export type ImageKey = keyof typeof images
