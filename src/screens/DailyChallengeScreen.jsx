import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, checkWin } from '../data/decks';
import { LoteriaCard } from '../components/LoteriaCard';
import { SubmitScore } from '../components/SubmitScore';
import {
  getDailyChallenge, getDailyRecord, saveDailyRecord, hasTodayRecord, todayStr,
} from '../utils/daily';
import { hapticLight, hapticSuccess, hapticError, soundMark, soundWin, soundError, soundCardFlip } from '../utils/haptics';
import Confetti from 'react-confetti';

const DAILY_SPEED = 5;

const soundEnabled = () => localStorage.getItem('sound') !== 'off';
const hapticsEnabled = () => localStorage.getItem('haptics') !== 'off';

function formatDateNice(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function CountdownToMidnight() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  const diff = Math.max(0, next.getTime() - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  return (
    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--gold)', letterSpacing: 3, lineHeight: 1 }}>
      {h}:{m}:{s}
    </div>
  );
}

export default function DailyChallengeScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const alreadyPlayed = hasTodayRecord();
  const existingRecord = getDailyRecord();

  const [board, setBoard] = useState([]);
  const [pool, setPool] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [calledCards, setCalledCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [remaining, setRemaining] = useState([]);
  const [phase, setPhase] = useState(alreadyPlayed ? 'already' : 'countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [winLine, setWinLine] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(DAILY_SPEED);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [dateStr, setDateStr] = useState(todayStr());
  const timerRef = useRef(null);
  const feedbackRef = useRef(null);
  const savedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(timerRef.current);
      clearTimeout(feedbackRef.current);
    };
  }, []);

  const initGame = useCallback(() => {
    const challenge = getDailyChallenge(deck);
    setBoard(challenge.board);
    setPool(challenge.pool);
    setRemaining(challenge.pool);
    setDateStr(challenge.dateStr);
    setMarked(new Set());
    setCalledCards([]);
    setCurrentCard(null);
    setScore(0);
    setCombo(0);
    setWinLine(null);
    setShowConfetti(false);
    setTimer(DAILY_SPEED);
    savedRef.current = false;
  }, [deck]);

  useEffect(() => {
    if (alreadyPlayed) return;
    initGame();
  }, [alreadyPlayed, initGame]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const callNextCard = useCallback(() => {
    setRemaining(prev => {
      if (prev.length === 0) {
        clearInterval(timerRef.current);
        setPhase('lost');
        return prev;
      }
      const [next, ...rest] = prev;
      setCurrentCard(next);
      setCalledCards(c => [next, ...c].slice(0, 8));
      if (soundEnabled()) soundCardFlip();
      return rest;
    });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        const next = parseFloat((t - 0.1).toFixed(2));
        if (next <= 0) { callNextCard(); return DAILY_SPEED; }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase, callNextCard]);

  useEffect(() => {
    if (phase !== 'lost' || savedRef.current) return;
    savedRef.current = true;
    saveDailyRecord(score, 'lost');
  }, [phase, score]);

  useEffect(() => {
    if (phase !== 'won' || savedRef.current) return;
    savedRef.current = true;
    saveDailyRecord(score, 'won');
    addPesos(100 + Math.floor(score / 50));
  }, [phase, score, addPesos]);

  const showFeedback = (msg, color) => {
    clearTimeout(feedbackRef.current);
    setFeedback({ msg, color });
    feedbackRef.current = setTimeout(() => setFeedback(null), 1000);
  };

  const handleMarkCard = (idx) => {
    if (phase !== 'playing') return;
    const card = board[idx];
    if (marked.has(idx)) return;
    const isCalled = calledCards.some(c => c.id === card.id);
    if (!isCalled) {
      if (hapticsEnabled()) hapticError();
      if (soundEnabled()) soundError();
      setCombo(0);
      setScore(s => Math.max(0, s - 50));
      showFeedback('−50', '#ff6b6b');
      return;
    }
    if (hapticsEnabled()) hapticLight();
    if (soundEnabled()) soundMark();
    const newMarked = new Set(marked);
    newMarked.add(idx);
    setMarked(newMarked);
    const newCombo = combo + 1;
    setCombo(newCombo);
    const points = 100 + (newCombo > 1 ? newCombo * 25 : 0);
    setScore(s => s + points);
    if (newCombo >= 3) {
      showFeedback(`🔥 x${newCombo}  +${points}`, 'var(--gold)');
    } else {
      showFeedback(`+${points}`, '#4ecba0');
    }
    const win = checkWin(newMarked);
    if (win) {
      setWinLine(win);
      const finalScore = score + points + 500;
      setScore(finalScore);
      setShowConfetti(true);
      if (hapticsEnabled()) hapticSuccess();
      if (soundEnabled()) soundWin();
      clearInterval(timerRef.current);
      setPhase('won');
    }
  };

  if (phase === 'already') {
    const rec = existingRecord;
    return (
      <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
        <div style={{ padding: '16px 20px 0' }}>
          <button className="btn btn-icon" onClick={() => setMode('home')}>←</button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', minHeight: '70vh' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>📅</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 3, color: 'rgba(245,200,66,0.7)' }}>DAILY CHALLENGE</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--cream)', letterSpacing: 1, marginBottom: 4 }}>ALREADY PLAYED</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 14 }}>{formatDateNice(rec?.date || todayStr())}</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, marginBottom: 24, width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 }}>YOUR SCORE</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--gold)', lineHeight: 1, marginBottom: 8 }}>{(rec?.score || 0).toLocaleString()}</div>
            <div style={{ fontSize: 14, color: rec?.phase === 'won' ? '#4ecba0' : '#ff8080' }}>
              {rec?.phase === 'won' ? '🎉 You won!' : '😅 Better luck tomorrow'}
            </div>
          </div>
          <div style={{ marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Come back tomorrow!</div>
          <CountdownToMidnight />
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
            <button className="btn btn-gold" onClick={() => setMode('mini-games')}>🎯 Play Mini Games</button>
            <button className="btn btn-ghost" onClick={() => setMode('home')}>← Home</button>
          </div>
        </div>
      </div>
    );
  }

  const timerPct = (timer / DAILY_SPEED) * 100;
  const timerColor = timerPct < 20 ? '#ff4444' : timerPct < 40 ? 'var(--gold)' : 'var(--teal)';
  const callsMade = pool.length - remaining.length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
      {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={280} colors={['#F5C842','#D63030','#1D9E75','#E8529A','#FBF5E6']} />}

      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button className="btn btn-icon" style={{ width: 38, height: 38 }} onClick={() => { clearInterval(timerRef.current); setMode('home'); }}>←</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>📅 DAILY CHALLENGE</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--gold)', lineHeight: 1 }}>{score.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.5)', maxWidth: 90 }}>
            {formatDateNice(dateStr)}
          </div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 100, background: timerColor, width: `${timerPct}%`, transition: 'width 0.1s linear, background 0.3s ease' }} />
        </div>
      </div>

      <div style={{ padding: '8px 16px', flexShrink: 0 }}>
        {currentCard ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 14px' }}>
            <LoteriaCard card={currentCard} size="sm" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 1, lineHeight: 1, marginBottom: 3 }}>{currentCard.name.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{currentCard.riddle}"</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>{callsMade}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>CALLED</div>
            </div>
          </div>
        ) : (
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Get ready...</div>
        )}
      </div>

      {calledCards.length > 1 && (
        <div style={{ padding: '0 16px 6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
            {calledCards.slice(1).map((c, i) => <LoteriaCard key={`${c.id}-${i}`} card={c} size="xs" style={{ opacity: 0.7 - i * 0.08 }} />)}
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: '4px 10px 10px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%' }}>
          {board.map((card, idx) => (
            <LoteriaCard key={card.id} card={card} size="sm" marked={marked.has(idx)} winning={winLine?.includes(idx)} onClick={() => handleMarkCard(idx)} style={{ width: '100%' }} />
          ))}
        </div>
      </div>

      {feedback && (
        <div style={{ position: 'fixed', top: '28%', left: '50%', transform: 'translateX(-50%)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, letterSpacing: 2, color: feedback.color, textShadow: '0 2px 12px rgba(0,0,0,0.6)', animation: 'slideUp 0.25s ease', pointerEvents: 'none', zIndex: 50, whiteSpace: 'nowrap' }}>
          {feedback.msg}
        </div>
      )}

      {phase === 'countdown' && (
        <div className="modal-overlay">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: countdown > 0 ? 140 : 80, color: countdown > 0 ? 'var(--gold)' : '#4ecba0', lineHeight: 1, animation: 'bounce-in 0.3s ease', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              {countdown > 0 ? countdown : '¡YA!'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8 }}>📅 Daily Challenge</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>{formatDateNice(dateStr)} · {DAILY_SPEED}s per card</div>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="modal-overlay">
          <div className="modal anim-bounce-in">
            <div style={{ fontSize: 64, marginBottom: 4 }}>🎉</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, color: 'var(--gold)', letterSpacing: 3, lineHeight: 1 }}>¡LOTERÍA!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '8px 0 16px' }}>Daily Challenge — {formatDateNice(dateStr)}</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Final Score</span>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>{score.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Cards Called</span>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>{callsMade}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Pesos Earned</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>+{100 + Math.floor(score / 50)} 🪙</span>
              </div>
            </div>
            <SubmitScore gameMode="daily-challenge" score={score} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => setMode('mini-games')}>🎯 Mini Games</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode('home')}>← Home</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'lost' && (
        <div className="modal-overlay">
          <div className="modal anim-bounce-in">
            <div style={{ fontSize: 56, marginBottom: 8 }}>😅</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--red)', letterSpacing: 2 }}>DECK'S DONE!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '8px 0 4px' }}>The deck ran out before you got 4 in a line.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Come back tomorrow for a new challenge!</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--cream)', marginBottom: 16 }}>{score.toLocaleString()} pts</div>
            <SubmitScore gameMode="daily-challenge" score={score} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => setMode('mini-games')}>🎯 Mini Games</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode('home')}>← Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
