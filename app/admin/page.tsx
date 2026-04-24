import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/admin/sessions')

  return (
    <div className="pt-14 md:pt-0 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Admin Login</h1>
        <LoginForm />
      </div>
    </div>
  )
}
