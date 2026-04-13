'use server'

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const TABLE_NAME = process.env.BOOKING_TABLE_NAME ?? 'BookingRequests'

export type BookingRecord = {
  id:             string
  serviceType:    string
  bedrooms:       number
  bathrooms:      number
  extras:         string
  date:           string
  timeWindow:     string
  frequency:      string
  address:        string
  firstName:      string
  lastName:       string
  email:          string
  phone:          string
  notes:          string
  estimatedTotal: number
  createdAt:      string
}

export async function getBookings(): Promise<BookingRecord[]> {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }))

  const items = (result.Items ?? []).map((item) => ({
    id:             item.id?.S             ?? '',
    serviceType:    item.serviceType?.S    ?? '',
    bedrooms:       Number(item.bedrooms?.N  ?? 0),
    bathrooms:      Number(item.bathrooms?.N ?? 0),
    extras:         item.extras?.S         ?? '',
    date:           item.date?.S           ?? '',
    timeWindow:     item.timeWindow?.S     ?? '',
    frequency:      item.frequency?.S      ?? '',
    address:        item.address?.S        ?? '',
    firstName:      item.firstName?.S      ?? '',
    lastName:       item.lastName?.S       ?? '',
    email:          item.email?.S          ?? '',
    phone:          item.phone?.S          ?? '',
    notes:          item.notes?.S          ?? '',
    estimatedTotal: Number(item.estimatedTotal?.N ?? 0),
    createdAt:      item.createdAt?.S      ?? '',
  }))

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
