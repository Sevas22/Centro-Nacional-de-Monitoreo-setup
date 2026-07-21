import { NextResponse } from 'next/server'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, signSession } from '@/lib/auth/session'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { email, password, name } = body
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  let user: { id: string; email: string }
  try {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: typeof name === 'string' && name.trim() ? name.trim() : null,
      },
      select: { id: true, email: true },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Ese correo ya está registrado' }, { status: 409 })
    }
    throw err
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
