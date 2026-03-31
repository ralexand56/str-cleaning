import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { images } from '@str-cleaning/assets'
import { useRiseIn } from '@/hooks/useRiseIn'

const { width } = Dimensions.get('window')

export default function AboutScreen() {
  const router = useRouter()
  const headingStyle  = useRiseIn(0)
  const bodyStyle     = useRiseIn(120)
  const buttonStyle   = useRiseIn(240)

  return (
    <ScrollView className="flex-1 bg-stone" contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Back */}
      <View className="px-6 pt-14 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="font-marcellus text-dark-brown opacity-60 text-base">← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Portrait photo */}
      <Image
        source={images.hero1}
        style={{ width, height: width * 1.2 }}
        resizeMode="cover"
      />

      {/* Copy */}
      <View className="px-8 pt-12 pb-6">
        <Animated.Text
          style={headingStyle}
          className="font-marcellus text-dark-brown text-5xl leading-tight mb-6"
        >
          Our{'\n'}company{'\n'}ethos
        </Animated.Text>

        <Animated.Text
          style={bodyStyle}
          className="font-marcellus text-dark-brown text-base leading-relaxed opacity-70 mb-12"
        >
          Founded on a legacy of impeccable standards, our cleaning services
          embody an unparalleled commitment to excellence. We cater to
          discerning clients who appreciate the art of a truly pristine
          environment.
        </Animated.Text>

        <Animated.View style={buttonStyle} className="self-start">
          <TouchableOpacity
            onPress={() => router.push('/contact')}
            className="bg-dark-brown rounded-full px-12 py-5"
          >
            <Text className="font-marcellus text-stone text-base">Learn more</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  )
}
