import { useState, useEffect, useRef, useCallback } from 'react';
import { CardDisplay } from '../components/CardDisplay';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle, createBoard } from '../data/decks';
import { speakCardQuick } from '../utils/voice';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import Confetti from 'react-confetti';

export default function LightningRoundScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [phase, setPhase] = useState('setup');
  const [countdown, setCountdown] = useState(3);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerPct, setTimerPct] = useState(100);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Use refs for game state to avoid stale closures completely
  const boardRef = useRef([]);
  const currentCardRef = useRef(null);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const cardsCompletedRef = useRef(0);
  const phaseRef = useRef('setup');
  const cardTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const tappedBoardIds = useRef(new Set());

  // Display state synced from refs
  const [boardDisplay, setBoardDisplay] = useState([]);
  const [currentCardDisplay, setCurrentCardDisplay] = useState(null);
  const [livesDisplay, setLivesDisplay] = useState(3);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  const showFeedback = (msg, color) => {
    clearTimeout(feedbackTimerRef.current);
    setFeedback({ msg, color });
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 800);
  };

  const endGame = useCallback((won) => {
    clearInterval(cardTimerRef.current);
    phaseRef.current = won ? 'won' : 'lost';
    if (won) {
      setShowConfetti(true);
      addPesos(100 + scoreRef.current);
      setPhase('won');
    } else {
      setPhase('lost');
    }
  }, [addPesos]);

  const callNextCard = useCallback(() => {
    clearInterval(cardTimerRef.current);
    if (phaseRef.current !== 'playing') return;

    const board = boardRef.current;
    const boardIds = board.map(c => c.id);

    // Build a fresh pool from the full deck each time, weighted toward board cards
    const onBoard = deck.filter(c => boardIds.includes(c.id));
    const offBoard = deck.filter(c => !boardIds.includes(c.id));

    // 65% chance pick from board cards
    const pool = (Math.random() < 0.65 && onBoard.length > 0) ? onBoard : deck;
    const next = pool[Math.floor(Math.random() * pool.length)];

    currentCardRef.current = next;
    setCurrentCardDisplay(next);
    setTimerPct(100);
    speakCardQuick(next);

    // Speed up over time
    const speed = Math.max(1.5, 3 - Math.floor(scoreRef.current / 300) * 0.3);

    // Countdown timer
    let elapsed = 0;
    const interval = 50;
    cardTimerRef.current = setInterval(() => {
      elapsed += interval;
      const pct = Math.max(0, 100 - (elapsed / (speed * 1000)) * 100);
      setTimerPct(pct);

      if (elapsed >= speed * 1000) {
        clearInterval(cardTimerRef.current);
        // Time's up — check if card was on board
        const isOnBoard = boardRef.current.find(c => c.id === currentCardRef.current?.id);
        if (isOnBoard) {
          // Missed it — lose a life
          hapticError();
          livesRef.current -= 1;
          setLivesDisplay(livesRef.current);
          streakRef.current = 0;
          if (livesRef.current <= 0) {
            endGame(false);
          } else {
            showFeedback('MISSED! -❤️', '#ff4444');
            setTimeout(() => callNextCard(), 400);
          }
        } else {
          // Not on board — correct to ignore
          setTimeout(() => callNextCard(), 200);
        }
      }
    }, interval);
  }, [deck, endGame]);

  const startGame = useCallback(() => {
    clearInterval(cardTimerRef.current);
    const newBoard = createBoard(deck);
    boardRef.current = newBoard;
    setBoardDisplay(newBoard);
    currentCardRef.current = null;
    setCurrentCardDisplay(null);
    livesRef.current = 3;
    setLivesDisplay(3);
    scoreRef.current = 0;
    setScoreDisplay(0);
    streakRef.current = 0;
    cardsCompletedRef.current = 0;
    tappedBoardIds.current = new Set();
    setCardsCompleted(0);
    setShowConfetti(false);
    phaseRef.current = 'countdown';
    setTimerPct(100);
  }, [deck]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      phaseRef.current = 'playing';
      setPhase('playing');
      setTimeout(() => callNextCard(), 300);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, callNextCard]);

  const handleTap = (idx) => {
    if (phaseRef.current !== 'playing' || !currentCardRef.current) return;
    const tappedCard = boardRef.current[idx];
    if (!tappedCard) return;

    clearInterval(cardTimerRef.current);

    if (tappedCard.id === currentCardRef.current.id) {
      // Correct!
      hapticLight();
      streakRef.current += 1;
      const pts = 100 + (streakRef.current > 1 ? streakRef.current * 20 : 0);
      scoreRef.current += pts;
      setScoreDisplay(scoreRef.current);
      cardsCompletedRef.current += 1;
      setCardsCompleted(cardsCompletedRef.current);
      tappedBoardIds.current.add(tappedCard.id);
      // Win: tapped every unique card on the board at least once
      if (tappedBoardIds.current.size >= boardRef.current.length) {
        endGame(true);
        return;
      }
      showFeedback(streakRef.current > 2 ? `🔥 x${streakRef.current} +${pts}` : `+${pts}`, 'var(--gold)');
      setTimeout(() => callNextCard(), 200);
    } else {
      // Wrong!
      hapticError();
      streakRef.current = 0;
      scoreRef.current = Math.max(0, scoreRef.current - 50);
      setScoreDisplay(scoreRef.current);
      livesRef.current -= 1;
      setLivesDisplay(livesRef.current);
      if (livesRef.current <= 0) {
        endGame(false);
      } else {
        showFeedback('WRONG! -❤️', '#ff4444');
        setTimeout(() => callNextCard(), 400);
      }
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(cardTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
      {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={250} />}

      {/* Header */}
      <div style={{ padding: '12px 16px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(cardTimerRef.current); setMode('mini-games'); }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>MINI GAME</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>⚡ LIGHTNING ROUND</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18 }}>{'❤️'.repeat(Math.max(0, livesDisplay))}{'🖤'.repeat(Math.max(0, 3 - livesDisplay))}</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', lineHeight: 1 }}>{scoreDisplay}</div>
        </div>
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>⚡</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: '#F5C842', marginBottom: 12 }}>LIGHTNING ROUND</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 300, lineHeight: 1.7, marginBottom: 32 }}>
            A card gets called — find it on your board and <strong style={{ color: 'white' }}>tap it fast!</strong>
            <br/><br/>Miss 3 and it's over. Cards speed up as you score!
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
            onClick={() => { startGame(); setCountdown(3); setPhase('countdown'); }}>
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
          {/* Current card banner */}
          <div style={{ padding: '4px 12px 6px', flexShrink: 0 }}>
            {currentCardDisplay ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: timerPct < 30 ? 'rgba(214,48,48,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${timerPct < 30 ? 'rgba(214,48,48,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14, padding: '8px 12px', transition: 'all 0.3s',
              }}>
                <div style={{ width: 44, background: 'white', borderRadius: 8, flexShrink: 0, overflow: 'hidden', padding: 2 }}>
                  <CardDisplay card={currentCardDisplay} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 1 }}>
                    {currentCardDisplay.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                    {boardRef.current.find(c => c.id === currentCardDisplay.id) ? '👆 TAP IT ON YOUR BOARD!' : '⬇️ Not on your board — ignore it'}
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 100 }}>
                    <div style={{
                      height: '100%', borderRadius: 100,
                      background: timerPct < 30 ? '#ff4444' : timerPct < 60 ? 'var(--gold)' : 'var(--teal)',
                      width: `${timerPct}%`, transition: 'width 0.05s linear',
                    }} />
                  </div>
                </div>
              </div>
            ) : <div style={{ height: 60 }} />}
          </div>

          {/* Board — 4x4 grid fitting screen */}
          <div style={{ flex: 1, padding: '0 8px 8px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 5, flex: 1 }}>
              {boardDisplay.map((card, idx) => {
                const isTarget = currentCardDisplay && card.id === currentCardDisplay.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleTap(idx)}
                    style={{
                      background: 'white',
                      borderRadius: 8,
                      padding: '3px 2px 2px',
                      border: isTarget ? `2.5px solid ${timerPct < 30 ? '#ff4444' : 'var(--gold)'}` : '1.5px solid #ddd',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      cursor: 'pointer', overflow: 'hidden',
                      boxShadow: isTarget ? `0 0 12px ${timerPct < 30 ? 'rgba(255,68,68,0.5)' : 'rgba(245,200,66,0.5)'}` : 'none',
                      transform: isTarget ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <CardDisplay card={card} />
                    </div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 7, color: '#1a1a1a', textAlign: 'center', letterSpacing: 0.3, lineHeight: 1, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '1px 2px' }}>
                      {card.name.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Feedback toast */}
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
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--cream)', marginBottom: 8 }}>{scoreDisplay.toLocaleString()}</div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>+{100 + scoreDisplay} 🪙 earned!</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => { startGame(); setCountdown(3); setPhase('countdown'); }}>↺ Again</button>
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
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--cream)', marginBottom: 24 }}>{scoreDisplay.toLocaleString()} pts</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => { startGame(); setCountdown(3); setPhase('countdown'); }}>Try Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
