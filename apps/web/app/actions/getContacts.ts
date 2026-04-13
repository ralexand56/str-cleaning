'use server'

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const TABLE_NAME = process.env.CONTACT_TABLE_NAME ?? 'ContactSubmissions'

export type ContactRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  message: string
  createdAt: string
}

export async function getContacts(): Promise<ContactRecord[]> {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }))

  const items = (result.Items ?? []).map((item) => ({
    id:        item.id?.S        ?? '',
    firstName: item.firstName?.S ?? '',
    lastName:  item.lastName?.S  ?? '',
    email:     item.email?.S     ?? '',
    message:   item.message?.S   ?? '',
    createdAt: item.createdAt?.S ?? '',
  }))

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
