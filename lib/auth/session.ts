export const SESSION_COOKIE_NAME = 'cnm_session'
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60 // 8h

interface SessionPayload {
  sub: string
  email: string
  exp: number
}

export interface Session {
  userId: string
  email: string
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET no está configurado en las variables de entorno')
  return secret
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=')
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

/** Constant-time string comparison — avoids leaking match progress via early-exit timing. */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function signSession(userId: string, email: string): Promise<string> {
  const payload: SessionPayload = { sub: userId, email, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 }
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const key = await hmacKey(getSecret())
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  const signatureB64 = bytesToBase64Url(new Uint8Array(signature))
  return `${payloadB64}.${signatureB64}`
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null
  const [payloadB64, signatureB64] = token.split('.')
  if (!payloadB64 || !signatureB64) return null

  try {
    const key = await hmacKey(getSecret())
    const expectedSignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
    const expectedSignatureB64 = bytesToBase64Url(new Uint8Array(expectedSignature))
    if (!timingSafeEqualStr(expectedSignatureB64, signatureB64)) return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64))) as SessionPayload
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.exp !== 'number') return null
    if (Date.now() > payload.exp) return null

    return { userId: payload.sub, email: payload.email }
  } catch {
    return null
  }
}
