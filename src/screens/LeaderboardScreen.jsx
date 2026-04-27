import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLeaderboard, isSupabaseConfigured } from '../utils/supabase';

const TABS = [
  { id: 'lightning-round', label: 'Lightning', emoji: '⚡' },
  { id: 'card-blitz',      label: 'Blitz',     emoji: '🎯' },
  { id: 'match-pairs',     label: 'Pairs',     emoji: '🃏' },
  { id: 'name-it',         label: 'Name It',   emoji: '🔤' },
  { id: 'daily-challenge', label: 'Daily',     emoji: '📅' },
];

function rankColor(rank) {
  if (rank === 1) return '#F5C842';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return 'rgba(255,255,255,0.5)';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function LeaderboardScreen() {
  const { setMode } = useGameStore();
  const [activeTab, setActiveTab] = useState('lightning-round');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard(activeTab).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message || 'Failed to load');
      setScores(data || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      <div style={{ padding: '16px 20px 0' }}>
        <button className="btn btn-icon" onClick={() => setMode('mini-games')} style={{ marginBottom: 12 }}>←</button>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)', marginBottom: 4 }}>RANKINGS</div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, lineHeight: 1, marginBottom: 4 }}>
          🏆 <span style={{ color: 'var(--gold)' }}>LEADERBOARD</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
          Top 10 players for each mini game.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {TABS.map(tab => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: 100,
                  background: active ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                  color: active ? 'var(--navy)' : 'rgba(255,255,255,0.7)',
                  border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                  fontSize: 13, fontWeight: 700,
                }}
              >
                <span style={{ marginRight: 4 }}>{tab.emoji}</span>{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {!isSupabaseConfigured ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>Leaderboard coming soon</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Supabase not configured</div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: 40, animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>🔄</div>
            <div style={{ marginTop: 12, fontSize: 13 }}>Loading scores…</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ff8080' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 13 }}>{error}</div>
          </div>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--cream)', letterSpacing: 1 }}>No scores yet — be the first!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scores.map((entry, i) => {
              const rank = i + 1;
              const color = rankColor(rank);
              const isTop = rank <= 3;
              return (
                <div
                  key={`${entry.nickname}-${entry.created_at}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: rank === 1 ? 'linear-gradient(135deg, rgba(245,200,66,0.18), rgba(245,200,66,0.06))' : 'rgba(255,255,255,0.04)',
                    border: rank === 1 ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    borderRadius: '50%',
                    background: isTop ? `${color}22` : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color,
                  }}>
                    #{rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--cream)', letterSpacing: 0.5, lineHeight: 1, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.nickname}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{formatDate(entry.created_at)}</div>
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: rank === 1 ? 'var(--gold)' : 'var(--cream)', letterSpacing: 1 }}>
                    {Number(entry.score).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
