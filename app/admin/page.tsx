import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/admin/sessions')

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <LoginForm />
    </div>
  )
}
