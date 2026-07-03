import { useNavigate } from 'react-router-dom'

export default function MemberPage({ name, bgColor, bgImage, fgImage }) {
  const navigate = useNavigate()

  const bgStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: bgColor }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        ...bgStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {fgImage && (
        <img src={fgImage} alt="" className="fg-pop" style={{ display: 'block', position: 'absolute', left: '50%', top: '50%', maxWidth: '100vw', maxHeight: '100vh', width: '95vw', height: 'auto' }} />
      )}
      <style>{`
        .fg-pop {
          animation: popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform: translate(-50%, -50%) scale(0);
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      <button
        onClick={() => navigate('/', { state: { openMenu: true } })}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          padding: '14px 28px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.85)',
          color: '#333',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}
      >
        返回
      </button>
    </div>
  )
}
