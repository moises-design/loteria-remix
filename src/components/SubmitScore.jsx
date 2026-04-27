import { useState } from 'react';
import { submitScore } from '../utils/supabase';
import { useGameStore } from '../store/gameStore';

export function SubmitScore({ gameMode, score, onDone }) {
  const { nickname, setNickname } = useGameStore();
  const [name, setName] = useState(nickname || '');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setStatus('loading');
    const n = name.trim().slice(0, 20);
    setNickname(n);
    const { error } = await submitScore(gameMode, score, n);
    setStatus(error ? 'error' : 'done');
    if (!error && onDone) setTimeout(onDone, 1200);
  };

  if (status === 'done') return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <span style={{ color: 'var(--gold)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16 }}>🏆 SCORE ON THE BOARD!</span>
    </div>
  );

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14, marginTop: 4 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>POST TO LEADERBOARD</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text" placeholder="Your name" maxLength={20}
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', fontSize: 14, outline: 'none',
          }}
        />
        <button
          className="btn btn-gold" style={{ padding: '10px 16px', borderRadius: 10, flexShrink: 0 }}
          onClick={handleSubmit}
          disabled={!name.trim() || status === 'loading'}
        >
          {status === 'loading' ? '…' : '🏆'}
        </button>
      </div>
      {status === 'error' && <div style={{ fontSize: 11, color: '#ff6b6b', marginTop: 6, textAlign: 'center' }}>Could not submit — check connection</div>}
    </div>
  );
}
