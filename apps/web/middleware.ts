import { NextRequest, NextResponse } from 'next/server'
import { getGroupsFromMiddleware, isAuthenticatedFromMiddleware } from '@/lib/authGroups'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  let deny = false
  if (path.startsWith('/account')) {
    deny = !(await isAuthenticatedFromMiddleware(request, response))
  } else {
    const groups = await getGroupsFromMiddleware(request, response)
    const requiresAdmin = path.startsWith('/admin') && !groups.includes('Admins')
    const requiresWorker =
      path.startsWith('/worker') && !groups.includes('Workers') && !groups.includes('Admins')
    deny = requiresAdmin || requiresWorker
  }

  if (deny) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('next', path)
    return NextResponse.redirect(signInUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/worker/:path*', '/account/:path*'],
}
