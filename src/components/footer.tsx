'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 mt-auto">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Standupovka" className="h-6 md:h-7 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-white/20 text-xs">|</span>
            <span className="text-white/30 text-xs">Live Streaming Platform</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Confidențialitate
            </Link>
            <Link href="/terms" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Termeni
            </Link>
            <Link href="mailto:standupovkaclub@gmail.com" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/20 text-[11px]">
            © {new Date().getFullYear()} Standupovka. Toate drepturile rezervate.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/visa-maib.webp" alt="VISA MAIB" className="h-5 opacity-40" />
        </div>
      </div>
    </footer>
  )
}
