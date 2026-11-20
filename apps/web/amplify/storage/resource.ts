import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'str-cleaning-storage',
  access: (allow) => ({
    // Property photos — only the authenticated owner can manage their uploads
    'properties/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    // Photos attached to a booking request. Visitors (signed in or not) can upload but never
    // list or read them back; only Admins can view them, from the job detail page.
    'booking-photos/*': [
      allow.guest.to(['write']),
      allow.authenticated.to(['write']),
      allow.groups(['Admins']).to(['read', 'delete']),
    ],
    // Public cleaning portfolio images — anyone can read
    'portfolio/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
  }),
})
