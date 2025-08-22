'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'

interface NavbarProps {
  user: any
  onSignOut?: () => void
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  return (
    <header className="flex justify-center p-4 md:p-6">
      <div className="w-full max-w-[1200px] flex justify-between items-center px-2">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" suppressHydrationWarning>
            <img src="/logo.svg" alt="Logo" className="h-7 md:h-9 cursor-pointer" />
          </Link>
          <div className="flex items-center gap-1 md:gap-2">
            <img src="/live-icon.svg" alt="Live" className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-gray-200 font-bold text-xs md:text-sm uppercase">LIVE</span>
          </div>
        </div>
        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <img src="/user-icon.svg" alt="User" className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-gray-300 text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{user.email}</span>
            </div>
            <button 
              onClick={onSignOut}
              className="bg-red-600 hover:bg-red-700 rounded-xl px-3 py-2 md:px-4 md:py-2 flex items-center gap-1 md:gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-xs md:text-sm">Ieși</span>
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="bg-red-600 hover:bg-red-700 rounded-xl px-3 py-2 md:px-4 md:py-2 flex items-center gap-1 md:gap-2 transition-colors">
            <img src="/user-icon.svg" alt="User" className="w-4 h-4" />
            <span className="text-white font-bold text-xs md:text-sm">Întră</span>
          </Link>
        )}
      </div>
    </header>
  )
}