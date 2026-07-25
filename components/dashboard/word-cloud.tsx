'use client'

import type { WordCloudWord } from '@/lib/types'

const colorMap = {
  blue: 'text-primary hover:text-primary',
  green: 'text-success',
  purple: 'text-purple',
}

export function WordCloud({ words }: { words: WordCloudWord[] }) {
  if (words.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin temas suficientes todavía.</p>
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-4">
      {words.map((w) => (
        <button
          key={w.text}
          className={`font-semibold leading-none transition-transform hover:scale-110 ${colorMap[w.color]}`}
          style={{ fontSize: w.size, opacity: 0.55 + (w.size / 48) * 0.45 }}
        >
          {w.text}
        </button>
      ))}
    </div>
  )
}
