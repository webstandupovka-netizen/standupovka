'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 mt-auto py-6 md:py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/" suppressHydrationWarning>
                <img src="/logo.svg" alt="Logo" className="h-7 md:h-9 cursor-pointer" />
              </Link>
              <div className="flex items-center gap-1 md:gap-2">
                <img src="/live-icon.svg" alt="Live" className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-gray-200 font-bold text-xs md:text-sm uppercase">LIVE</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-center sm:text-left">
              <span className="text-white text-xs md:text-sm">Privacy policy</span>
              <span className="text-white text-xs md:text-sm">Terms & Conditions</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}