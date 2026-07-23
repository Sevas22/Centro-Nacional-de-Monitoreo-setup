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

// api/gao, api/spectrum y api/briefings implementan su propia autorización (CRON_SECRET
// para los cron jobs, o verificación de sesión manual dentro del handler) — nunca deben
// pasar por este middleware de cookie de sesión, o Vercel Cron recibiría un redirect a
// /login en vez de ejecutar el handler real.
export const config = {
  matcher: [
    '/((?!login|register|api/login|api/register|api/logout|api/gao|api/spectrum|api/briefings|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|json|ico|webp)$).*)',
  ],
}
