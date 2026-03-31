import { useEffect } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'

const EASE_OUT = Easing.out(Easing.ease)

export function useRiseIn(delay: number) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(18)

  useEffect(() => {
    const config = { duration: 900, easing: EASE_OUT }
    opacity.value = withDelay(delay, withTiming(1, config))
    translateY.value = withDelay(delay, withTiming(0, config))
  }, [])

  return useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })
}
