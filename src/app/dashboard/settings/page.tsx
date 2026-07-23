import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import { SettingsClient } from './settings-client'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const metadata = {
  title: 'Configurações | CheckFit',
  description: 'Gerencie seu perfil, metas de saúde e integrações.',
}

export default async function SettingsPage() {
  const { profile, error } = await getProfile()

  if (error || !profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Menu Lateral de Navegação */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Configurações de Perfil" 
          description="Personalize suas metas diárias e gerencie suas contas conectadas." 
          profile={profile}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <SettingsClient initialProfile={profile} />
          </div>
        </main>
      </div>
    </div>
  )
}
