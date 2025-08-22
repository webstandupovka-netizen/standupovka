'use client'

import { useUser } from '@/hooks/useUser'
import { Navbar } from './navbar'
import { Footer } from './footer'

interface LayoutWithNavbarProps {
  children: React.ReactNode
}

export function LayoutWithNavbar({ children }: LayoutWithNavbarProps) {
  const { user, signOut } = useUser()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar user={user} onSignOut={signOut} />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}