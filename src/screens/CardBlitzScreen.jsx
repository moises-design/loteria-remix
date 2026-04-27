import { useState, useEffect, useRef, useCallback } from 'react';
import { getCardImageUrl } from '../data/cardArt';
import { CardDisplay } from '../components/CardDisplay';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { speakCard } from '../utils/voice';
import { hapticLight, hapticMedium, hapticError, hapticSuccess } from '../utils/haptics';
import Confetti from 'react-confetti';

const TARGET_SCORE = 1000;
const FALL_DURATION = 2800; // ms for card to fall

export default function CardBlitzScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [phase, setPhase] = useState('setup');
  const [targetCard, setTargetCard] = useState(null);
  const [fallingCards, setFallingCards] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const spawnRef = useRef(null);
  const feedbackRef = useRef(null);
  const cardIdRef = useRef(0);
  const deckQueueRef = useRef([]);
  const phaseRef = useRef('setup');
  const scoreRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getNextTarget = useCallback(() => {
    if (deckQueueRef.current.length === 0) {
      deckQueueRef.current = shuffle([...deck]);
    }
    return deckQueueRef.current.shift();
  }, [deck]);

  const spawnCard = useCallback((forceWrong = false) => {
    const isTarget = !forceWrong && Math.random() < 0.45; // 45% chance it's the target
    const card = isTarget ? targetCard : shuffle(deck.filter(c => c.id !== targetCard?.id))[0];
    if (!card) return;

    const lane = Math.floor(Math.random() * 4); // 0-3 columns
    const uid = ++cardIdRef.current;

    setFallingCards(prev => [...prev, {
      uid, card, isTarget, lane,
      startTime: Date.now(),
    }]);

    // Remove card after it falls off screen
    setTimeout(() => {
      if (phaseRef.current !== 'playing') {
        setFallingCards(prev => prev.filter(c => c.uid !== uid));
        return;
      }
      setFallingCards(prev => {
        const stillThere = prev.find(c => c.uid === uid);
        if (stillThere && stillThere.isTarget) {
          // Target card escaped!
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              clearInterval(spawnRef.current);
              setPhase('lost');
            }
            return newLives;
          });
          showFeed('MISSED! -❤️', '#ff4444');
        }
        return prev.filter(c => c.uid !== uid);
      });
    }, FALL_DURATION + 200);
  }, [targetCard, deck]);

  const startGame = () => {
    deckQueueRef.current = shuffle([...deck]);
    const first = deckQueueRef.current.shift();
    setTargetCard(first);
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setStreak(0);
    setFallingCards([]);
    setShowConfetti(false);
    cardIdRef.current = 0;
    setPhase('countdown');
    setCountdown(3);
  };

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Speak target card when it changes
  useEffect(() => {
    if (targetCard && phase === 'playing') speakCard(targetCard);
  }, [targetCard, phase]);

  // Spawn cards — only restart on phase/target change, not every score tick
  useEffect(() => {
    if (phase !== 'playing' || !targetCard) return;
    const speed = Math.max(600, 1200 - Math.floor(scoreRef.current / 200) * 80);
    spawnRef.current = setInterval(() => {
      spawnCard();
    }, speed);
    return () => clearInterval(spawnRef.current);
  }, [phase, targetCard, spawnCard]);

  const handleTap = (uid) => {
    if (phaseRef.current !== 'playing') return;
    const card = fallingCards.find(c => c.uid === uid);
    if (!card) return;

    setFallingCards(prev => prev.filter(c => c.uid !== uid));

    if (card.isTarget) {
      hapticLight();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = 100 + (newStreak > 1 ? newStreak * 20 : 0);
      setScore(s => {
        const newScore = s + pts;
        scoreRef.current = newScore;
        if (newScore >= TARGET_SCORE) {
          clearInterval(spawnRef.current);
          setPhase('won');
          setShowConfetti(true);
          hapticSuccess();
          addPesos(150 + Math.floor(newScore / 50));
        }
        return newScore;
      });
      showFeed(newStreak > 2 ? `🔥 x${newStreak}  +${pts}` : `+${pts}`, 'var(--gold)');
      // Change target card after every 5 correct
      if (newStreak % 5 === 0) {
        const next = getNextTarget();
        setTargetCard(next);
        showFeed(`NEW CARD: ${next.name.toUpperCase()}`, '#4ecba0');
      }
    } else {
      hapticError();
      setStreak(0);
      setScore(s => {
        const newScore = Math.max(0, s - 50);
        scoreRef.current = newScore;
        return newScore;
      });
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) { clearInterval(spawnRef.current); setPhase('lost'); }
        return newLives;
      });
      showFeed('WRONG! -50', '#ff4444');
    }
  };

  const showFeed = (msg, color) => {
    clearTimeout(feedbackRef.current);
    setFeedback({ msg, color });
    feedbackRef.current = setTimeout(() => setFeedback(null), 800);
  };

  const scorePct = Math.min(100, (score / TARGET_SCORE) * 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0D1B3E, #060e20)', overflow: 'hidden', position: 'relative' }}>
      {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={300} />}

      {/* Header */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, position: 'relative' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(spawnRef.current); setMode('mini-games'); }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>MINI GAME</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>🎯 CARD BLITZ</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16 }}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--gold)', lineHeight: 1 }}>{score}</div>
        </div>
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--gold)', marginBottom: 12 }}>CARD BLITZ</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 280, lineHeight: 1.7, marginBottom: 32 }}>
            Cards fall from the top. <strong style={{ color: 'white' }}>Tap the target card</strong> — dodge the wrong ones! 
            Reach {TARGET_SCORE} points to win. 3 wrong taps and it's over. Cards speed up!
          </p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            {[['🎯 tap', 'target'], ['❌ dodge', 'wrong'], ['🔥 combo', 'bonus']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-gold" style={{ width: '100%', maxWidth: 320, padding: '18px' }} onClick={startGame}>
            🎯 START BLITZ!
          </button>
        </div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 140, color: 'var(--gold)', animation: 'bounce-in 0.3s ease' }}>
            {countdown > 0 ? countdown : '🎯'}
          </div>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && (
        <>
          {/* Target card display */}
          <div style={{ padding: '8px 16px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 12, padding: '8px 14px' }}>
              <div style={{ fontSize: 11, color: 'rgba(245,200,66,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>TAP →</div>
              {targetCard && <div style={{ width: 32, flexShrink: 0 }}><CardDisplay card={targetCard} /></div>}
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 1 }}>
                {targetCard?.name.toUpperCase()}
              </div>
              {streak > 1 && (
                <div style={{ marginLeft: 'auto', background: 'rgba(214,48,48,0.2)', borderRadius: 100, padding: '2px 10px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: '#ff8080' }}>
                  🔥{streak}
                </div>
              )}
            </div>

            {/* Score progress */}
            <div style={{ marginTop: 6, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 100 }}>
              <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, var(--gold), #f09000)', width: `${scorePct}%`, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>0</span>
              <span style={{ fontSize: 10, color: 'rgba(245,200,66,0.6)', fontWeight: 700 }}>GOAL: {TARGET_SCORE}</span>
            </div>
          </div>

          {/* Falling area */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Grid lines for lanes */}
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${(i / 4) * 100}%`, width: 1,
                background: 'rgba(255,255,255,0.04)',
              }} />
            ))}

            {fallingCards.map(fc => {
              const laneWidth = 25;
              const left = fc.lane * laneWidth + laneWidth / 2;
              return (
                <div
                  key={fc.uid}
                  onClick={() => handleTap(fc.uid)}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: '-80px',
                    transform: 'translateX(-50%)',
                    animation: `fall ${FALL_DURATION}ms linear forwards`,
                    cursor: 'pointer',
                    zIndex: 5,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 64, background: 'white',
                    borderRadius: 10, padding: '6px 4px 4px',
                    border: fc.isTarget ? '2.5px solid var(--gold)' : '1.5px solid #ddd',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    boxShadow: fc.isTarget ? '0 0 12px rgba(245,200,66,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    <CardDisplay card={fc.card} />
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 8, color: '#1a1a1a', textAlign: 'center', marginTop: 3, lineHeight: 1, letterSpacing: 0.3, whiteSpace: 'pre-line' }}>
                      {fc.card.name.split(' ').map(w => w.toUpperCase()).join('\n')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: feedback.color,
          textShadow: '0 2px 10px rgba(0,0,0,0.6)', animation: 'slideUp 0.2s ease',
          pointerEvents: 'none', zIndex: 50, whiteSpace: 'nowrap',
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Won */}
      {phase === 'won' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>🎯</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--gold)', letterSpacing: 2 }}>BLITZ COMPLETE!</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--cream)', margin: '12px 0' }}>{score} pts</div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 28 }}>+{150 + Math.floor(score / 50)} 🪙 earned!</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={startGame}>↺ Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}

      {/* Lost */}
      {phase === 'lost' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>💀</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--red)', letterSpacing: 2 }}>GAME OVER!</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--cream)', margin: '12px 0' }}>{score} / {TARGET_SCORE}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>Need {TARGET_SCORE - score} more points next time</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={startGame}>Try Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fall {
          from { top: -80px; }
          to { top: 110%; }
        }
      `}</style>
    </div>
  );
}
