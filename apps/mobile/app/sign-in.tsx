import { View } from 'react-native'
import { Authenticator } from '@aws-amplify/ui-react-native'
import { useRouter } from 'expo-router'
import { useAuthenticator } from '@aws-amplify/ui-react-native'
import { useEffect } from 'react'

function SignInContent() {
  const { user } = useAuthenticator()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/')
  }, [user, router])

  return (
    <View className="flex-1 bg-bg-dark items-center justify-center px-4">
      <Authenticator />
    </View>
  )
}

export default function SignInScreen() {
  return (
    <Authenticator.Provider>
      <SignInContent />
    </Authenticator.Provider>
  )
}
