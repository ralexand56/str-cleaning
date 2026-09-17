import { defineAuth, secret } from '@aws-amplify/backend'

// Applies to every user type (Admins, Workers, customers) — they all share this one Cognito pool,
// so "Continue with Google" shows up for anyone on /sign-in, not just customers.
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          givenName: 'given_name',
          familyName: 'family_name',
          profilePicture: 'picture',
        },
      },
      // Redirect back to /sign-in (not '/') so the role-based redirect logic there
      // (Admins -> /admin, Workers -> /worker, else '/') also runs for the Google flow.
      callbackUrls: ['http://localhost:3000/sign-in'],
      logoutUrls: ['http://localhost:3000/sign-in'],
    },
  },
  userAttributes: {
    givenName: { required: true, mutable: true },
    familyName: { required: true, mutable: true },
    phoneNumber: { required: false, mutable: true },
    profilePicture: { mutable: true }, // populated from Google's `picture` claim
  },
  groups: ['Admins', 'Workers'],
})
