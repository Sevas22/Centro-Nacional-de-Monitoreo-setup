export type Importance = 'critical' | 'high' | 'normal'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ActivityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  department: string
  municipality?: string
  publishedAt: string
  category: string
  importance: Importance
  riskLevel: RiskLevel
  aiSummary: string
  tags: string[]
  fullText?: string
}

export interface WordCloudWord {
  text: string
  size: number
  color: 'blue' | 'green' | 'purple'
}

export interface HourlyPoint {
  hour: string
  count: number
}

export interface CategoryPoint {
  category: string
  count: number
}

export interface RiskLevelSlice {
  name: string
  value: number
  color: string
}

export interface HeatmapCell {
  dept: string
  hour: number
  value: number
}
