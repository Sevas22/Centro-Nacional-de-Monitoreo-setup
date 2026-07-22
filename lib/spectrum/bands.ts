export type BandId = 'hf' | 'vhf' | 'uhf' | 'shf'

export interface FrequencyBand {
  id: BandId
  label: string
  rangeLabel: string
  /** Frecuencia representativa en GHz, usada por el modelo de atenuación por lluvia (solo aplica a SHF). */
  representativeGhz?: number
  description: string
}

export const frequencyBands: FrequencyBand[] = [
  {
    id: 'hf',
    label: 'HF',
    rangeLabel: '3–30 MHz',
    description: 'Radios de largo alcance. Depende de la ionósfera y actividad solar, no del clima en superficie.',
  },
  {
    id: 'vhf',
    label: 'VHF',
    rangeLabel: '30–300 MHz',
    description: 'Radios portátiles/tácticos de corto-medio alcance. Sensible a la refractividad atmosférica.',
  },
  {
    id: 'uhf',
    label: 'UHF',
    rangeLabel: '300 MHz–3 GHz',
    description: 'Radios de dos vías, telefonía celular. Sensible a la refractividad atmosférica.',
  },
  {
    id: 'shf',
    label: 'SHF / Microondas',
    rangeLabel: '3–30 GHz',
    representativeGhz: 12,
    description: 'Enlaces de microondas. Sensible a atenuación por lluvia.',
  },
]
