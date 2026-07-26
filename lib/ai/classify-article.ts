export interface ArticleToClassify {
  id: string
  title: string
  summary: string
}

export interface ArticleClassification {
  id: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  importance: 'critical' | 'high' | 'normal'
  aiSummary: string
}

/**
 * Clasifica artículos reales (título+resumen ya ingeridos por RSS/scraping) con Groq — el modelo
 * solo clasifica/resume lo que ya existe, nunca se le pide que invente hechos. Se manda el lote
 * completo en una sola llamada (barato y rápido) en vez de una llamada por artículo. Mismo
 * proveedor que lib/ai/briefing.ts, mientras no haya presupuesto para la API de Anthropic.
 */
export async function classifyArticles(articles: ArticleToClassify[]): Promise<ArticleClassification[]> {
  if (articles.length === 0) return []

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY no está configurado en las variables de entorno')

  const inputList = articles
    .map((a, i) => `${i}. [id=${a.id}] Título: ${a.title}\nResumen: ${a.summary}`)
    .join('\n\n')

  const prompt = `Clasifica cada una de estas ${articles.length} noticias reales (ya publicadas por medios colombianos). Para cada una, responde con:
- "riskLevel": "low", "medium", "high" o "critical" — nivel de riesgo para seguridad/orden público que representa lo que reporta la noticia (violencia, delincuencia, conflicto armado, desastres, amenazas = high/critical; tensión política, corrupción, protestas = medium; noticias de deportes, cultura, economía cotidiana, entretenimiento sin riesgo = low). Evalúa el contenido real, no el tono emocional.
- "importance": "critical", "high" o "normal" — qué tan relevante es para monitoreo de seguridad/orden público/coyuntura nacional (critical solo para eventos graves de seguridad, desastres o crisis; normal para la mayoría).
- "aiSummary": una frase (máx 20 palabras) que resuma la noticia, basada solo en el título y resumen dados — no agregues datos que no estén ahí.

NOTICIAS:
${inputList}

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, con esta forma exacta:
[{"id": "...", "riskLevel": "...", "importance": "...", "aiSummary": "..."}, ...]`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API respondió ${res.status}: ${errText}`)
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  const text = data.choices[0]?.message.content ?? ''

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []
    const parsed = JSON.parse(jsonMatch[0]) as ArticleClassification[]
    return parsed.filter(
      (c) =>
        typeof c.id === 'string' &&
        ['low', 'medium', 'high', 'critical'].includes(c.riskLevel) &&
        ['critical', 'high', 'normal'].includes(c.importance) &&
        typeof c.aiSummary === 'string',
    )
  } catch {
    // Si el modelo devuelve algo no parseable, se descarta la clasificación de este lote en vez
    // de fallar toda la ingesta — los artículos igual se guardan, solo sin estos campos.
    return []
  }
}
