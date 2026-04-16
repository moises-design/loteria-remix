import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { speakCard } from '../utils/voice';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import Confetti from 'react-confetti';

const GRID_SIZES = {
  easy:   { pairs: 6,  cols: 3, label: 'Easy',   reward: 30  },
  medium: { pairs: 8,  cols: 4, label: 'Medium',  reward: 60  },
  hard:   { pairs: 12, cols: 4, label: 'Hard',    reward: 100 },
};

export default function MatchPairsScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [phase, setPhase] = useState('setup'); // setup | playing | won | lost
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatch, setLastMatch] = useState(null);
  const [wrongPair, setWrongPair] = useState([]);
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  const startGame = (diff) => {
    setDifficulty(diff);
    const cfg = GRID_SIZES[diff];
    const selected = shuffle([...deck]).slice(0, cfg.pairs);
    // Each card appears twice
    const doubled = shuffle([...selected, ...selected].map((c, i) => ({
      ...c,
      uid: `${c.id}-${i}`,
    })));
    setCards(doubled);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setTimeLeft(diff === 'easy' ? 90 : diff === 'medium' ? 75 : 60);
    setPhase('playing');
    setShowConfetti(false);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('lost');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleFlip = (uid) => {
    if (lockRef.current) return;
    if (flipped.includes(uid)) return;
    if (matched.has(uid)) return;
    if (flipped.length >= 2) return;

    const card = cards.find(c => c.uid === uid);
    hapticLight();
    speakCard(card);

    const newFlipped = [...flipped, uid];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      lockRef.current = true;
      const [uid1, uid2] = newFlipped;
      const card1 = cards.find(c => c.uid === uid1);
      const card2 = cards.find(c => c.uid === uid2);

      if (card1.id === card2.id) {
        // Match!
        setTimeout(() => {
          hapticSuccess();
          setLastMatch(card1.name);
          setTimeout(() => setLastMatch(null), 1200);
          const newMatched = new Set(matched);
          newMatched.add(uid1);
          newMatched.add(uid2);
          setMatched(newMatched);
          setFlipped([]);
          lockRef.current = false;

          // Check win
          if (newMatched.size === cards.length) {
            clearInterval(timerRef.current);
            setPhase('won');
            setShowConfetti(true);
            const cfg = GRID_SIZES[difficulty];
            const bonus = Math.floor(timeLeft * 0.5);
            addPesos(cfg.reward + bonus);
          }
        }, 300);
      } else {
        // No match
        setWrongPair([uid1, uid2]);
        hapticError();
        setTimeout(() => {
          setFlipped([]);
          setWrongPair([]);
          lockRef.current = false;
        }, 900);
      }
    }
  };

  const cfg = difficulty ? GRID_SIZES[difficulty] : null;
  const timerPct = cfg ? (timeLeft / (difficulty === 'easy' ? 90 : difficulty === 'medium' ? 75 : 60)) * 100 : 100;
  const timerColor = timerPct < 20 ? '#ff4444' : timerPct < 40 ? 'var(--gold)' : 'var(--teal)';
  const stars = moves === 0 ? 3 : matched.size === cards.length
    ? moves <= cfg?.pairs + 2 ? 3 : moves <= cfg?.pairs + 6 ? 2 : 1
    : 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={250} colors={['#F5C842','#D63030','#1D9E75','#E8529A']} />}

      {/* Header */}
      <div style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(timerRef.current); setMode('mini-games'); }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>MINI GAME</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>MATCH PAIRS</div>
        </div>
        {phase === 'playing' ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: timerColor, lineHeight: 1 }}>{timeLeft}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{moves} moves</div>
          </div>
        ) : <div style={{ width: 44 }} />}
      </div>

      {/* Timer bar */}
      {phase === 'playing' && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', margin: '0 16px', borderRadius: 100, flexShrink: 0 }}>
          <div style={{ height: '100%', borderRadius: 100, background: timerColor, width: `${timerPct}%`, transition: 'width 1s linear, background 0.3s' }} />
        </div>
      )}

      {/* Setup */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🃏</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--gold)', marginBottom: 8, textAlign: 'center' }}>MATCH PAIRS</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
            Flip cards to find matching pairs. Match all pairs before time runs out. Fewer moves = more pesos!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            {Object.entries(GRID_SIZES).map(([key, val]) => (
              <button key={key} className="btn" onClick={() => startGame(key)} style={{
                padding: '18px 24px', borderRadius: 16, justifyContent: 'space-between',
                background: key === 'easy' ? 'rgba(29,158,117,0.2)' : key === 'medium' ? 'rgba(245,200,66,0.15)' : 'rgba(214,48,48,0.2)',
                border: `1px solid ${key === 'easy' ? 'rgba(29,158,117,0.4)' : key === 'medium' ? 'rgba(245,200,66,0.3)' : 'rgba(214,48,48,0.35)'}`,
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'white', letterSpacing: 1 }}>{val.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{val.pairs} pairs · {key === 'easy' ? '90s' : key === 'medium' ? '75s' : '60s'}</div>
                </div>
                <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 15 }}>+{val.reward} 🪙</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Match feedback toast */}
      {lastMatch && (
        <div style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--teal)', color: 'white', borderRadius: 100,
          padding: '10px 24px', fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 20, letterSpacing: 1, zIndex: 50, animation: 'bounce-in 0.2s ease',
          whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          ✓ {lastMatch.toUpperCase()}
        </div>
      )}

      {/* Grid */}
      {phase === 'playing' && (
        <div style={{ flex: 1, padding: '8px 12px 12px', display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
            gap: 8, width: '100%',
          }}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.uid) || matched.has(card.uid);
              const isMatched = matched.has(card.uid);
              const isWrong = wrongPair.includes(card.uid);
              return (
                <div
                  key={card.uid}
                  onClick={() => handleFlip(card.uid)}
                  style={{
                    aspectRatio: '3/4', borderRadius: 10, cursor: 'pointer',
                    position: 'relative', transition: 'transform 0.3s ease',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Back face */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 10,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #1D4E8F, #0a2545)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    🎴
                  </div>
                  {/* Front face */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 10,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: isMatched ? '#e8f5e9' : isWrong ? '#ffebee' : 'white',
                    border: `2px solid ${isMatched ? '#4caf50' : isWrong ? '#ef5350' : '#ddd'}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '4px 3px',
                    boxShadow: isMatched ? '0 0 12px rgba(76,175,80,0.4)' : 'none',
                  }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>{card.emoji}</div>
                    <div style={{
                      fontFamily: 'Bebas Neue, sans-serif', fontSize: 9,
                      color: '#1a1a1a', textAlign: 'center', marginTop: 3,
                      letterSpacing: 0.3, lineHeight: 1.1,
                    }}>
                      {card.name.toUpperCase()}
                    </div>
                    {isMatched && (
                      <div style={{ position: 'absolute', top: 3, right: 4, fontSize: 10 }}>✓</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Won */}
      {phase === 'won' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>🎉</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--gold)', letterSpacing: 2, marginBottom: 8 }}>¡MATCHED!</div>
          <div style={{ fontSize: 32, marginBottom: 16 }}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 24, width: '100%', maxWidth: 300 }}>
            {[['Moves', moves], ['Time left', `${timeLeft}s`], ['Pesos earned', `+${cfg.reward + Math.floor(timeLeft * 0.5)} 🪙`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 700, color: k === 'Pesos earned' ? 'var(--gold)' : 'var(--cream)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => startGame(difficulty)}>↺ Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}

      {/* Lost */}
      {phase === 'lost' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>⏰</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--red)', letterSpacing: 2, marginBottom: 8 }}>TIME'S UP!</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            Matched {matched.size / 2} of {cfg.pairs} pairs
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => startGame(difficulty)}>Try Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
