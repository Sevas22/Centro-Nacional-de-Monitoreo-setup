// Este archivo se llamaba data/mock.ts y contenía datos de noticias/KPIs/alertas 100% inventados
// (el mismo array desde el scaffold original de v0, nunca conectado a nada real — ver la
// migración a ingestión real de noticias en lib/news/). Lo que queda acá es genuinamente estático
// y legítimo: nombres de geografía y coordenadas de ciudades, no contenido que finja ser noticias.

// Nombre de departamento tal como aparece en public/geo/colombia.json (NOMBRE_DPT, mayúsculas
// sin tildes) -> nombre real de departamento usado en el resto de la app.
export const geoNameToDept: Record<string, string> = {
  ANTIOQUIA: 'Antioquia',
  ATLANTICO: 'Atlántico',
  'SANTAFE DE BOGOTA D.C': 'Bogotá D.C.',
  BOLIVAR: 'Bolívar',
  BOYACA: 'Boyacá',
  CALDAS: 'Caldas',
  CAQUETA: 'Caquetá',
  CAUCA: 'Cauca',
  CESAR: 'Cesar',
  CORDOBA: 'Córdoba',
  CUNDINAMARCA: 'Cundinamarca',
  CHOCO: 'Chocó',
  HUILA: 'Huila',
  'LA GUAJIRA': 'La Guajira',
  MAGDALENA: 'Magdalena',
  META: 'Meta',
  'NARIÑO': 'Nariño',
  'NORTE DE SANTANDER': 'Norte de Santander',
  QUINDIO: 'Quindío',
  RISARALDA: 'Risaralda',
  SANTANDER: 'Santander',
  SUCRE: 'Sucre',
  TOLIMA: 'Tolima',
  'VALLE DEL CAUCA': 'Valle del Cauca',
  ARAUCA: 'Arauca',
  CASANARE: 'Casanare',
  PUTUMAYO: 'Putumayo',
  AMAZONAS: 'Amazonas',
  GUAINIA: 'Guainía',
  GUAVIARE: 'Guaviare',
  VAUPES: 'Vaupés',
  VICHADA: 'Vichada',
  'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA': 'San Andrés',
}

// Ciudades principales mostradas como referencia visual sobre el mapa nacional — coordenadas
// reales, no vinculadas a ningún conteo de noticias.
export const majorCities = [
  { name: 'Bogotá', coordinates: [-74.0721, 4.711] as [number, number], pulse: true },
  { name: 'Medellín', coordinates: [-75.5636, 6.2518] as [number, number], pulse: false },
  { name: 'Cali', coordinates: [-76.532, 3.4516] as [number, number], pulse: false },
  { name: 'Barranquilla', coordinates: [-74.7813, 10.9685] as [number, number], pulse: false },
]
