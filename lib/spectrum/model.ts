import type { BandId } from './bands'
import type { CurrentWeather } from './weather'

export type StabilityLevel = 'baja' | 'media' | 'alta' | 'no_aplica'

export interface BandAssessment {
  band: BandId
  stability: StabilityLevel
  explanation: string
  metric?: { label: string; value: string }
}

const CELSIUS_TO_KELVIN = 273.15

/** Presión de vapor de agua saturado (fórmula de Magnus), en hPa. T en °C. */
function saturationVaporPressure(tempC: number): number {
  return 6.1094 * Math.exp((17.625 * tempC) / (tempC + 243.04))
}

/**
 * Índice de refractividad atmosférica (fórmula ITU-R): N = 77.6·(P/T) + 3.73×10⁵·(e/T²)
 * P = presión en hPa, T = temperatura en Kelvin, e = presión de vapor de agua real en hPa.
 * Nota: esto usa solo datos de superficie — la predicción precisa de ducting requiere el
 * gradiente vertical de N (perfil atmosférico completo), que no está disponible aquí.
 * Se usa como proxy: refractividad alta en superficie correlaciona con mayor probabilidad
 * de condiciones super-refractivas.
 */
export function computeRefractivity(tempC: number, humidityPct: number, pressureHpa: number): number {
  const tempK = tempC + CELSIUS_TO_KELVIN
  const es = saturationVaporPressure(tempC)
  const e = es * (humidityPct / 100)
  return 77.6 * (pressureHpa / tempK) + 3.73e5 * (e / (tempK * tempK))
}

/**
 * Atenuación específica por lluvia en dB/km. Usa la forma funcional de ITU-R P.838 (γ = k·R^α)
 * con coeficientes k/α simplificados — es una aproximación ilustrativa, no la tabla regulatoria
 * completa (que depende de polarización y requiere varios términos polinomiales por frecuencia).
 */
export function computeRainAttenuation(freqGhz: number, rainRateMmH: number): number {
  if (rainRateMmH <= 0) return 0
  const k = 0.0001 * Math.pow(freqGhz, 1.6)
  const alpha = 1.1
  return k * Math.pow(rainRateMmH, alpha)
}

function classifyRefractivity(n: number): StabilityLevel {
  if (n < 320) return 'alta'
  if (n < 370) return 'media'
  return 'baja'
}

function classifyRainAttenuation(gammaDbKm: number): StabilityLevel {
  if (gammaDbKm < 0.5) return 'alta'
  if (gammaDbKm < 2) return 'media'
  return 'baja'
}

export function assessBands(weather: CurrentWeather): BandAssessment[] {
  const n = computeRefractivity(weather.temperatureC, weather.humidityPct, weather.pressureHpa)
  const vhfUhfStability = classifyRefractivity(n)

  // Precipitación acumulada reciente como proxy de tasa de lluvia instantánea.
  const gamma = computeRainAttenuation(12, weather.precipitationMm)
  const shfStability = classifyRainAttenuation(gamma)

  const refractivityNote =
    vhfUhfStability === 'baja'
      ? 'alto riesgo de ducting/multipath'
      : vhfUhfStability === 'media'
        ? 'condiciones moderadas'
        : 'refracción estándar y predecible'

  const rainNote =
    shfStability === 'baja' ? 'atenuación significativa' : shfStability === 'media' ? 'atenuación moderada' : 'atenuación mínima'

  return [
    {
      band: 'hf',
      stability: 'no_aplica',
      explanation: 'HF depende de la ionósfera y la actividad solar, no del clima en superficie — no se estima con estos datos.',
    },
    {
      band: 'vhf',
      stability: vhfUhfStability,
      explanation: `Refractividad atmosférica N ≈ ${n.toFixed(0)} N-unidades: ${refractivityNote}.`,
      metric: { label: 'Refractividad (N)', value: `${n.toFixed(0)}` },
    },
    {
      band: 'uhf',
      stability: vhfUhfStability,
      explanation: `Misma dinámica de refractividad que VHF (N ≈ ${n.toFixed(0)} N-unidades): ${refractivityNote}.`,
      metric: { label: 'Refractividad (N)', value: `${n.toFixed(0)}` },
    },
    {
      band: 'shf',
      stability: shfStability,
      explanation: `Atenuación estimada por lluvia ≈ ${gamma.toFixed(2)} dB/km: ${rainNote}.`,
      metric: { label: 'Atenuación por lluvia', value: `${gamma.toFixed(2)} dB/km` },
    },
  ]
}
