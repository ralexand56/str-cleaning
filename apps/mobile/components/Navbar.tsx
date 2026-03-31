import { useEffect } from 'react'
import { View, Image, Text, TouchableOpacity, ScrollView } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useRouter, usePathname } from 'expo-router'
import { useAuthenticator } from '@aws-amplify/ui-react-native'
import { images } from '@str-cleaning/assets'

const NAV_LINKS = [
  { label: 'Home',        route: '/' },
  { label: 'Services',    route: '/services' },
  { label: 'Business',    route: '/business' },
  { label: 'Residential', route: '/residential' },
  { label: 'Portfolio',   route: '/portfolio' },
  { label: 'Contact',     route: '/contact' },
  { label: 'About',       route: '/about' },
] as const

function NavUnderline() {
  const scaleX = useSharedValue(0)

  useEffect(() => {
    scaleX.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.ease) })
  }, [])

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: scaleX.value }],
    }
  })

  return (
    <Animated.View
      style={[style, { height: 1, backgroundColor: '#f4f0ea', marginTop: 2, transformOrigin: 'left' }]}
    />
  )
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuthenticator()

  return (
    <View className="px-6 pt-12 pb-4">
      {/* Logo */}
      <Image
        source={images.logo}
        className="w-[58px] h-[58px]"
        style={{ resizeMode: 'contain', opacity: 0.88 }}
        accessibilityLabel="ST Cleaning Crew"
      />

      {/* Nav links */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerClassName="flex-row gap-x-5 items-center"
      >
        {NAV_LINKS.map(({ label, route }) => {
          const active = route === '/' ? pathname === '/' : pathname.startsWith(route)
          return (
            <TouchableOpacity key={label} onPress={() => router.push(route)}>
              <Text
                className="text-stone font-marcellus text-base"
                style={{ opacity: active ? 1 : 0.88 }}
              >
                {label}
              </Text>
              {active && <NavUnderline />}
            </TouchableOpacity>
          )
        })}

        {user ? (
          <TouchableOpacity
            onPress={signOut}
            className="ml-2 px-6 py-3 rounded-full bg-accent"
          >
            <Text className="text-dark-brown font-marcellus text-base">
              Sign Out
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            className="ml-2 px-6 py-3 rounded-full bg-accent"
          >
            <Text className="text-dark-brown font-marcellus text-base">
              Book Now!
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}
