import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'
import { getDailyHydration } from '@/app/actions/hydration'
import { getTodayRoutine } from '@/app/actions/routine'
import { getScheduledRoutines } from '@/app/actions/scheduled-routines'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile, daily hydration and routine in parallel for performance
  const [profileResponse, initialWaterIntake, initialRoutineItems, initialScheduledRoutines] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    getDailyHydration(),
    getTodayRoutine(),
    getScheduledRoutines()
  ])

  const profile: Profile | null = profileResponse.error ? null : profileResponse.data

  return (
    <DashboardClient 
      profile={profile} 
      initialWaterIntake={initialWaterIntake} 
      initialRoutineItems={initialRoutineItems}
      scheduledRoutines={initialScheduledRoutines.filter(r => r.is_active)}
    />
  )
}
