import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { departmentNames } from '@/lib/spectrum/department-capitals'
import { departmentCoordinates } from '@/lib/spectrum/department-coordinates'
import { fetchWeatherBatch, type CurrentWeather } from '@/lib/spectrum/weather'
import { computeNationalSnapshot, type NationalSnapshot } from '@/lib/spectrum/national'

export type BriefingKind = 'diario' | 'ejecutivo'

interface GaoContextItem {
  source: string
  title: string
  publishedAt: Date
  mentionedGroups: string[]
}

interface BriefingContext {
  national: NationalSnapshot
  gaoItems: GaoContextItem[]
  historicalSnapshotCount: number
}

/** Reúne solo datos ya reales (clima real vía modelo ITU-R + RSS ya ingerido) — nada se calcula para la ocasión. */
async function gatherContext(): Promise<BriefingContext> {
  const coords = departmentNames.map((name) => departmentCoordinates[name])
  const weatherList = await fetchWeatherBatch(coords)
  const weatherByDept: Record<string, CurrentWeather | null> = {}
  departmentNames.forEach((name, i) => (weatherByDept[name] = weatherList[i]))
  const national = computeNationalSnapshot(weatherByDept)

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [gaoItems, historicalSnapshotCount] = await Promise.all([
    prisma.gaoSourceItem.findMany({
      where: { publishedAt: { gte: since } },
      orderBy: { publishedAt: 'desc' },
      take: 40,
      select: { source: true, title: true, publishedAt: true, mentionedGroups: true },
    }),
    prisma.spectrumSnapshot.count(),
  ])

  return { national, gaoItems, historicalSnapshotCount }
}

function buildPrompt(context: BriefingContext, kind: BriefingKind): string {
  const { national, gaoItems } = context
  const label = kind === 'diario' ? 'boletín diario' : 'briefing ejecutivo'

  const eventsText =
    national.events
      .slice(0, 15)
      .map((e) => `- [${e.severity.toUpperCase()}] ${e.department} (${e.band}): ${e.description}`)
      .join('\n') || 'Sin eventos activos en este momento.'

  const gaoText =
    gaoItems
      .map(
        (i) =>
          `- (${i.source}, ${i.publishedAt.toISOString().slice(0, 10)}) ${i.title}${
            i.mentionedGroups.length ? ` [grupos mencionados: ${i.mentionedGroups.join(', ')}]` : ''
          }`,
      )
      .join('\n') || 'Sin ítems de fuentes abiertas en las últimas 24 horas.'

  return `Eres un analista redactando un ${label} de inteligencia. Usa EXCLUSIVAMENTE los datos numéricos y hechos que te doy abajo — no inventes cifras, nombres, ubicaciones ni eventos que no estén aquí. Si un dato relevante no está disponible, dilo explícitamente en vez de rellenarlo.

DATOS — PANORAMA NACIONAL DE ESPECTRO (derivado de clima real vía modelo de propagación ITU-R, ${national.totalDepartments} departamentos con datos en este momento):
- Departamentos con estabilidad VHF/UHF baja: ${national.lowStabilityCount}
- Zonas con precipitación activa: ${national.activePrecipitationCount}
- Refractividad atmosférica promedio: ${national.avgRefractivity.toFixed(0)} N-unidades
- Temperatura promedio: ${national.avgTemperatureC.toFixed(1)}°C — Humedad promedio: ${national.avgHumidityPct.toFixed(0)}%
- Departamentos con atenuación SHF (lluvia) alta: ${national.highAttenuationCount}

EVENTOS DE ESPECTRO DETECTADOS POR EL MODELO (más severos primero):
${eventsText}

FUENTES ABIERTAS — ítems RSS de organizaciones independientes de monitoreo de conflicto armado (INDEPAZ/PARES, últimas 24h; son terceros que reportan/analizan, nunca contenido publicado por un actor armado):
${gaoText}

Redacta el ${label} en markdown con exactamente estas secciones: "## Panorama nacional", "## Espectro RF — alertas", "## Fuentes abiertas", "## Recomendaciones". Sé conciso y profesional, en español. Las recomendaciones deben derivarse únicamente de los datos anteriores.`
}

export async function generateBriefing(kind: BriefingKind) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no está configurado en las variables de entorno')

  const context = await gatherContext()
  const prompt = buildPrompt(context, kind)

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return prisma.briefing.create({
    data: {
      kind,
      content,
      sourceSummary: {
        departmentsWithData: context.national.totalDepartments,
        eventCount: context.national.events.length,
        gaoItemCount: context.gaoItems.length,
        historicalSnapshotCount: context.historicalSnapshotCount,
      },
    },
  })
}
