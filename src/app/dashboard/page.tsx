import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'
import { getDailyHydration } from '@/app/actions/hydration'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile and daily hydration in parallel for performance
  const [profileResponse, initialWaterIntake] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    getDailyHydration()
  ])

  const profile: Profile | null = profileResponse.error ? null : profileResponse.data

  return <DashboardClient profile={profile} initialWaterIntake={initialWaterIntake} />
}
