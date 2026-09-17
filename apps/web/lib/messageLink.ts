import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.MESSAGE_LINK_SECRET ?? 'dev-only-insecure-secret'
const DEFAULT_TTL_HOURS = 168 // 7 days

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function signMessageToken(jobId: string, email: string, ttlHours = DEFAULT_TTL_HOURS): string {
  const exp = Date.now() + ttlHours * 60 * 60 * 1000
  const payload = `${jobId}|${email}|${exp}`
  const sig = sign(payload)
  return Buffer.from(`${payload}|${sig}`).toString('base64url')
}

export function verifyMessageToken(token: string): { jobId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [jobId, email, expStr, sig] = decoded.split('|')
    if (!jobId || !email || !expStr || !sig) return null

    const payload = `${jobId}|${email}|${expStr}`
    const expectedSig = sign(payload)
    const a = Buffer.from(sig)
    const b = Buffer.from(expectedSig)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    if (Date.now() > Number(expStr)) return null

    return { jobId, email }
  } catch {
    return null
  }
}
