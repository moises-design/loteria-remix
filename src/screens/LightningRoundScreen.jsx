import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle, createBoard } from '../data/decks';
import { speakCard, speakText } from '../utils/voice';
import { hapticLight, hapticHeavy, hapticSuccess, hapticError } from '../utils/haptics';
import Confetti from 'react-confetti';

export default function LightningRoundScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [board, setBoard] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup | countdown | playing | won | lost
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3);
  const [cardTimeLimit, setCardTimeLimit] = useState(3);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const cardTimerRef = useRef(null);
  const feedbackRef = useRef(null);

  const initGame = useCallback(() => {
    const newBoard = createBoard(deck);
    const rest = shuffle(deck).filter(c => !newBoard.find(b => b.id === c.id));
    setBoard(newBoard);
    setRemaining(rest);
    setLives(3);
    setScore(0);
    setStreak(0);
    setCardsCompleted(0);
    setShowConfetti(false);
    setCurrentCard(null);
  }, [deck]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Call next card when playing
  const callNext = useCallback(() => {
    setRemaining(prev => {
      // Find a card that's on the board
      const boardIds = board.map(c => c.id);
      const onBoard = prev.filter(c => boardIds.includes(c.id));
      const offBoard = prev.filter(c => !boardIds.includes(c.id));

      // Mix: 70% chance it's on the board (makes game interesting)
      const pool = Math.random() < 0.7 && onBoard.length > 0 ? onBoard : prev;
      if (pool.length === 0) {
        // Won — survived all cards
        setPhase('won');
        setShowConfetti(true);
        addPesos(100 + score);
        return prev;
      }

      const [next, ...rest] = pool;
      const newRemaining = prev.filter(c => c !== next);

      setCurrentCard(next);
      speakCard(next);

      // Speed increases as score goes up
      const speed = Math.max(1.5, 3 - Math.floor(score / 300) * 0.3);
      setCardTimeLimit(speed);
      setTimeLeft(speed);

      return newRemaining;
    });
  }, [board, score, addPesos]);

  // Card countdown timer
  useEffect(() => {
    if (phase !== 'playing' || !currentCard) return;
    clearInterval(cardTimerRef.current);
    cardTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          // Time's up on this card — check if it was on board
          const isOnBoard = board.find(c => c.id === currentCard.id);
          if (isOnBoard) {
            // Was on board and they didn't tap — lose a life
            hapticError();
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                clearInterval(cardTimerRef.current);
                setPhase('lost');
              } else {
                showFeedback('MISSED! -1 ❤️', '#ff4444');
                setStreak(0);
                callNext();
              }
              return newLives;
            });
          } else {
            // Not on board — correct to ignore, keep going
            callNext();
          }
          return 0;
        }
        return parseFloat((t - 0.05).toFixed(2));
      });
    }, 50);
    return () => clearInterval(cardTimerRef.current);
  }, [phase, currentCard, board, callNext]);

  const handleTap = (idx) => {
    if (phase !== 'playing' || !currentCard) return;
    const tappedCard = board[idx];
    clearInterval(cardTimerRef.current);

    if (tappedCard.id === currentCard.id) {
      // Correct!
      hapticLight();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = 100 + (newStreak > 1 ? newStreak * 20 : 0);
      setScore(s => s + pts);
      setCardsCompleted(c => c + 1);
      showFeedback(newStreak > 2 ? `🔥 x${newStreak} +${pts}` : `+${pts}`, 'var(--gold)');
      callNext();
    } else {
      // Wrong card
      hapticError();
      setStreak(0);
      setScore(s => Math.max(0, s - 50));
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          clearInterval(cardTimerRef.current);
          setPhase('lost');
        } else {
          showFeedback('WRONG! -1 ❤️', '#ff4444');
          callNext();
        }
        return newLives;
      });
    }
  };

  const showFeedback = (msg, color) => {
    clearTimeout(feedbackRef.current);
    setFeedback({ msg, color });
    feedbackRef.current = setTimeout(() => setFeedback(null), 800);
  };

  const timerPct = (timeLeft / cardTimeLimit) * 100;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={250} />}

      {/* Header */}
      <div style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(cardTimerRef.current); setMode('mini-games'); }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>MINI GAME</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>⚡ LIGHTNING ROUND</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18 }}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', lineHeight: 1 }}>{score}</div>
        </div>
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>⚡</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: '#F5C842', marginBottom: 12 }}>LIGHTNING ROUND</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 300, lineHeight: 1.7, marginBottom: 32 }}>
            A card gets called — find it on your board and <strong style={{ color: 'white' }}>tap it fast!</strong> 
            <br/><br/>Miss 3 cards and it's game over. The cards speed up as you score more. Survive as long as you can!
          </p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            {[['❤️ x3', 'lives'], ['⚡ 3s', 'per card'], ['🔥 combo', 'bonus']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-gold" style={{ width: '100%', maxWidth: 320, padding: '18px', fontSize: 18 }}
            onClick={() => { initGame(); setPhase('countdown'); setCountdown(3); }}>
            ⚡ START!
          </button>
        </div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 140, color: 'var(--gold)', lineHeight: 1, animation: 'bounce-in 0.3s ease' }}>
            {countdown > 0 ? countdown : '⚡'}
          </div>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && (
        <>
          {/* Current card */}
          <div style={{ padding: '4px 16px 8px', flexShrink: 0 }}>
            {currentCard ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: timerPct < 30 ? 'rgba(214,48,48,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${timerPct < 30 ? 'rgba(214,48,48,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14, padding: '10px 14px', transition: 'all 0.3s',
              }}>
                <div style={{
                  width: 56, height: 72, background: 'white', borderRadius: 8,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, gap: 2,
                }}>
                  <div style={{ fontSize: 28 }}>{currentCard.emoji}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 8, color: '#1a1a1a', textAlign: 'center', padding: '0 2px', lineHeight: 1 }}>
                    {currentCard.name.toUpperCase()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--gold)', letterSpacing: 1 }}>
                    {currentCard.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                    {board.find(c => c.id === currentCard.id) ? '👆 TAP IT ON YOUR BOARD!' : '⬇️ Not on your board'}
                  </div>
                  {/* Card timer */}
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100 }}>
                    <div style={{
                      height: '100%', borderRadius: 100,
                      background: timerPct < 30 ? '#ff4444' : timerPct < 60 ? 'var(--gold)' : 'var(--teal)',
                      width: `${timerPct}%`, transition: 'width 0.05s linear, background 0.3s',
                    }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: 64 }} />
            )}
          </div>

          {/* Board */}
          <div style={{ flex: 1, padding: '0 10px 10px', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%' }}>
              {board.map((card, idx) => {
                const isTarget = currentCard && card.id === currentCard.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleTap(idx)}
                    style={{
                      background: isTarget && timerPct < 30 ? '#fff5f5' : 'white',
                      borderRadius: 10, padding: '6px 4px 4px',
                      border: isTarget ? `2.5px solid ${timerPct < 30 ? '#ff4444' : 'var(--gold)'}` : '1.5px solid #ddd',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      cursor: 'pointer', position: 'relative',
                      boxShadow: isTarget ? `0 0 12px ${timerPct < 30 ? 'rgba(255,68,68,0.4)' : 'rgba(245,200,66,0.4)'}` : 'none',
                      transition: 'all 0.15s',
                      animation: isTarget && timerPct < 30 ? 'pulse-ring 0.5s ease infinite' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 3 }}>{card.emoji}</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 9, color: '#1a1a1a', textAlign: 'center', letterSpacing: 0.3, lineHeight: 1 }}>
                      {card.name.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          position: 'fixed', top: '25%', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: feedback.color,
          textShadow: '0 2px 10px rgba(0,0,0,0.5)', animation: 'slideUp 0.2s ease',
          pointerEvents: 'none', zIndex: 50, whiteSpace: 'nowrap',
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Won */}
      {phase === 'won' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>⚡</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--gold)', letterSpacing: 2 }}>LEGEND!</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 24px' }}>You survived the full deck!</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--cream)', marginBottom: 8 }}>{score.toLocaleString()}</div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>+{100 + score} 🪙 earned!</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => { initGame(); setPhase('countdown'); setCountdown(3); }}>↺ Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}

      {/* Lost */}
      {phase === 'lost' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>💀</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--red)', letterSpacing: 2 }}>3 STRIKES!</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 16px' }}>You got {cardsCompleted} cards right</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--cream)', marginBottom: 24 }}>{score.toLocaleString()} pts</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => { initGame(); setPhase('countdown'); setCountdown(3); }}>Try Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
