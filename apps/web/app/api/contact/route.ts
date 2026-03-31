import { NextResponse } from 'next/server'
import { contactSchema } from '@str-cleaning/assets/contactSchema'
import { submitContact } from '@/app/actions/contact'

export async function POST(req: Request) {
  const body = await req.json()

  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    await submitContact(result.data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
