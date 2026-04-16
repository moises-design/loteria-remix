import { useGameStore } from '../store/gameStore';
import { MILLENNIAL_DECK } from '../data/decks';

export default function MillennialModeScreen() {
  const { setMode, setActiveDeck, activeDeck } = useGameStore();

  const handlePlay = (mode) => {
    setActiveDeck('millennial');
    setMode(mode);
  };

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-icon" onClick={() => setMode('home')}>←</button>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: '#7986cb' }}>NUEVO DECK</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, lineHeight: 1 }}>MILLENNIAL DECK</h2>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>📱</div>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 24px', fontSize: 15 }}>
          54 cards reimagined for the chronically online. Classic Lotería meets internet culture.
        </p>

        {/* Play buttons */}
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column', maxWidth: 320, margin: '0 auto 32px' }}>
          <button className="btn btn-gold" style={{ padding: '14px', width: '100%' }} onClick={() => handlePlay('classic-single')}>
            🎮 Play Single Player
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px', width: '100%' }} onClick={() => handlePlay('classic-caller')}>
            📢 Use as Caller
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px', width: '100%' }} onClick={() => handlePlay('act-it-out')}>
            🎭 Act It Out Mode
          </button>
        </div>

        {activeDeck === 'millennial' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
            background: 'rgba(121,134,203,0.15)', border: '1px solid rgba(121,134,203,0.3)',
            borderRadius: 100, padding: '6px 16px', color: '#7986cb', fontSize: 13, fontWeight: 600,
          }}>
            ✓ Currently Active Deck
          </div>
        )}
      </div>

      {/* All cards */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
          ALL {MILLENNIAL_DECK.length} CARDS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {MILLENNIAL_DECK.map(card => (
            <div key={card.id} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: card.color + '33', border: `1px solid ${card.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>{card.emoji}</div>
              <div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'var(--cream)', letterSpacing: 0.5, lineHeight: 1.2 }}>
                  {card.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, marginTop: 2 }}>
                  {card.riddle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
