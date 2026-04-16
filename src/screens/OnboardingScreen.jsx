import { useState } from 'react';

const SLIDES = [
  {
    emoji: '🎴',
    title: 'WELCOME TO\nLOTERÍA REMIX',
    sub: 'The classic Mexican card game, completely reimagined as a mobile party experience.',
    bg: 'linear-gradient(160deg, #1a6b4a, #0d3d29)',
    accent: '#4ecba0',
  },
  {
    emoji: '🎮',
    title: 'FOUR WAYS\nTO PLAY',
    sub: 'Classic solo game, caller mode for groups, Act It Out party mode, and the wild Millennial Deck.',
    bg: 'linear-gradient(160deg, #1D4E8F, #0a2545)',
    accent: '#7986cb',
    cards: ['🐓','🌙','☀️','💀'],
  },
  {
    emoji: '🤳',
    title: 'PUT YOUR FACE\nON THE CARDS',
    sub: 'Upload selfies of your crew. Their faces get assigned to El Gallo, La Sirena, and more. Instant viral moment.',
    bg: 'linear-gradient(160deg, #880E4F, #4a0829)',
    accent: '#f48fb1',
  },
  {
    emoji: '🏆',
    title: 'EARN PESOS.\nLEVEL UP.',
    sub: 'Win pesos, unlock harder levels, build streaks. From La Familia (easy) all the way to Don Clemente (legend).',
    bg: 'linear-gradient(160deg, #BF360C, #6b1a06)',
    accent: '#ffab91',
  },
];

export default function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) { onDone(); return; }
    setSlide(s => s + 1);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: current.bg,
      transition: 'background 0.5s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 16px)',
      }} />

      {/* Skip */}
      {!isLast && (
        <button
          onClick={onDone}
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 10,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 100, padding: '8px 16px',
            color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Skip
        </button>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px 32px', position: 'relative', zIndex: 1 }}>
        {/* Big emoji */}
        <div style={{
          fontSize: 100, marginBottom: 32,
          animation: 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
        }}>
          {current.emoji}
        </div>

        {/* Optional card row */}
        {current.cards && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            {current.cards.map((e, i) => (
              <div key={i} style={{
                width: 56, height: 72, background: 'white',
                borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 28,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                transform: `rotate(${(i-1.5)*5}deg)`,
                animation: `bounce-in 0.4s ease ${i * 0.08}s both`,
              }}>{e}</div>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(42px, 12vw, 56px)',
          lineHeight: 1, letterSpacing: 2,
          color: 'white', textAlign: 'center',
          whiteSpace: 'pre-line', marginBottom: 16,
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.4s ease',
        }}>
          {current.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 17, color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', lineHeight: 1.65,
          maxWidth: 320, animation: 'slideUp 0.5s ease',
        }}>
          {current.sub}
        </p>
      </div>

      {/* Bottom area */}
      <div style={{ padding: '0 32px 48px', position: 'relative', zIndex: 1 }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 24 : 8, height: 8,
                borderRadius: 100, border: 'none',
                background: i === slide ? 'white' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next / Start */}
        <button
          onClick={next}
          style={{
            width: '100%', padding: '18px',
            background: 'white', color: '#0D1B3E',
            border: 'none', borderRadius: 100,
            fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 2,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isLast ? '🎴 LET\'S PLAY!' : 'NEXT →'}
        </button>
      </div>
    </div>
  );
}
