import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { getCardImageUrl } from '../data/cardArt';

const TEAMS = ['Team Gallo', 'Team Luna', 'Team Sol', 'Team Rosa'];
const ROUND_TIME = 60;

export default function ActItOutScreen() {
  const { setMode, activeDeck } = useGameStore();
  const deck = activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK;

  const [phase, setPhase] = useState('setup'); // setup | ready | playing | round-end | game-end
  const [teamCount, setTeamCount] = useState(2);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [remaining, setRemaining] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundSkipped, setRoundSkipped] = useState(0);
  const [tiltDir, setTiltDir] = useState(null); // 'up' | 'down'
  const timerRef = useRef(null);
  const betaRef = useRef(null);

  const initGame = () => {
    setRemaining(shuffle([...deck]));
    setScores(new Array(teamCount).fill(0));
    setCurrentTeam(0);
    setCurrentCard(null);
    setPhase('ready');
  };

  // Device tilt detection
  useEffect(() => {
    if (phase !== 'playing') return;
    const handleOrientation = (e) => {
      const beta = e.beta; // -180 to 180, 0 is flat, 90 is upright
      if (betaRef.current === null) { betaRef.current = beta; return; }
      const diff = beta - betaRef.current;
      if (diff < -25 && tiltDir !== 'up') {
        setTiltDir('up');
        handleCorrect();
      } else if (diff > 25 && tiltDir !== 'down') {
        setTiltDir('down');
        handleSkip();
      } else if (Math.abs(diff) < 10) {
        setTiltDir(null);
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [phase, tiltDir]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) {
          clearInterval(timerRef.current);
          setPhase('round-end');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startRound = () => {
    betaRef.current = null;
    setTimeLeft(ROUND_TIME);
    setRoundCorrect(0);
    setRoundSkipped(0);
    setRemaining(r => {
      if (r.length === 0) {
        setPhase('game-end');
        return r;
      }
      const [first, ...rest] = r;
      setCurrentCard(first);
      return rest;
    });
    setPhase('playing');
  };

  const handleCorrect = () => {
    setRoundCorrect(c => c + 1);
    setScores(s => s.map((v, i) => i === currentTeam ? v + 1 : v));
    setRemaining(r => {
      if (r.length === 0) {
        setPhase('round-end');
        return r;
      }
      const [next, ...rest] = r;
      setCurrentCard(next);
      return rest;
    });
    betaRef.current = null;
  };

  const handleSkip = () => {
    setRoundSkipped(c => c + 1);
    setRemaining(r => {
      if (r.length === 0) {
        setPhase('round-end');
        return r;
      }
      const [next, ...rest] = r;
      setCurrentCard(next);
      return rest;
    });
    betaRef.current = null;
  };

  const nextTeam = () => {
    const next = (currentTeam + 1) % teamCount;
    setCurrentTeam(next);
    setPhase('ready');
  };

  const winner = scores.indexOf(Math.max(...scores.slice(0, teamCount)));

  const timerColor = timeLeft <= 10 ? 'var(--red)' : timeLeft <= 20 ? 'var(--gold)' : 'var(--teal)';

  return (
    <div className="screen" style={{ background: 'var(--navy)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => { clearInterval(timerRef.current); setMode('home'); }}>←</button>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--red)', letterSpacing: 2 }}>
          ACT IT OUT
        </div>
        {phase !== 'setup' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {scores.slice(0, teamCount).map((s, i) => (
              <div key={i} style={{
                background: i === currentTeam ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${i === currentTeam ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, padding: '4px 8px', textAlign: 'center', minWidth: 36,
              }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: i === currentTeam ? 'var(--gold)' : 'var(--cream)' }}>
                  {s}
                </div>
              </div>
            ))}
          </div>
        )}
        {phase === 'setup' && <div style={{ width: 44 }} />}
      </div>

      {/* SETUP */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎭</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'var(--red)', marginBottom: 8, textAlign: 'center' }}>
            ACT IT OUT
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, maxWidth: 300, lineHeight: 1.6 }}>
            Put your phone on your forehead! Tilt UP = correct, tilt DOWN = skip. Teams take turns. Most points wins!
          </p>

          <div className="glass-card" style={{ width: '100%', maxWidth: 320, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              Number of teams
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[2, 3, 4].map(n => (
                <button key={n} className="btn" onClick={() => setTeamCount(n)} style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  background: teamCount === n ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                  color: teamCount === n ? 'var(--navy)' : 'var(--cream)',
                  border: `1px solid ${teamCount === n ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 22,
                }}>
                  {n}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Array.from({length: teamCount}, (_, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🃏</span> {TEAMS[i]}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-red" style={{ width: '100%', maxWidth: 320, padding: '18px' }} onClick={initGame}>
            🎭 START GAME
          </button>
        </div>
      )}

      {/* READY */}
      {phase === 'ready' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--red), #8B0000)',
            borderRadius: 24, padding: '32px 40px', marginBottom: 32,
            width: '100%', maxWidth: 320,
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎭</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'white', letterSpacing: 2 }}>
              {TEAMS[currentTeam].toUpperCase()}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>it's your turn!</div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 260, lineHeight: 1.6 }}>
            Hold the phone face-up on your forehead. Tilt toward face = ✓ Got it! Tilt away = Skip
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, fontSize: 14 }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>📱↑</div>
              Tilt UP<br />= Correct
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>📱↓</div>
              Tilt DOWN<br />= Skip
            </div>
          </div>
          <button className="btn btn-red" style={{ width: '100%', maxWidth: 320, padding: '18px', fontSize: 18 }} onClick={startRound}>
            ¡LISTO! START ROUND
          </button>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && currentCard && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}>
          {/* Timer */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 72, color: timerColor, lineHeight: 1, transition: 'color 0.3s' }}>
              {timeLeft}
            </div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div className="progress-fill" style={{
                width: `${(timeLeft / ROUND_TIME) * 100}%`,
                background: timerColor,
                transition: 'all 0.3s',
              }} />
            </div>
          </div>

          {/* Card display */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              background: 'white',
              borderRadius: 24, padding: '16px 16px 12px', textAlign: 'center',
              width: '100%', maxWidth: 300,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              animation: 'bounce-in 0.3s ease',
            }}>
              <img
                src={getCardImageUrl(currentCard)}
                alt={currentCard.name}
                style={{ width: '100%', aspectRatio: '200/280', objectFit: 'contain', borderRadius: 8, marginBottom: 8, display: 'block' }}
              />
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#1a1a1a', letterSpacing: 2 }}>
                {currentCard.name.toUpperCase()}
              </div>
            </div>

            {/* Tilt indicators */}
            <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
              <div style={{
                fontSize: 28,
                opacity: tiltDir === 'up' ? 1 : 0.3,
                transition: 'opacity 0.2s',
                transform: tiltDir === 'up' ? 'scale(1.3)' : 'scale(1)',
              }}>✅</div>
              <div style={{
                fontSize: 28,
                opacity: tiltDir === 'down' ? 1 : 0.3,
                transition: 'opacity 0.2s',
                transform: tiltDir === 'down' ? 'scale(1.3)' : 'scale(1)',
              }}>⏭️</div>
            </div>
          </div>

          {/* Manual tap buttons (fallback) */}
          <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
            <button className="btn" onClick={handleSkip} style={{
              flex: 1, padding: '16px', borderRadius: 16,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600,
            }}>
              ⏭ SKIP
            </button>
            <button className="btn" onClick={handleCorrect} style={{
              flex: 2, padding: '16px', borderRadius: 16,
              background: 'linear-gradient(135deg, var(--teal), #0d6e56)',
              color: 'white', fontSize: 16, fontWeight: 700,
            }}>
              ✓ CORRECT!
            </button>
          </div>
        </div>
      )}

      {/* ROUND END */}
      {phase === 'round-end' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
          <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--gold)', marginBottom: 8 }}>
            TIME'S UP!
          </h3>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 48, fontFamily: 'Bebas Neue, sans-serif', color: 'var(--teal)' }}>{roundCorrect}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>cards correct</div>
          </div>
          {/* Scoreboard */}
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 24 }}>
            {Array.from({length: teamCount}, (_, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: 12, marginBottom: 8,
                background: i === currentTeam ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === currentTeam ? 'rgba(245,200,66,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span style={{ fontWeight: 600, color: i === currentTeam ? 'var(--gold)' : 'var(--cream)' }}>
                  {TEAMS[i]}
                </span>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: i === currentTeam ? 'var(--gold)' : 'var(--cream)' }}>
                  {scores[i]}
                </span>
              </div>
            ))}
          </div>
          <button className="btn btn-gold" style={{ width: '100%', maxWidth: 320, padding: '16px' }} onClick={nextTeam}>
            → {TEAMS[(currentTeam + 1) % teamCount]}'s Turn
          </button>
        </div>
      )}

      {/* GAME END */}
      {phase === 'game-end' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, color: 'var(--gold)', marginBottom: 16 }}>
            {TEAMS[winner].toUpperCase()}<br />WINS!
          </h3>
          <div style={{ width: '100%', maxWidth: 300, marginBottom: 32 }}>
            {Array.from({length: teamCount}, (_, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 16px',
                borderRadius: 10, marginBottom: 6,
                background: i === winner ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.04)',
              }}>
                <span style={{ color: i === winner ? 'var(--gold)' : 'var(--cream)' }}>
                  {i === winner ? '🏆 ' : ''}{TEAMS[i]}
                </span>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: i === winner ? 'var(--gold)' : 'var(--cream)' }}>
                  {scores[i]}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => { initGame(); }}>↺ Play Again</button>
            <button className="btn btn-ghost" onClick={() => setMode('home')}>← Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
