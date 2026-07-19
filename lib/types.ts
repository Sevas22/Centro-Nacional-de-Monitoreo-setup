export type Importance = 'critical' | 'high' | 'normal'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type ActivityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  department: string
  municipality: string
  time: string
  category: string
  importance: Importance
  sentiment: Sentiment
  aiSummary: string
  tags: string[]
  entities?: {
    persons: string[]
    organizations: string[]
    companies: string[]
    locations: string[]
  }
  fullText?: string
  sourceUrl?: string
  sentimentScore?: number
  riskScore?: number
  viewCount?: number
  isBreaking?: boolean
}

export interface Municipality {
  id: string
  name: string
  departmentId: string
  newsCount: number
  activityLevel: ActivityLevel
  coordinates?: { lat: number; lng: number }
}

export interface DepartmentData {
  id: string
  name: string
  newsCount: number
  level: ActivityLevel
  municipalities?: Municipality[]
}

export interface DashboardKPIs {
  totalNewsToday: number
  breakingNews: number
  activeDepartments: number
  activeMunicipalities: number
  trendingTopics: number
  positivePercent: number
  negativePercent: number
  neutralPercent: number
  criticalAlerts: number
  totalSources: number
  avgArticlesPerHour: number
}

export interface WeeklyTrendPoint {
  day: string
  count: number
}

export interface SentimentTimePoint {
  time: string
  positive: number
  negative: number
  neutral: number
}

export type EntityType = 'person' | 'org' | 'company' | 'place'

export interface Entity {
  id: string
  name: string
  type: EntityType
  count: number
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface AlertItem {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  time: string
  active: boolean
}

export interface NewsSource {
  id: string
  name: string
  type: string
  region: string
  newsToday: number
  uptime: number
  latency: number
  lastFetchAt?: string
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

export interface SentimentSlice {
  name: string
  value: number
  color: string
}

export interface HeatmapCell {
  dept: string
  hour: number
  value: number
}
