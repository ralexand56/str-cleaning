import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  useFonts,
  Marcellus_400Regular,
} from '@expo-google-fonts/marcellus'
import * as SplashScreen from 'expo-splash-screen'
import { Authenticator } from '@aws-amplify/ui-react-native'
import { configureAmplify } from '@/lib/amplify'

SplashScreen.preventAutoHideAsync()

configureAmplify()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Marcellus_400Regular })

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  return (
    <Authenticator.Provider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="about" />
      </Stack>
    </Authenticator.Provider>
  )
}
