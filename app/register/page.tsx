import type { Metadata } from 'next'
import { Satellite } from 'lucide-react'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Crear cuenta | Centro Nacional de Monitoreo',
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams
  const redirectTo = from && from.startsWith('/') ? from : '/dashboard'

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Satellite className="size-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Centro Nacional de Monitoreo</p>
            <p className="text-xs text-muted-foreground">Crea tu cuenta para empezar a monitorear</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <RegisterForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
