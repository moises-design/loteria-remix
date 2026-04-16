import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { speakCard } from '../utils/voice';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import Confetti from 'react-confetti';

const TOTAL_QUESTIONS = 10;
const TIME_PER_Q = 8;

export default function NameItScreen() {
  const { setMode, addPesos, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [phase, setPhase] = useState('setup'); // setup | playing | result | done
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const buildQuestions = () => {
    const shuffled = shuffle([...deck]).slice(0, TOTAL_QUESTIONS);
    return shuffled.map(correct => {
      const wrong = shuffle(deck.filter(c => c.id !== correct.id)).slice(0, 3);
      const options = shuffle([correct, ...wrong]);
      return { correct, options };
    });
  };

  const startGame = () => {
    const qs = buildQuestions();
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setTimeLeft(TIME_PER_Q);
    setShowConfetti(false);
    setPhase('playing');
  };

  const currentQ = questions[qIdx];

  // Speak card on each question
  useEffect(() => {
    if (phase === 'playing' && currentQ) {
      speakCard(currentQ.correct);
    }
  }, [qIdx, phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // time's up = wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIdx, selected]);

  const handleAnswer = (option) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(option);

    const isCorrect = option && option.id === currentQ.correct.id;
    if (isCorrect) {
      hapticSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = 100 + (newStreak > 1 ? newStreak * 20 : 0) + (timeLeft > 4 ? 50 : 0);
      setScore(s => s + pts);
      setAnswers(a => [...a, { correct: true, pts, card: currentQ.correct, timeLeft }]);
    } else {
      hapticError();
      setStreak(0);
      setAnswers(a => [...a, { correct: false, pts: 0, card: currentQ.correct, selected: option }]);
    }

    setTimeout(() => {
      if (qIdx + 1 >= TOTAL_QUESTIONS) {
        setPhase('done');
        if (isCorrect) setShowConfetti(true);
      } else {
        setQIdx(i => i + 1);
        setSelected(null);
        setTimeLeft(TIME_PER_Q);
      }
    }, 1200);
  };

  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timerPct < 30 ? '#ff4444' : timerPct < 60 ? 'var(--gold)' : 'var(--teal)';
  const finalCorrect = answers.filter(a => a.correct).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}

      {/* Header */}
      <div style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(timerRef.current); setMode('mini-games'); }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>MINI GAME</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>🔤 NAME IT</div>
        </div>
        {phase === 'playing' ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: timerColor }}>{timeLeft}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{qIdx + 1}/{TOTAL_QUESTIONS}</div>
          </div>
        ) : <div style={{ width: 44 }} />}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🔤</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--gold)', marginBottom: 12 }}>NAME IT!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 280, lineHeight: 1.7, marginBottom: 32 }}>
            See the card image, pick the correct name from 4 options. {TOTAL_QUESTIONS} questions, {TIME_PER_Q} seconds each. Fast answers = bonus points!
          </p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            {[['🔤 10', 'questions'], ['⏱ 8s', 'each'], ['⚡ fast', 'bonus']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-gold" style={{ width: '100%', maxWidth: 320, padding: '18px' }} onClick={startGame}>
            🔤 START QUIZ
          </button>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && currentQ && (
        <>
          {/* Progress + timer */}
          <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 100,
                  background: i < qIdx
                    ? (answers[i]?.correct ? 'var(--teal)' : 'var(--red)')
                    : i === qIdx ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                }} />
              ))}
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 100 }}>
              <div style={{ height: '100%', borderRadius: 100, background: timerColor, width: `${timerPct}%`, transition: 'width 1s linear' }} />
            </div>
          </div>

          {/* Score + streak */}
          <div style={{ padding: '0 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--gold)' }}>{score}</div>
            {streak > 1 && <div style={{ background: 'rgba(214,48,48,0.2)', borderRadius: 100, padding: '2px 12px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: '#ff8080' }}>🔥 x{streak}</div>}
          </div>

          {/* Card image */}
          <div style={{ flex: 0, padding: '0 20px', flexShrink: 0 }}>
            <div style={{
              background: 'white', borderRadius: 16,
              padding: '16px 12px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              maxWidth: 200, margin: '0 auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: 120, height: 120,
                background: currentQ.correct.color + '22',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 64, marginBottom: 8,
              }}>
                {currentQ.correct.emoji}
              </div>
              <div style={{ height: 20, background: 'rgba(0,0,0,0.08)', borderRadius: 6, width: '80%' }} />
            </div>
          </div>

          {/* Options */}
          <div style={{ flex: 1, padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            {currentQ.options.map((opt, i) => {
              const isSelected = selected && selected.id === opt.id;
              const isCorrect = opt.id === currentQ.correct.id;
              const showResult = selected !== null;
              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.12)';
              if (showResult && isCorrect) { bg = 'rgba(29,158,117,0.25)'; border = '#1D9E75'; }
              if (showResult && isSelected && !isCorrect) { bg = 'rgba(214,48,48,0.25)'; border = '#D63030'; }

              return (
                <button
                  key={opt.id}
                  className="btn"
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  style={{
                    padding: '14px 20px', borderRadius: 14, justifyContent: 'space-between',
                    background: bg, border: `1.5px solid ${border}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: opt.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>{opt.emoji}</div>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'white', letterSpacing: 1 }}>
                      {opt.name.toUpperCase()}
                    </span>
                  </div>
                  {showResult && isCorrect && <span style={{ fontSize: 20 }}>✅</span>}
                  {showResult && isSelected && !isCorrect && <span style={{ fontSize: 20 }}>❌</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Done */}
      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', overflowY: 'auto' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>
            {finalCorrect === 10 ? '🏆' : finalCorrect >= 7 ? '🎉' : finalCorrect >= 5 ? '😅' : '💀'}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 44, color: 'var(--gold)', letterSpacing: 2, marginBottom: 4 }}>
            {finalCorrect}/10 CORRECT
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            {finalCorrect === 10 ? '¡PERFECTO! You know every card!' :
             finalCorrect >= 8 ? 'Casi perfecto! So close!' :
             finalCorrect >= 6 ? 'Not bad — keep playing!' :
             'Study your cards and try again!'}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--cream)', marginBottom: 4 }}>{score.toLocaleString()}</div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 20 }}>+{Math.floor(score / 10)} 🪙 earned</div>

          {/* Review */}
          <div style={{ width: '100%', maxWidth: 340, maxHeight: 200, overflowY: 'auto', marginBottom: 20 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: a.correct ? 'rgba(29,158,117,0.1)' : 'rgba(214,48,48,0.1)',
                borderRadius: 10, marginBottom: 6,
              }}>
                <span style={{ fontSize: 16 }}>{a.correct ? '✅' : '❌'}</span>
                <span style={{ fontSize: 18 }}>{a.card.emoji}</span>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'var(--cream)', flex: 1, textAlign: 'left' }}>
                  {a.card.name.toUpperCase()}
                </span>
                {a.correct && <span style={{ fontSize: 12, color: 'var(--gold)' }}>+{a.pts}</span>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={startGame}>↺ Play Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('mini-games')}>← Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
