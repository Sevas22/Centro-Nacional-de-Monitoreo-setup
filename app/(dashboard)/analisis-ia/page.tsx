'use client'

import { useState } from 'react'
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, Lightbulb, AlertOctagon, RefreshCw, Network, Layers } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { useToast } from '@/components/toast-provider'
import { SentimentDonut } from '@/components/dashboard/charts'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { AIIntelligencePanel } from '@/components/dashboard/ai-intelligence-panel'

const insights = [
  {
    icon: AlertOctagon,
    color: 'var(--accent-red)',
    title: 'Escalamiento de conflictividad social en el suroccidente',
    body: 'El modelo detecta un aumento del 340% en menciones relacionadas con bloqueos viales en Cauca y Nariño en las últimas 6 horas. Alta probabilidad de propagación regional.',
    confidence: 94,
  },
  {
    icon: TrendingUp,
    color: 'var(--accent-green)',
    title: 'Tendencia positiva sostenida en inversión tecnológica',
    body: 'Se identifica un patrón favorable de cobertura sobre inversión extranjera en el sector tech, concentrado en Medellín y Bogotá. Sentimiento predominantemente positivo.',
    confidence: 88,
  },
  {
    icon: TrendingDown,
    color: 'var(--accent-orange)',
    title: 'Riesgo de afectación logística por paro anunciado',
    body: 'El anuncio de paro de transportadores muestra crecimiento acelerado. El modelo proyecta impacto en cadenas de abastecimiento si no hay acuerdo en los próximos días.',
    confidence: 79,
  },
  {
    icon: Lightbulb,
    color: 'var(--accent-blue)',
    title: 'Correlación clima-emergencias en región Caribe',
    body: 'El análisis correlaciona el incremento de alertas del IDEAM con reportes de inundaciones, sugiriendo la activación preventiva de protocolos en municipios ribereños.',
    confidence: 91,
  },
]

const clusters = [
  { name: 'Conflictividad social suroccidente', articles: 34, keywords: ['bloqueos', 'Cauca', 'CRIC', 'Panamericana'] },
  { name: 'Crisis fiscal y presupuesto', articles: 21, keywords: ['recorte', 'hacienda', 'presupuesto 2027'] },
  { name: 'Proceso de paz con el ELN', articles: 18, keywords: ['ELN', 'Catatumbo', 'cese al fuego'] },
  { name: 'Inversión tecnológica Medellín', articles: 15, keywords: ['Ruta N', 'startups', 'inversión'] },
  { name: 'Emergencias climáticas', articles: 12, keywords: ['IDEAM', 'inundaciones', 'incendio'] },
  { name: 'Paro de transportadores', articles: 11, keywords: ['ACPM', 'peajes', 'paro nacional'] },
]

const entityNetwork = [
  { from: 'Gustavo Petro', to: 'Reforma pensional', strength: 'fuerte' as const },
  { from: 'ELN', to: 'Catatumbo', strength: 'fuerte' as const },
  { from: 'Ministerio de Hacienda', to: 'Banco de la República', strength: 'media' as const },
  { from: 'CRIC', to: 'Vía Panamericana', strength: 'fuerte' as const },
  { from: 'Ecopetrol', to: 'Crisis fiscal', strength: 'media' as const },
  { from: 'Metro de Medellín', to: 'Ruta N', strength: 'débil' as const },
]

const strengthWidth: Record<string, string> = { fuerte: '85%', media: '55%', débil: '30%' }

export default function AnalisisIAPage() {
  const [regenerating, setRegenerating] = useState(false)
  const { toast } = useToast()

  function regenerate() {
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      toast({ variant: 'success', title: 'Análisis regenerado', description: 'El modelo procesó los datos más recientes.' })
    }, 1800)
  }

  return (
    <PageTransition>
      <PageHeader
        title="Análisis con Inteligencia Artificial"
        subtitle="Insights automáticos, correlaciones y proyecciones generadas por el modelo"
        badge={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-3.5" />
              IA activa
            </span>
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              <RefreshCw className={`size-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerando...' : 'Regenerar análisis'}
            </button>
          </div>
        }
      />

      <SectionCard
        title="Resumen ejecutivo generado por IA"
        icon={<BrainCircuit className="size-4 text-[var(--accent-purple)]" />}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          En las últimas 24 horas se procesaron <span className="font-semibold text-foreground">2.847 noticias</span> de
          10 fuentes nacionales. El panorama informativo está dominado por temas de{' '}
          <span className="font-semibold text-foreground">orden público</span> y{' '}
          <span className="font-semibold text-foreground">economía</span>, con un sentimiento negativo ligeramente
          predominante (41%). El modelo identifica <span className="font-semibold text-[var(--accent-red)]">3 focos
          críticos</span> que requieren monitoreo prioritario y proyecta una posible intensificación de la
          conflictividad social en el suroccidente del país.
        </p>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((ins) => {
          const Icon = ins.icon
          return (
            <div key={ins.title} className="glass flex flex-col rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${ins.color}1f`, color: ins.color }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{ins.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ins.body}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Confianza del modelo</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full" style={{ width: `${ins.confidence}%`, backgroundColor: ins.color }} />
                </div>
                <span className="font-mono text-[11px] font-semibold" style={{ color: ins.color }}>
                  {ins.confidence}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Sentimiento agregado" icon={<TrendingUp className="size-4 text-[var(--accent-green)]" />}>
          <SentimentDonut />
        </SectionCard>
        <SectionCard title="Temas detectados" icon={<Sparkles className="size-4 text-[var(--accent-cyan)]" />}>
          <WordCloud />
        </SectionCard>
      </div>

      <div className="mt-6">
        <AIIntelligencePanel />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Clusters temáticos" icon={<Layers className="size-4 text-[var(--accent-purple)]" />}>
          <div className="flex flex-col gap-2.5">
            {clusters.map((c) => (
              <div key={c.name} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <span className="shrink-0 rounded-full bg-purple/15 px-2 py-0.5 text-[11px] font-semibold text-purple">
                    {c.articles} noticias
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.keywords.map((k) => (
                    <span key={k} className="rounded-md bg-accent/60 px-1.5 py-0.5 text-[10px] text-foreground/70">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Red de entidades" icon={<Network className="size-4 text-[var(--accent-cyan)]" />}>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Conexiones detectadas automáticamente entre las entidades más mencionadas en las últimas 24 horas.
          </p>
          <div className="flex flex-col gap-3">
            {entityNetwork.map((e) => (
              <div key={`${e.from}-${e.to}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {e.from} <span className="text-muted-foreground">→</span> {e.to}
                  </span>
                  <span className="capitalize text-muted-foreground">{e.strength}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-cyan" style={{ width: strengthWidth[e.strength] }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageTransition>
  )
}
