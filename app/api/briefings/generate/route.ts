import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'
import { generateBriefing } from '@/lib/ai/briefing'

// Cron diario (Vercel envía Authorization: Bearer $CRON_SECRET automáticamente).
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET no está configurado' }, { status: 500 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const briefing = await generateBriefing('diario')
    return NextResponse.json({ ok: true, id: briefing.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error desconocido' }, { status: 500 })
  }
}

// Generación bajo demanda desde la UI. Esta ruta está excluida del middleware de sesión
// (mismo motivo que api/gao y el GET de arriba: no debe interceptar al cron), así que
// verificamos la cookie de sesión manualmente aquí.
export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1]
  const session = await verifySession(token)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const briefing = await generateBriefing('ejecutivo')
    return NextResponse.json({ ok: true, id: briefing.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error desconocido' }, { status: 500 })
  }
}
