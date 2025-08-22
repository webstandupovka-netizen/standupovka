'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Navbar } from './navbar'
import { UserProfile } from '@/types/database'

interface EventBlockProps {
  user: UserProfile | null
  hasAccess: boolean
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 12,
    minutes: 23,
    seconds: 44
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-2 md:gap-4">
      <div className="border border-gray-600 rounded-xl p-2 md:p-4 flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px]">
        <span className="text-gray-200 font-bold text-lg md:text-2xl leading-none">{timeLeft.days}</span>
        <span className="text-gray-200 text-xs mt-1">zile</span>
      </div>
      <div className="border border-gray-600 rounded-xl p-2 md:p-4 flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px]">
        <span className="text-gray-200 font-bold text-lg md:text-2xl leading-none">{timeLeft.hours}</span>
        <span className="text-gray-200 text-xs mt-1">ore</span>
      </div>
      <div className="border border-gray-600 rounded-xl p-2 md:p-4 flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px]">
        <span className="text-gray-200 font-bold text-lg md:text-2xl leading-none">{timeLeft.minutes}</span>
        <span className="text-gray-200 text-xs mt-1">minute</span>
      </div>
      <div className="border border-gray-600 rounded-xl p-2 md:p-4 flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px]">
        <span className="text-gray-200 font-bold text-lg md:text-2xl leading-none">{timeLeft.seconds}</span>
        <span className="text-gray-200 text-xs mt-1">secunde</span>
      </div>
    </div>
  )
}

export function EventBlock({ user, hasAccess }: EventBlockProps) {
  return (
    <div className="flex flex-col">
      {/* Main Content */}
       <main className="flex justify-center py-8 md:py-16">
         <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-6 md:gap-8 px-4 md:px-6">
        {/* Left Content */}
        <div className="flex-1 space-y-6 md:space-y-8">
          {/* Date and Time Block */}
          <div className="bg-blue-600 rounded-xl p-3 flex items-center gap-2 md:gap-3 w-fit">
            <img src="/calendar.svg" alt="Calendar" className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-gray-200 font-bold text-xs md:text-sm">21 Septembrie</span>
            <div className="w-px h-4 md:h-5 bg-gray-200"></div>
            <span className="text-gray-200 font-bold text-base md:text-lg">19:30</span>
          </div>

          {/* Title Container */}
          <div className="space-y-4">
            <h1 className="text-white font-black text-2xl md:text-4xl lg:text-5xl leading-tight uppercase">
              așa, bună seara!
            </h1>
            <div className="max-w-lg">
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Show-ul tău preferat revine la Arena pentru că data trecută s-a lăsat cu scandal și băieții nu au încă răspuns la întrebarea: "Cine este campionul ABS?"
              </p>
            </div>
          </div>

          {/* Countdown Container */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-gray-200 font-bold text-sm md:text-base uppercase">
              Până la începutul evenimentului:
            </h3>
            <CountdownTimer />
          </div>

          {/* CTA Button */}
          <div>
            {hasAccess ? (
              <Link href="/stream">
                <div className="bg-green-600 hover:bg-green-700 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 w-fit cursor-pointer transition-all duration-200">
                  <img src="/live-icon.svg" alt="Play" className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-white font-bold text-sm md:text-base uppercase">vizionați streamul</span>
                </div>
              </Link>
            ) : user?.free_access ? (
              <Link href="/stream">
                <div className="bg-blue-600 hover:bg-blue-700 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 w-fit cursor-pointer transition-all duration-200">
                  <img src="/live-icon.svg" alt="Play" className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-white font-bold text-sm md:text-base uppercase">vizionați gratuit</span>
                </div>
              </Link>
            ) : user && !user.free_access ? (
              <Link href="/buy?streamId=550e8400-e29b-41d4-a716-446655440000">
                <div className="bg-red-600 hover:bg-red-700 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 w-fit cursor-pointer transition-all duration-200">
                  <img src="/ticket-icon.svg" alt="Ticket" className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-white font-bold text-sm md:text-base uppercase">live bilet</span>
                  <div className="bg-white text-red-600 px-2 py-1 md:px-3 md:py-2 rounded-xl">
                    <span className="font-bold text-xs md:text-sm uppercase">150 mdl</span>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/auth/login">
                <div className="bg-blue-600 hover:bg-blue-700 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 w-fit cursor-pointer transition-all duration-200">
                  <img src="/live-icon.svg" alt="Login" className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-white font-bold text-sm md:text-base uppercase">autentificare pentru acces</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Right Content - Event Poster */}
         <div className="flex-1 flex justify-center lg:justify-end">
           <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] aspect-square">
             <img 
               src="/event-poster.png" 
               alt="Event Poster" 
               className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
             />
           </div>
         </div>
         </div>
       </main>


    </div>
  )
}