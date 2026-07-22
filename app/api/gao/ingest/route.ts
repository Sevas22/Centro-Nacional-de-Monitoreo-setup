import { NextResponse } from 'next/server'
import { ingestGaoSources } from '@/lib/gao/ingest'

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

  const results = await ingestGaoSources()
  return NextResponse.json({ ok: true, results })
}
