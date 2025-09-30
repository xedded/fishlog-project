'use client'

import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/AuthForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laddar...</div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
}
