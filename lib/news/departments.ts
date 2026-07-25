import { departmentCapitals } from '@/lib/spectrum/department-capitals'
import { departmentDivipola } from '@/lib/spectrum/department-divipola'
import { municipioCoordinates } from '@/lib/spectrum/municipio-coordinates'

// Mismo principio que detectMentionedGroups en lib/gao/groups.ts: solo se asigna un departamento
// si su nombre o el de su capital aparece literalmente en el texto. Si no hay coincidencia, el
// artículo queda como 'Nacional' — nunca se le atribuye una ubicación que no está en el texto.
const departmentKeywords: { department: string; keywords: string[] }[] = Object.entries(departmentCapitals).map(
  ([department, capital]) => ({
    department,
    keywords: [department.toLowerCase(), capital.toLowerCase()],
  }),
)

export function detectDepartment(text: string): string {
  const normalized = text.toLowerCase()
  const match = departmentKeywords.find((d) => d.keywords.some((k) => normalized.includes(k)))
  return match?.department ?? 'Nacional'
}

const municipiosByDeptCode = new Map<string, { name: string }[]>()
for (const m of municipioCoordinates) {
  const list = municipiosByDeptCode.get(m.deptCode) ?? []
  list.push({ name: m.name })
  municipiosByDeptCode.set(m.deptCode, list)
}

/**
 * Solo busca dentro de los municipios del departamento ya detectado (reduce falsos positivos de
 * nombres de municipio genéricos) — si no hay coincidencia literal, queda sin municipio en vez de
 * adivinar. Nombres de municipio en el dataset vienen en mayúsculas (MPIO_CNMBR de DANE).
 */
export function detectMunicipality(text: string, department: string): string | null {
  const deptCode = departmentDivipola[department]
  if (!deptCode) return null
  const candidates = municipiosByDeptCode.get(deptCode)
  if (!candidates) return null

  const normalized = text.toLowerCase()
  // Los municipios con nombres más largos primero — evita que un nombre corto que es substring
  // de uno más específico (poco común, pero posible) se lleve el match equivocado.
  const sorted = [...candidates].sort((a, b) => b.name.length - a.name.length)
  const match = sorted.find((m) => normalized.includes(m.name.toLowerCase()))
  return match?.name ?? null
}
