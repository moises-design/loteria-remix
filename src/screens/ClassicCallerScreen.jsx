import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { speakCard, stopSpeech, unlockSpeech } from '../utils/voice';

export default function ClassicCallerScreen() {
  const { setMode, activeDeck, photoAssignments } = useGameStore();
  const getPhotoUrl = (card) => activeDeck === 'photo' ? (photoAssignments?.[card?.id] || null) : null;
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [remaining, setRemaining] = useState([]);
  const [called, setCalled] = useState([]);
  const [current, setCurrent] = useState(null);
  const [phase, setPhase] = useState('setup'); // setup | playing | paused | done | winner-check
  const [speed, setSpeed] = useState(5);
  const [autoPlay, setAutoPlay] = useState(false);
  const [timer, setTimer] = useState(5);
  const intervalRef = useRef(null);

  const initDeck = () => {
    const s = shuffle(deck);
    setRemaining(s);
    setCalled([]);
    setCurrent(null);
  };

  useEffect(() => { initDeck(); }, []);

  const callNext = () => {
    setRemaining(prev => {
      if (prev.length === 0) {
        setPhase('done');
        clearInterval(intervalRef.current);
        return prev;
      }
      const [next, ...rest] = prev;
      setCurrent(next);
      setCalled(c => [next, ...c]);
      setTimer(speed);
      speakCard(next);
      return rest;
    });
  };

  // Auto-play
  useEffect(() => {
    if (phase !== 'playing' || !autoPlay) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 0.1) {
          callNext();
          return speed;
        }
        return parseFloat((t - 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [phase, autoPlay, speed, remaining]);

  const handleStart = () => {
    unlockSpeech();
    setPhase('playing');
    callNext();
  };

  const handlePause = () => {
    setPhase(p => p === 'paused' ? 'playing' : 'paused');
    if (phase === 'paused') {
      // resume
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const handleRestart = () => {
    clearInterval(intervalRef.current);
    initDeck();
    setPhase('setup');
    setAutoPlay(false);
  };

  return (
    <div className="screen" style={{ background: 'var(--navy)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(intervalRef.current); setMode('classic-menu'); }}>←</button>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 2 }}>
          CALLER MODE
        </div>
        <button className="btn btn-icon" onClick={handleRestart} title="Restart">↺</button>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 20px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {called.length} / {deck.length} called
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {remaining.length} left
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(called.length / deck.length) * 100}%` }} />
        </div>
        {autoPlay && phase === 'playing' && (
          <div style={{ marginTop: 6 }}>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 100 }}>
              <div style={{
                height: '100%', borderRadius: 100,
                background: timer < 1 ? 'var(--red)' : 'rgba(255,255,255,0.3)',
                width: `${(timer / speed) * 100}%`, transition: 'width 0.1s linear',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* SETUP */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📢</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--cream)', marginBottom: 8, textAlign: 'center' }}>
            READY TO CALL?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 32, maxWidth: 280 }}>
            Distribute tablas to players, then start calling cards one by one.
          </p>

          {/* Speed setting */}
          <div className="glass-card" style={{ width: '100%', maxWidth: 340, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
              Auto-call speed: <span style={{ color: 'var(--gold)' }}>{speed}s per card</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={speed}
              onChange={e => { setSpeed(parseFloat(e.target.value)); setTimer(parseFloat(e.target.value)); }}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>1s (fast)</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>15s (slow)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 340 }}>
            <button className="btn btn-gold" style={{ width: '100%', padding: '16px' }} onClick={() => { setAutoPlay(false); handleStart(); }}>
              ✋ Manual Mode (Tap Each Card)
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', padding: '16px' }} onClick={() => { setAutoPlay(true); handleStart(); }}>
              ▶ Auto-Call at {speed}s
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {(phase === 'playing' || phase === 'paused') && (
        <>
          {/* Big current card */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
            {current ? (
              <div style={{ animation: 'bounce-in 0.4s ease', textAlign: 'center' }}>
                {/* Card */}
                <div style={{
                  width: 200, background: 'white', borderRadius: 20,
                  padding: '24px 20px 16px', margin: '0 auto 20px',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: 10, left: 14, fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'rgba(0,0,0,0.3)' }}>
                    {current.id}
                  </div>
                  <div style={{ width: 140, height: 196, margin: '0 auto 12px', borderRadius: 12, overflow: 'hidden' }}>
                    {getPhotoUrl(current) ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img src={getPhotoUrl(current)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                        <div style={{ position: 'absolute', inset: 0, background: current.color + '40', mixBlendMode: 'multiply' }} />
                      </div>
                    ) : (
                      <img
                        src={`/cards/card-${current.id}.png`}
                        alt={current.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#1a1a1a', letterSpacing: 1, textAlign: 'center' }}>
                    {current.name.toUpperCase()}
                  </div>
                </div>

                {/* Riddle */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                  padding: '12px 20px', maxWidth: 300, margin: '0 auto',
                  fontSize: 15, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', textAlign: 'center',
                }}>
                  "{current.riddle}"
                </div>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>Press Next to call a card</div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: '12px 20px 32px', flexShrink: 0 }}>
            {/* Paused indicator */}
            {phase === 'paused' && (
              <div style={{ textAlign: 'center', marginBottom: 12, color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>
                ⏸ PAUSED — Verify winner?
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
              <button className="btn btn-icon" onClick={handlePause} style={{ width: 52, height: 52, fontSize: 22 }}>
                {phase === 'paused' ? '▶' : '⏸'}
              </button>
              <button
                className="btn btn-gold"
                onClick={callNext}
                style={{ flex: 1, padding: '16px', fontSize: 18, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2 }}
                disabled={autoPlay && phase === 'playing'}
              >
                {autoPlay && phase === 'playing' ? `AUTO · ${timer.toFixed(1)}s` : '→ SIGUIENTE'}
              </button>
              <button className="btn btn-icon" onClick={() => setPhase('winner-check')} style={{ width: 52, height: 52, fontSize: 22 }} title="Someone called Lotería!">
                🏆
              </button>
            </div>

            {/* Called cards row */}
            {called.length > 1 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {called.slice(1, 10).map((c, i) => (
                  <div key={c.id} style={{
                    width: 40, height: 52, background: 'white',
                    borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                    opacity: 1 - i * 0.1, padding: 2,
                  }}>
                    {getPhotoUrl(c) ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img src={getPhotoUrl(c)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                        <div style={{ position: 'absolute', inset: 0, background: c.color + '40', mixBlendMode: 'multiply' }} />
                      </div>
                    ) : (
                      <img src={`/cards/card-${c.id}.png`} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🃏</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--gold)', marginBottom: 8 }}>ALL CARDS CALLED!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, textAlign: 'center' }}>
            All {deck.length} cards have been called.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={handleRestart}>↺ New Game</button>
            <button className="btn btn-ghost" onClick={() => setMode('classic-menu')}>← Menu</button>
          </div>
        </div>
      )}

      {/* WINNER CHECK */}
      {phase === 'winner-check' && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--gold)', marginBottom: 8 }}>
              ¡ALGUIEN GANÓ!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: 14 }}>
              Verify the winner's tabla against the called cards, then choose:
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => { initDeck(); setPhase('setup'); }}>
                🎉 Valid! Start New Game
              </button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setPhase('playing')}>
                ❌ Invalid — Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
