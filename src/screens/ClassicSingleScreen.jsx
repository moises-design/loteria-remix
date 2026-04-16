import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle, createBoard, checkWin } from '../data/decks';
import { LEVEL_CONFIGS } from './ClassicMenuScreen';
import { LoteriaCard } from '../components/LoteriaCard';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, soundMark, soundCombo, soundWin, soundError, soundCardFlip, soundTick } from '../utils/haptics';
import Confetti from 'react-confetti';

const soundEnabled = () => localStorage.getItem('sound') !== 'off';
const hapticsEnabled = () => localStorage.getItem('haptics') !== 'off';

export default function ClassicSingleScreen() {
  const { setMode, pesos, addPesos, selectedLevel, completeLevel, activeDeck } = useGameStore();
  const config = LEVEL_CONFIGS.find(l => l.level === selectedLevel) || LEVEL_CONFIGS[0];
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [board, setBoard] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [calledCards, setCalledCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [remaining, setRemaining] = useState([]);
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [winLine, setWinLine] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(config.speed);
  const [pulsingBoard, setPulsingBoard] = useState(false);
  const timerRef = useRef(null);
  const feedbackRef = useRef(null);

  const initGame = useCallback(() => {
    const newBoard = createBoard(deck);
    const deckShuffled = shuffle(deck).filter(c => !newBoard.find(b => b.id === c.id));
    setBoard(newBoard);
    setMarked(new Set());
    setRemaining(deckShuffled);
    setCalledCards([]);
    setCurrentCard(null);
    setScore(0);
    setCombo(0);
    setWinLine(null);
    setShowConfetti(false);
    setTimer(config.speed);
    setPulsingBoard(false);
  }, [deck, config.speed]);

  useEffect(() => { initGame(); setPhase('countdown'); setCountdown(3); }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    if (soundEnabled()) soundTick();
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const callNextCard = useCallback(() => {
    setRemaining(prev => {
      if (prev.length === 0) { setPhase('lost'); clearInterval(timerRef.current); return prev; }
      const [next, ...rest] = prev;
      setCurrentCard(next);
      setCalledCards(c => [next, ...c].slice(0, 8));
      if (soundEnabled()) soundCardFlip();
      setPulsingBoard(true);
      setTimeout(() => setPulsingBoard(false), 600);
      return rest;
    });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        const next = parseFloat((t - 0.1).toFixed(2));
        if (next <= 0) { callNextCard(); return config.speed; }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase, callNextCard, config.speed]);

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
      if (hapticsEnabled()) hapticMedium();
      if (soundEnabled()) soundCombo();
      showFeedback(`🔥 x${newCombo}  +${points}`, 'var(--gold)');
    } else {
      showFeedback(`+${points}`, '#4ecba0');
    }
    const win = checkWin(newMarked);
    if (win) {
      setWinLine(win);
      setPhase('won');
      setShowConfetti(true);
      if (hapticsEnabled()) hapticSuccess();
      if (soundEnabled()) soundWin();
      const finalScore = score + points + 500;
      setScore(finalScore);
      addPesos(config.reward + Math.floor(finalScore / 100));
      completeLevel(selectedLevel, finalScore);
      clearInterval(timerRef.current);
    }
  };

  const showFeedback = (msg, color) => {
    clearTimeout(feedbackRef.current);
    setFeedback({ msg, color });
    feedbackRef.current = setTimeout(() => setFeedback(null), 1000);
  };

  const timerPct = (timer / config.speed) * 100;
  const timerColor = timerPct < 20 ? '#ff4444' : timerPct < 40 ? 'var(--gold)' : 'var(--teal)';

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'var(--navy)', overflow:'hidden' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={280} colors={['#F5C842','#D63030','#1D9E75','#E8529A','#FBF5E6']} />}

      <div style={{ padding:'12px 16px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <button className="btn btn-icon" style={{ width:38, height:38 }} onClick={() => { clearInterval(timerRef.current); setMode('classic-menu'); }}>←</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:11, letterSpacing:3, color:'rgba(245,200,66,0.6)' }}>LVL {selectedLevel} · {config.name.toUpperCase()}</div>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:28, color:'var(--gold)', lineHeight:1 }}>{score.toLocaleString()}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            {combo >= 3 && <div style={{ background:'linear-gradient(135deg,#D63030,#8B0000)', borderRadius:100, padding:'3px 10px', fontFamily:'Bebas Neue, sans-serif', fontSize:14, color:'white', animation:'bounce-in 0.2s ease' }}>🔥x{combo}</div>}
            <div className="peso-badge" style={{ fontSize:11, padding:'3px 10px', marginTop:4 }}>🪙{pesos}</div>
          </div>
        </div>
        <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:100, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:100, background:timerColor, width:`${timerPct}%`, transition:'width 0.1s linear, background 0.3s ease' }} />
        </div>
      </div>

      <div style={{ padding:'8px 16px', flexShrink:0 }}>
        {currentCard ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, background:pulsingBoard ? 'rgba(245,200,66,0.06)' : 'rgba(255,255,255,0.04)', border:`1px solid ${pulsingBoard ? 'rgba(245,200,66,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'10px 14px', transition:'all 0.3s' }}>
            <LoteriaCard card={currentCard} size="sm" style={{ flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:20, color:'var(--gold)', letterSpacing:1, lineHeight:1, marginBottom:3 }}>{currentCard.name.toUpperCase()}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontStyle:'italic', lineHeight:1.35, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>"{currentCard.riddle}"</div>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', flexShrink:0, textAlign:'right' }}>{remaining.length}<br/>left</div>
          </div>
        ) : (
          <div style={{ height:64, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.25)', fontSize:13 }}>Get ready...</div>
        )}
      </div>

      {calledCards.length > 1 && (
        <div style={{ padding:'0 16px 6px', flexShrink:0 }}>
          <div style={{ display:'flex', gap:5, overflowX:'auto' }}>
            {calledCards.slice(1).map((c, i) => <LoteriaCard key={c.id} card={c} size="xs" style={{ opacity:0.7-i*0.08 }} />)}
          </div>
        </div>
      )}

      <div style={{ flex:1, padding:'4px 10px 10px', display:'flex', alignItems:'center' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6, width:'100%' }}>
          {board.map((card, idx) => (
            <LoteriaCard key={card.id} card={card} size="sm" marked={marked.has(idx)} winning={winLine?.includes(idx)} onClick={() => handleMarkCard(idx)} style={{ width:'100%' }} />
          ))}
        </div>
      </div>

      {feedback && (
        <div style={{ position:'fixed', top:'28%', left:'50%', transform:'translateX(-50%)', fontFamily:'Bebas Neue, sans-serif', fontSize:30, letterSpacing:2, color:feedback.color, textShadow:'0 2px 12px rgba(0,0,0,0.6)', animation:'slideUp 0.25s ease', pointerEvents:'none', zIndex:50, whiteSpace:'nowrap' }}>
          {feedback.msg}
        </div>
      )}

      {phase === 'countdown' && (
        <div className="modal-overlay">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:countdown>0?140:80, color:countdown>0?'var(--gold)':'#4ecba0', lineHeight:1, animation:'bounce-in 0.3s ease', textShadow:'0 4px 24px rgba(0,0,0,0.5)' }}>
              {countdown > 0 ? countdown : '¡YA!'}
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:16, marginTop:8 }}>Level {selectedLevel} — {config.name}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>{config.speed}s per card</div>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="modal-overlay">
          <div className="modal anim-bounce-in">
            <div style={{ fontSize:64, marginBottom:4 }}>🎉</div>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:56, color:'var(--gold)', letterSpacing:3, lineHeight:1 }}>¡LOTERÍA!</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)', margin:'8px 0 16px' }}>Level {selectedLevel} — {config.name} Complete!</div>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>Final Score</span>
                <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:20 }}>{score.toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>Pesos Earned</span>
                <span style={{ color:'var(--gold)', fontWeight:700 }}>+{config.reward + Math.floor(score/100)} 🪙</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-gold" style={{ flex:1 }} onClick={() => { initGame(); setPhase('countdown'); setCountdown(3); }}>↺ Again</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setMode('classic-menu')}>Levels</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'lost' && (
        <div className="modal-overlay">
          <div className="modal anim-bounce-in">
            <div style={{ fontSize:56, marginBottom:8 }}>😅</div>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:36, color:'var(--red)', letterSpacing:2 }}>DECK'S DONE!</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', margin:'8px 0 20px' }}>All cards were called. No Lotería this time!</div>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:36, color:'var(--cream)', marginBottom:20 }}>{score.toLocaleString()} pts</div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-gold" style={{ flex:1 }} onClick={() => { initGame(); setPhase('countdown'); setCountdown(3); }}>Try Again</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setMode('classic-menu')}>← Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
