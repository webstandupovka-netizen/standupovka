export default function ComingSoonPage() {
  return (
    <>
      {/* Скрываем navbar и footer через CSS */}
      <style>{`
        header, footer { display: none !important; }
        .flex-1 { display: contents; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Standupovka" style={{ height: '32px', margin: '0 auto 32px', opacity: 0.6 }} />
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
            În curând
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            Pregătim ceva special pentru tine. Revino în curând!
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            <span>Standupovka</span>
            <span>•</span>
            <span>Live Streaming Platform</span>
          </div>
        </div>
      </div>
    </>
  )
}
