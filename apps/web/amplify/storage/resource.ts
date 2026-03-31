import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'str-cleaning-storage',
  access: (allow) => ({
    // Property photos — only the authenticated owner can manage their uploads
    'properties/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    // Public cleaning portfolio images — anyone can read
    'portfolio/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
  }),
})
