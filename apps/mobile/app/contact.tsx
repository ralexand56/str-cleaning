import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@str-cleaning/assets/contactSchema'
import { useRiseIn } from '@/hooks/useRiseIn'

const BORDER_NORMAL = 'rgba(68,54,42,0.3)'
const BORDER_ERROR  = '#dc2626'

export default function ContactScreen() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const headingStyle = useRiseIn(0)
  const bodyStyle    = useRiseIn(120)
  const formStyle    = useRiseIn(240)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormData) {
    setServerError(null)
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 bg-stone" contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <View className="px-6 pt-14 pb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="font-marcellus text-dark-brown opacity-60 text-base">← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Heading */}
        <View className="px-6 pt-6 pb-8">
          <Animated.Text style={headingStyle} className="font-marcellus text-dark-brown text-5xl leading-tight">
            Contact{'\n'}Us
          </Animated.Text>
          <Animated.Text style={bodyStyle} className="font-marcellus text-dark-brown opacity-70 text-base leading-relaxed mt-5 max-w-xs">
            Interested in working together? Fill out some info and we will be in touch shortly.
          </Animated.Text>
        </View>

        {submitted ? (
          <View className="px-6">
            <Text className="font-marcellus text-dark-brown text-xl opacity-80">
              Thanks! We'll be in touch soon.
            </Text>
          </View>
        ) : (
          <Animated.View style={formStyle} className="px-6 gap-y-5">
            {/* Name row */}
            <View>
              <Text className="font-marcellus text-dark-brown text-sm opacity-60 mb-2">Name</Text>
              <View className="flex-row gap-x-3">
                <View className="flex-1">
                  <Text className="font-marcellus text-dark-brown text-xs opacity-50 mb-1">First Name</Text>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        style={{ borderColor: errors.firstName ? BORDER_ERROR : BORDER_NORMAL }}
                        className="border rounded px-3 py-3 font-marcellus text-dark-brown text-sm bg-transparent"
                        placeholderTextColor="#44362a80"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text className="font-marcellus text-red-600 text-xs mt-1">{errors.firstName.message}</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-marcellus text-dark-brown text-xs opacity-50 mb-1">Last Name</Text>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        style={{ borderColor: errors.lastName ? BORDER_ERROR : BORDER_NORMAL }}
                        className="border rounded px-3 py-3 font-marcellus text-dark-brown text-sm bg-transparent"
                        placeholderTextColor="#44362a80"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text className="font-marcellus text-red-600 text-xs mt-1">{errors.lastName.message}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="font-marcellus text-dark-brown text-sm opacity-60 mb-1">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ borderColor: errors.email ? BORDER_ERROR : BORDER_NORMAL }}
                    className="border rounded px-3 py-3 font-marcellus text-dark-brown text-sm bg-transparent"
                    placeholderTextColor="#44362a80"
                  />
                )}
              />
              {errors.email && (
                <Text className="font-marcellus text-red-600 text-xs mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Message */}
            <View>
              <Text className="font-marcellus text-dark-brown text-sm opacity-60 mb-1">Message</Text>
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    style={{ minHeight: 120, borderColor: errors.message ? BORDER_ERROR : BORDER_NORMAL }}
                    className="border rounded px-3 py-3 font-marcellus text-dark-brown text-sm bg-transparent"
                    placeholderTextColor="#44362a80"
                  />
                )}
              />
              {errors.message && (
                <Text className="font-marcellus text-red-600 text-xs mt-1">{errors.message.message}</Text>
              )}
            </View>

            {serverError && (
              <Text className="font-marcellus text-red-600 text-sm">{serverError}</Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="self-start mt-2 bg-dark-brown rounded-full px-10 py-4"
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              <Text className="font-marcellus text-stone text-base">
                {isSubmitting ? 'Sending…' : 'Send'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Footer */}
        <View className="mt-16 px-6 pt-8 border-t border-dark-brown/15 gap-y-6">
          <Text className="font-marcellus text-dark-brown text-2xl">STR Cleaning Crew</Text>
          <View className="flex-row gap-x-10">
            <View>
              <Text className="font-marcellus text-dark-brown text-sm font-medium mb-1">Location</Text>
              <Text className="font-marcellus text-dark-brown text-sm opacity-70">Irvine, CA</Text>
            </View>
            <View>
              <Text className="font-marcellus text-dark-brown text-sm font-medium mb-1">Contact</Text>
              <Text className="font-marcellus text-dark-brown text-sm opacity-70">info@str-cleaningcrew.com</Text>
              <Text className="font-marcellus text-dark-brown text-sm opacity-70">(949) 549-9459</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
