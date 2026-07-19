'use client'

import { useState } from 'react'
import {
  User,
  SlidersHorizontal,
  Bell,
  Plug,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5.5 w-10 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-secondary',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-4.5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[19px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'h-9 w-full rounded-lg border border-border bg-background/50 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50'

const notifyChannels = ['Dashboard', 'Email', 'Slack', 'SMS', 'WhatsApp']

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [channels, setChannels] = useState<string[]>(['Dashboard', 'Email'])
  const [refreshInterval, setRefreshInterval] = useState('8')
  const [language, setLanguage] = useState('es')
  const [compactMode, setCompactMode] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)
  const [showKeys, setShowKeys] = useState(false)

  function toggleChannel(ch: string) {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))
  }

  function save(section: string) {
    toast({ variant: 'success', title: 'Cambios guardados', description: `${section} se actualizó correctamente.` })
  }

  return (
    <PageTransition>
      <PageHeader title="Configuración" subtitle="Preferencias de cuenta, notificaciones e integraciones del sistema" />

      <div className="flex flex-col gap-6">
        <SectionCard title="Perfil de usuario" icon={<User className="size-4 text-[var(--accent-blue)]" />}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info text-lg font-semibold text-primary-foreground">
                JR
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Juan Ramírez</p>
                <p className="text-xs text-muted-foreground">Analista de Inteligencia</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre completo">
                <input defaultValue="Juan Ramírez" className={inputClass} />
              </Field>
              <Field label="Correo electrónico">
                <input defaultValue="juan.ramirez@centromonitoreo.co" className={inputClass} />
              </Field>
              <Field label="Rol">
                <input defaultValue="Analista de Inteligencia" disabled className={cn(inputClass, 'opacity-60')} />
              </Field>
              <Field label="Zona horaria">
                <select defaultValue="America/Bogota" className={inputClass}>
                  <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                  <option value="America/New_York">América/Nueva York (UTC-4)</option>
                </select>
              </Field>
            </div>
            <button
              onClick={() => save('Perfil')}
              className="flex w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Save className="size-3.5" /> Guardar perfil
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Preferencias del dashboard" icon={<SlidersHorizontal className="size-4 text-[var(--accent-purple)]" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Intervalo de actualización en vivo">
              <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className={inputClass}>
                <option value="5">Cada 5 segundos</option>
                <option value="8">Cada 8 segundos</option>
                <option value="15">Cada 15 segundos</option>
                <option value="30">Cada 30 segundos</option>
              </select>
            </Field>
            <Field label="Idioma">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Modo compacto</p>
              <p className="text-xs text-muted-foreground">Reduce el espaciado de las tarjetas y tablas.</p>
            </div>
            <Toggle checked={compactMode} onChange={setCompactMode} label="Modo compacto" />
          </div>
          <button
            onClick={() => save('Preferencias')}
            className="mt-4 flex w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-3.5" /> Guardar preferencias
          </button>
        </SectionCard>

        <SectionCard title="Notificaciones" icon={<Bell className="size-4 text-[var(--accent-orange)]" />}>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Canales de notificación</p>
          <div className="flex flex-wrap gap-2">
            {notifyChannels.map((ch) => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  channels.includes(ch)
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {ch}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Horario de notificaciones">
              <select defaultValue="24h" className={inputClass}>
                <option value="24h">Las 24 horas</option>
                <option value="business">Horario laboral (8am - 6pm)</option>
                <option value="critical">Solo alertas críticas</option>
              </select>
            </Field>
          </div>
          <button
            onClick={() => save('Notificaciones')}
            className="mt-4 flex w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-3.5" /> Guardar notificaciones
          </button>
        </SectionCard>

        <SectionCard title="Integración con APIs" icon={<Plug className="size-4 text-[var(--accent-cyan)]" />}>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Conecta fuentes externas de datos. Las claves se almacenan cifradas y no se muestran en texto plano.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="NewsAPI Key">
              <div className="relative">
                <input
                  type={showKeys ? 'text' : 'password'}
                  defaultValue="sk-live-8f2a1c9d4e7b"
                  className={cn(inputClass, 'pr-9')}
                />
                <button
                  type="button"
                  onClick={() => setShowKeys((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKeys ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showKeys ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </Field>
            <Field label="Webhook de eventos críticos">
              <input placeholder="https://hooks.tuempresa.com/alertas" className={inputClass} />
            </Field>
            <Field label="X (Twitter) API Token">
              <input type={showKeys ? 'text' : 'password'} defaultValue="AAAAAAAAAAAAAAAAAAAAAA" className={inputClass} />
            </Field>
            <Field label="Slack Webhook URL">
              <input placeholder="https://hooks.slack.com/services/..." className={inputClass} />
            </Field>
          </div>
          <button
            onClick={() => save('Integraciones')}
            className="mt-4 flex w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-3.5" /> Guardar integraciones
          </button>
        </SectionCard>

        <SectionCard title="Seguridad" icon={<ShieldCheck className="size-4 text-[var(--accent-green)]" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Contraseña actual">
              <input type="password" className={inputClass} />
            </Field>
            <Field label="Nueva contraseña">
              <input type="password" className={inputClass} />
            </Field>
            <Field label="Confirmar contraseña">
              <input type="password" className={inputClass} />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Autenticación de dos factores</p>
              <p className="text-xs text-muted-foreground">Requiere un código adicional al iniciar sesión.</p>
            </div>
            <Toggle checked={twoFactor} onChange={setTwoFactor} label="Autenticación de dos factores" />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Sesiones activas</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                <Monitor className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Chrome · Bogotá, Colombia</p>
                  <p className="text-[11px] text-muted-foreground">Sesión actual</p>
                </div>
                <span className="text-[11px] font-medium text-success">Activa</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                <Smartphone className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">App móvil · Medellín, Colombia</p>
                  <p className="text-[11px] text-muted-foreground">hace 2 días</p>
                </div>
                <button className="text-[11px] font-medium text-destructive hover:underline">Cerrar sesión</button>
              </div>
            </div>
          </div>

          <button
            onClick={() => save('Seguridad')}
            className="mt-4 flex w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-3.5" /> Guardar cambios de seguridad
          </button>
        </SectionCard>
      </div>
    </PageTransition>
  )
}
