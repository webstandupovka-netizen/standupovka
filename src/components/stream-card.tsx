'use client'

import Link from 'next/link'

interface StreamCardProps {
  stream: {
    id: string
    title: string
    description?: string
    poster_url?: string
    poster_card_url?: string
    stream_start_time: string
    price: number
    currency: string
    is_live: boolean
    recorded_video_url?: string | null
    cf_video_id?: string | null
  }
  accessStatus: 'not_logged_in' | 'no_access' | 'has_access'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function StreamCard({ stream, accessStatus }: StreamCardProps) {
  const hasRecording = !!(stream.cf_video_id || stream.recorded_video_url)
  const dateStr = formatDate(stream.stream_start_time)

  const ctaHref =
    accessStatus === 'has_access'
      ? `/stream?stream_id=${stream.id}`
      : accessStatus === 'no_access'
        ? `/buy?streamId=${stream.id}`
        : '/auth/login'

  return (
    <Link href={ctaHref}>
      <div className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/50">
        {/* Poster */}
        <div className="aspect-square relative bg-gray-900">
          {(stream.poster_card_url || stream.poster_url) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={stream.poster_card_url || stream.poster_url || ''}
              alt={stream.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Badge */}
          <div className="absolute top-3 left-3">
            {stream.is_live ? (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
            ) : hasRecording ? (
              <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide">
                Înregistrare
              </span>
            ) : null}
          </div>

          {/* Play button on hover */}
          {accessStatus === 'has_access' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          )}

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-2 mb-1">{stream.title}</h3>
            <p className="text-white/50 text-xs">{dateStr}</p>

            {/* Price / Access */}
            <div className="mt-3">
              {accessStatus === 'has_access' ? (
                <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acces disponibil
                </span>
              ) : accessStatus === 'no_access' ? (
                <span className="bg-red-600/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-block">
                  {stream.price} {stream.currency}
                </span>
              ) : (
                <span className="text-white/40 text-xs">Conectează-te</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
