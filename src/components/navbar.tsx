'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface NavbarProps {
  user: any
  onSignOut?: () => void
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Standupovka" className="h-7 md:h-8 w-auto" />
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
            Live
          </span>
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* User email */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase">
                  {user.email?.[0] || '?'}
                </span>
              </div>
              <span className="text-white/70 text-xs truncate max-w-[140px]">{user.email}</span>
            </div>

            {/* Sign out */}
            <button
              onClick={onSignOut}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Ieși</span>
            </button>
          </div>
        ) : (
          <a
            href="/auth/login"
            style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }}
            className="bg-white text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2 cursor-pointer no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Conectare
          </a>
        )}
      </div>
    </header>
  )
}
