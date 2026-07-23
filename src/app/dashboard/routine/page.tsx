import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import { getScheduledRoutines } from '@/app/actions/scheduled-routines'
import { RoutineClient } from '@/app/dashboard/routine/routine-client'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const metadata = {
  title: 'Minha Rotina | CheckFit',
  description: 'Gerencie seus hábitos diários, treinos e refeições.',
}
 
export default async function RoutinePage() {
  const { profile, error } = await getProfile()

  if (error || !profile) {
    redirect('/login')
  }

  const routines = await getScheduledRoutines()

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Menu Lateral de Navegação */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Minha Rotina" 
          description="Seus hábitos diários organizados cronologicamente." 
          profile={profile}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <RoutineClient initialRoutines={routines} />
          </div>
        </main>
      </div>
    </div>
  )
}
