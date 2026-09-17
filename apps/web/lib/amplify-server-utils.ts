import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import config from '@/amplify_outputs.json'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: config as Parameters<typeof createServerRunner>[0]['config'],
})
