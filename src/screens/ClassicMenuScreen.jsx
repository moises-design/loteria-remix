import { useGameStore } from '../store/gameStore';

const LEVEL_CONFIGS = [
  { level: 1, name: 'La Familia',    stars: 1, speed: 8, description: 'Nice and easy', reward: 20 },
  { level: 2, name: 'El Barrio',     stars: 1, speed: 6, description: 'Getting warmer', reward: 30 },
  { level: 3, name: 'La Fiesta',     stars: 2, speed: 5, description: 'Cards come faster', reward: 40 },
  { level: 4, name: 'El Mercado',    stars: 2, speed: 4, description: 'Keep up!', reward: 50 },
  { level: 5, name: 'La Plaza',      stars: 2, speed: 3, description: 'Speed challenge', reward: 65 },
  { level: 6, name: 'El Gallo Loco', stars: 3, speed: 2.5, description: 'Expert mode', reward: 80 },
  { level: 7, name: 'La Calavera',   stars: 3, speed: 2, description: 'No mercy', reward: 100 },
  { level: 8, name: 'Don Clemente',  stars: 3, speed: 1.5, description: 'Legend difficulty', reward: 150 },
];

export default function ClassicMenuScreen() {
  const { setMode, unlocked, levelScores, selectedLevel, setSelectedLevel } = useGameStore();

  const getStarsDisplay = (level, score) => {
    if (!score) return '☆☆☆';
    if (score >= 900) return '★★★';
    if (score >= 600) return '★★☆';
    return '★☆☆';
  };

  return (
    <div className="screen" style={{ background: 'var(--navy)' }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 0',
        background: 'linear-gradient(180deg, rgba(29,158,117,0.15), transparent)',
      }}>
        <button className="btn btn-icon" onClick={() => setMode('home')} style={{ marginBottom: 16 }}>←</button>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>
          CLASSIC MODE
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 1, marginBottom: 4 }}>
          CHOOSE YOUR<br /><span style={{ color: 'var(--gold)' }}>GAME</span>
        </h2>
      </div>

      {/* Sub-mode selector */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 12 }}>
        <button
          className="btn"
          onClick={() => { setMode('classic-single'); }}
          style={{
            flex: 1, flexDirection: 'column', padding: '20px 16px',
            background: 'linear-gradient(135deg, rgba(29,158,117,0.3), rgba(29,158,117,0.1))',
            border: '1px solid rgba(29,158,117,0.4)', borderRadius: 16,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>🎮</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'white' }}>SINGLE PLAYER</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>vs the app</span>
        </button>
        <button
          className="btn"
          onClick={() => setMode('classic-caller')}
          style={{
            flex: 1, flexDirection: 'column', padding: '20px 16px',
            background: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.08))',
            border: '1px solid rgba(245,200,66,0.35)', borderRadius: 16,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>📢</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'white' }}>CALLER MODE</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>for group play</span>
        </button>
      </div>

      {/* Level Map */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(251,245,230,0.4)', marginBottom: 16 }}>
          LEVEL MAP — SINGLE PLAYER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LEVEL_CONFIGS.map((config) => {
            const isUnlocked = unlocked.includes(config.level);
            const score = levelScores[config.level];
            const isSelected = selectedLevel === config.level;

            return (
              <button
                key={config.level}
                className="btn"
                disabled={!isUnlocked}
                onClick={() => {
                  setSelectedLevel(config.level);
                  setMode('classic-single');
                }}
                style={{
                  justifyContent: 'space-between', padding: '16px 20px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(245,200,66,0.2), rgba(245,200,66,0.05))'
                    : isUnlocked
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  border: isSelected
                    ? '1px solid rgba(245,200,66,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  opacity: isUnlocked ? 1 : 0.4,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isUnlocked
                      ? 'linear-gradient(135deg, var(--gold), #f09000)'
                      : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18,
                    color: isUnlocked ? 'var(--navy)' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                  }}>
                    {isUnlocked ? config.level : '🔒'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: isUnlocked ? 'var(--cream)' : 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
                      {config.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {config.description} · {config.speed}s/card
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: 16, letterSpacing: 1 }}>{getStarsDisplay(config.level, score)}</div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>+{config.reward} 🪙</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { LEVEL_CONFIGS };
