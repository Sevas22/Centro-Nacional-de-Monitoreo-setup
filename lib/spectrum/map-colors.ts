export interface DeptClimate {
  tempC: number
  humidityPct: number
  precipitationMm: number
  stability: 'baja' | 'media' | 'alta'
  attenuationDbKm: number
}

export type MapLayer = 'stability' | 'precipitation' | 'humidity' | 'temperature' | 'attenuation'

export const stabilityColor = { alta: '#10b981', media: '#f59e0b', baja: '#ef4444' } as const
export const stabilityLabel = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t])
}

function scaleColor(value: number, min: number, max: number, colors: string[]): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const segment = t * (colors.length - 1)
  const idx = Math.min(colors.length - 2, Math.floor(segment))
  const localT = segment - idx
  return lerpColor(colors[idx], colors[idx + 1], localT)
}

export const mapLayers: { id: MapLayer; label: string }[] = [
  { id: 'stability', label: 'Estabilidad VHF/UHF' },
  { id: 'precipitation', label: 'Precipitación' },
  { id: 'humidity', label: 'Humedad' },
  { id: 'temperature', label: 'Temperatura' },
  { id: 'attenuation', label: 'Atenuación SHF' },
]

export function colorFor(layer: MapLayer, c: DeptClimate): string {
  switch (layer) {
    case 'stability':
      return stabilityColor[c.stability]
    case 'precipitation':
      return scaleColor(c.precipitationMm, 0, 15, ['#1e293b', '#0ea5e9', '#4338ca'])
    case 'humidity':
      return scaleColor(c.humidityPct, 30, 100, ['#b45309', '#0d9488', '#0369a1'])
    case 'temperature':
      return scaleColor(c.tempC, 5, 35, ['#1d4ed8', '#f59e0b', '#dc2626'])
    case 'attenuation':
      return scaleColor(c.attenuationDbKm, 0, 3, ['#1e293b', '#a855f7', '#dc2626'])
  }
}

export function legendFor(layer: MapLayer): { label: string; color: string }[] {
  switch (layer) {
    case 'stability':
      return [
        { label: 'Alta', color: stabilityColor.alta },
        { label: 'Media', color: stabilityColor.media },
        { label: 'Baja', color: stabilityColor.baja },
      ]
    case 'precipitation':
      return [
        { label: '0 mm', color: '#1e293b' },
        { label: '~7 mm', color: '#0ea5e9' },
        { label: '15+ mm', color: '#4338ca' },
      ]
    case 'humidity':
      return [
        { label: '30%', color: '#b45309' },
        { label: '65%', color: '#0d9488' },
        { label: '100%', color: '#0369a1' },
      ]
    case 'temperature':
      return [
        { label: '5°C', color: '#1d4ed8' },
        { label: '20°C', color: '#f59e0b' },
        { label: '35°C', color: '#dc2626' },
      ]
    case 'attenuation':
      return [
        { label: '0 dB/km', color: '#1e293b' },
        { label: '1.5 dB/km', color: '#a855f7' },
        { label: '3+ dB/km', color: '#dc2626' },
      ]
  }
}

export function tooltipValue(layer: MapLayer, c: DeptClimate): string {
  switch (layer) {
    case 'stability':
      return stabilityLabel[c.stability]
    case 'precipitation':
      return `${c.precipitationMm.toFixed(1)} mm`
    case 'humidity':
      return `${c.humidityPct.toFixed(0)}%`
    case 'temperature':
      return `${c.tempC.toFixed(1)}°C`
    case 'attenuation':
      return `${c.attenuationDbKm.toFixed(2)} dB/km`
  }
}
