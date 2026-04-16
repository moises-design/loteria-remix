import { useGameStore } from '../store/gameStore';

const GAMES = [
  {
    id: 'lightning-round',
    name: 'Lightning Round',
    emoji: '⚡',
    desc: 'Tap the called card before time runs out. 3 lives. Gets faster!',
    gradient: 'linear-gradient(135deg, #B71C1C, #D63030)',
    tag: '🔥 Most Addictive',
    reward: 'Up to +200 🪙',
  },
  {
    id: 'match-pairs',
    name: 'Match Pairs',
    emoji: '🃏',
    desc: 'Flip cards to find matching pairs before time runs out.',
    gradient: 'linear-gradient(135deg, #1565C0, #1976D2)',
    tag: '🧠 Memory',
    reward: 'Up to +150 🪙',
  },
  {
    id: 'card-blitz',
    name: 'Card Blitz',
    emoji: '🎯',
    desc: 'Cards fall from the sky — tap the target, dodge the rest!',
    gradient: 'linear-gradient(135deg, #4527A0, #6A1B9A)',
    tag: '😱 Chaos Mode',
    reward: 'Up to +250 🪙',
  },
  {
    id: 'name-it',
    name: 'Name It!',
    emoji: '🔤',
    desc: 'See the card image, pick the correct name. 10 questions, 8 seconds each.',
    gradient: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
    tag: '📚 Quiz',
    reward: 'Up to +120 🪙',
  },
];

export default function MiniGamesScreen() {
  const { setMode } = useGameStore();

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <button className="btn btn-icon" onClick={() => setMode('home')} style={{ marginBottom: 12 }}>←</button>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)', marginBottom: 4 }}>
          ARCADE
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 1, marginBottom: 4 }}>
          MINI <span style={{ color: 'var(--gold)' }}>GAMES</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          Quick games, big fun. Earn pesos, beat your high score.
        </p>
      </div>

      {/* Games list */}
      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {GAMES.map(game => (
          <button
            key={game.id}
            className="btn"
            onClick={() => setMode(game.id)}
            style={{
              background: game.gradient, borderRadius: 20,
              padding: '20px 20px', flexDirection: 'column', alignItems: 'flex-start',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{game.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'white', letterSpacing: 1, lineHeight: 1 }}>
                    {game.name.toUpperCase()}
                  </div>
                  <div style={{
                    display: 'inline-block', background: 'rgba(255,255,255,0.15)',
                    borderRadius: 100, padding: '2px 10px',
                    fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: 4,
                  }}>
                    {game.tag}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'right', alignSelf: 'flex-start', marginTop: 4 }}>
                {game.reward}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, textAlign: 'left' }}>
              {game.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
