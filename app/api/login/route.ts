import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, signSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { email, password } = body
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  // Always run the (slow) scrypt comparison, even for unknown emails, so response
  // timing doesn't leak whether an account exists for a given address.
  const DUMMY_HASH = '0'.repeat(32) + ':' + '0'.repeat(128)
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)

  if (!user || !passwordMatches) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
  }

  const token = await signSession(user.id, user.email)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return response
}
