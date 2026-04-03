export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Standupovka" className="h-8 mx-auto mb-8 opacity-60" />
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
          În curând
        </h1>
        <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8">
          Pregătim ceva special pentru tine. Revino în curând!
        </p>
        <div className="flex items-center justify-center gap-2 text-white/20 text-xs">
          <span>Standupovka</span>
          <span>•</span>
          <span>Live Streaming Platform</span>
        </div>
      </div>
    </div>
  )
}
