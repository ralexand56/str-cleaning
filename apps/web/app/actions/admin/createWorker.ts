'use server'

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'
import config from '@/amplify_outputs.json'

const region = process.env.AWS_REGION ?? 'us-east-1'
const cognito = new CognitoIdentityProviderClient({ region })

type AmplifyAuthOutputs = { auth?: { user_pool_id?: string } }
const USER_POOL_ID = (config as AmplifyAuthOutputs).auth?.user_pool_id ?? ''

/**
 * Creates a Cognito user in the Workers group plus the matching Worker record.
 * No self-serve worker signup in v1 — an admin provisions accounts directly.
 * Requires the deploying environment's IAM role to include cognito-idp:AdminCreateUser
 * and cognito-idp:AdminAddUserToGroup on this user pool.
 */
export async function createWorker(input: {
  firstName: string
  lastName: string
  email: string
  phone?: string
}): Promise<string> {
  await requireGroup('Admins')
  if (!USER_POOL_ID) throw new Error('Cognito user pool not configured')

  const created = await cognito.send(new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: input.email,
    UserAttributes: [
      { Name: 'email', Value: input.email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'given_name', Value: input.firstName },
      { Name: 'family_name', Value: input.lastName },
      ...(input.phone ? [{ Name: 'phone_number', Value: input.phone }] : []),
    ],
  }))

  const sub = created.User?.Attributes?.find((a) => a.Name === 'sub')?.Value
  if (!sub) throw new Error('Cognito did not return a user id')

  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: input.email,
    GroupName: 'Workers',
  }))

  const worker = await serverDataClient.models.Worker.create({
    cognitoSub: sub,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    active: true,
  })

  return worker.data?.id ?? ''
}
