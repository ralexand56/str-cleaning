import { useEffect } from 'react'
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { images } from '@str-cleaning/assets'
import { Navbar } from './Navbar'

const { width, height } = Dimensions.get('window')

const EASE_OUT = Easing.out(Easing.ease)
const EASE_IN_OUT = Easing.inOut(Easing.ease)

function useRiseIn(delay: number) {
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

export function HeroSection() {
  const router = useRouter()

  // ── Ken Burns zoom ──────────────────────────────────────────────────────────
  const scale = useSharedValue(1.02)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 18000, easing: EASE_IN_OUT }),
        withTiming(1.02, { duration: 18000, easing: EASE_IN_OUT }),
      ),
      -1,   // infinite
      false // don't auto-reverse (sequence handles it)
    )
  }, [])

  const bgStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  // ── Staggered rise-in ───────────────────────────────────────────────────────
  const headlineStyle = useRiseIn(0)
  const subtitleStyle = useRiseIn(120)
  const ctaStyle      = useRiseIn(240)

  return (
    <View className="flex-1 bg-bg-dark">
      {/* Background image — Ken Burns */}
      <Animated.View
        style={[
          { position: 'absolute', width, height },
          bgStyle,
        ]}
      >
        <ImageBackground
          source={images.heroBg}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(20,17,14,0.56)', 'rgba(43,37,31,0.56)']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Content */}
      <View className="flex-1">
        <Navbar />

        <View className="flex-1 items-center justify-center px-5 pb-20">
          <Animated.Text
            style={headlineStyle}
            className="font-marcellus text-stone text-center text-4xl leading-tight tracking-wide mb-12"
          >
            Experience the Art of{'\n'}Pristine Clean
          </Animated.Text>

          <Animated.Text
            style={subtitleStyle}
            className="text-muted font-marcellus text-center text-base tracking-wide mb-10"
          >
            We handle your property. You run your business.
          </Animated.Text>

          <Animated.View style={ctaStyle}>
            <TouchableOpacity
              onPress={() => router.push('/contact')}
              className="bg-accent rounded-full px-16 py-5"
              style={{
                shadowColor: '#1a1410',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.3,
                shadowRadius: 17,
                elevation: 8,
              }}
            >
              <Text className="text-dark-brown font-marcellus text-lg">
                Learn more
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  )
}
