import { NextResponse } from 'next/server'
import { ingestNewsSources } from '@/lib/news/ingest'

// ~20 fuentes en paralelo + clasificación con IA pueden tardar más de los 10s por defecto
// de Vercel Hobby — 60s es el máximo permitido en ese plan sin pasar a Pro.
export const maxDuration = 60

// Vercel Cron Jobs invoca esta ruta con GET y agrega automáticamente
// `Authorization: Bearer $CRON_SECRET` cuando la variable se llama así.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET no está configurado' }, { status: 500 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const results = await ingestNewsSources()
  return NextResponse.json({ ok: true, results })
}
