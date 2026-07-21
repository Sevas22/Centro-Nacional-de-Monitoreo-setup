import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(token)

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!login|register|api/login|api/register|api/logout|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|json|ico|webp)$).*)',
  ],
}
