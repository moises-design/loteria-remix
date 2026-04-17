import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function SettingsScreen() {
  const { setMode, activeDeck, setActiveDeck, pesos } = useGameStore();
  const [soundOn, setSoundOn] = useState(localStorage.getItem('sound') !== 'off');
  const [hapticsOn, setHapticsOn] = useState(localStorage.getItem('haptics') !== 'off');
  const [voiceLang, setVoiceLang] = useState(localStorage.getItem('voice-lang') || 'es');

  const setVoice = (lang) => {
    setVoiceLang(lang);
    localStorage.setItem('voice-lang', lang);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem('sound', next ? 'on' : 'off');
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    localStorage.setItem('haptics', next ? 'on' : 'off');
  };

  const DECKS = [
    { id: 'classic', name: 'Classic Deck', sub: 'Original 54 Don Clemente cards', emoji: '🐓', locked: false },
    { id: 'millennial', name: 'Millennial Deck', sub: '54 modern remix cards', emoji: '📱', locked: false },
  ];

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-icon" onClick={() => setMode('home')}>←</button>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 1 }}>SETTINGS</h2>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Wallet */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>WALLET</div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--gold)', lineHeight: 1 }}>{pesos} 🪙</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>pesos earned</div>
            </div>
            <div style={{ fontSize: 36 }}>💰</div>
          </div>
        </div>

        {/* Active Deck */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>ACTIVE DECK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DECKS.map(deck => (
              <button
                key={deck.id}
                className="btn"
                onClick={() => !deck.locked && setActiveDeck(deck.id)}
                style={{
                  justifyContent: 'space-between', padding: '16px 20px',
                  background: activeDeck === deck.id ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeDeck === deck.id ? 'rgba(245,200,66,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14, opacity: deck.locked ? 0.5 : 1,
                  cursor: deck.locked ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{deck.emoji}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--cream)', fontSize: 15 }}>{deck.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{deck.sub}</div>
                  </div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: activeDeck === deck.id ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${activeDeck === deck.id ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12,
                }}>
                  {activeDeck === deck.id ? '✓' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Haptics */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>AUDIO & FEEL</div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Sound Effects', sub: 'Card marks, combos, wins', on: soundOn, toggle: toggleSound, emoji: '🔊' },
              { label: 'Haptic Feedback', sub: 'Vibrations on tap & win', on: hapticsOn, toggle: toggleHaptics, emoji: '📳' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: i === 0 ? '0 0 16px' : '16px 0 0',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--cream)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{item.sub}</div>
                  </div>
                </div>
                <button
                  onClick={item.toggle}
                  style={{
                    width: 50, height: 28, borderRadius: 100, border: 'none',
                    background: item.on ? 'var(--teal)' : 'rgba(255,255,255,0.15)',
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, transition: 'left 0.2s',
                    left: item.on ? 25 : 3,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Language */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>CALLER VOICE</div>
          <div className="glass-card">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
              🎙️ The caller announces cards in:
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'es', label: '🇲🇽 Español', sub: 'Con acento mexicano' },
                { id: 'en', label: '🇺🇸 English', sub: 'English card names' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className="btn"
                  onClick={() => setVoice(opt.id)}
                  style={{
                    flex: 1, flexDirection: 'column', padding: '14px 10px', gap: 4,
                    background: voiceLang === opt.id ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${voiceLang === opt.id ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{opt.label.split(' ')[0]}</span>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: voiceLang === opt.id ? 'var(--gold)' : 'var(--cream)', letterSpacing: 1 }}>
                    {opt.label.split(' ').slice(1).join(' ')}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{opt.sub}</span>
                  {voiceLang === opt.id && (
                    <span style={{ fontSize: 12, color: 'var(--gold)' }}>✓ Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>ABOUT</div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--gold)', letterSpacing: 2, marginBottom: 4 }}>
              LOTERÍA REMIX
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Version 1.0.0</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Inspired by the original Don Clemente Lotería<br />
              Est. 1887, Querétaro, Mexico 🇲🇽
            </div>
          </div>
        </div>

        {/* Reset */}
        <button
          className="btn btn-ghost"
          style={{ width: '100%', padding: '14px', color: 'rgba(255,100,100,0.7)', borderColor: 'rgba(255,100,100,0.2)' }}
          onClick={() => {
            if (confirm('Reset all progress and pesos?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          🗑 Reset All Progress
        </button>
      </div>
    </div>
  );
}
