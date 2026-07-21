import { prisma } from '../lib/db'
import { departments, newsArticles, newsSources, alerts, entities as entityGroups } from '../data/mock'

async function main() {
  console.log('Seeding departments + municipalities...')
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: { name: dept.name, newsCount: dept.newsCount, level: dept.level },
      create: { id: dept.id, name: dept.name, newsCount: dept.newsCount, level: dept.level },
    })

    for (const muni of dept.municipalities ?? []) {
      await prisma.municipality.upsert({
        where: { id: muni.id },
        update: {
          name: muni.name,
          departmentId: muni.departmentId,
          newsCount: muni.newsCount,
          activityLevel: muni.activityLevel,
        },
        create: {
          id: muni.id,
          name: muni.name,
          departmentId: muni.departmentId,
          newsCount: muni.newsCount,
          activityLevel: muni.activityLevel,
        },
      })
    }
  }

  console.log('Seeding news articles...')
  for (const article of newsArticles) {
    const data = {
      title: article.title,
      summary: article.summary,
      fullText: article.fullText ?? null,
      source: article.source,
      sourceUrl: article.sourceUrl ?? null,
      department: article.department,
      municipality: article.municipality,
      time: article.time,
      category: article.category,
      importance: article.importance,
      sentiment: article.sentiment,
      sentimentScore: article.sentimentScore ?? null,
      riskScore: article.riskScore ?? null,
      viewCount: article.viewCount ?? null,
      isBreaking: article.isBreaking ?? false,
      aiSummary: article.aiSummary,
      tags: article.tags,
      entities: article.entities ?? undefined,
    }
    await prisma.newsArticle.upsert({
      where: { id: article.id },
      update: data,
      create: { id: article.id, ...data },
    })
  }

  console.log('Seeding news sources...')
  for (const source of newsSources) {
    const data = {
      name: source.name,
      type: source.type,
      region: source.region,
      newsToday: source.newsToday,
      uptime: source.uptime,
      latency: source.latency,
      lastFetchAt: source.lastFetchAt ?? null,
    }
    await prisma.newsSource.upsert({
      where: { id: source.id },
      update: data,
      create: { id: source.id, ...data },
    })
  }

  console.log('Seeding alerts...')
  for (const alert of alerts) {
    const data = {
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      time: alert.time,
      active: alert.active,
    }
    await prisma.alertItem.upsert({
      where: { id: alert.id },
      update: data,
      create: { id: alert.id, ...data },
    })
  }

  console.log('Seeding entities...')
  for (const list of Object.values(entityGroups)) {
    for (const entity of list) {
      const data = { name: entity.name, type: entity.type, count: entity.count }
      await prisma.entity.upsert({
        where: { id: entity.id },
        update: data,
        create: { id: entity.id, ...data },
      })
    }
  }

  console.log('Seed completo.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
