import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { EmailCaptureBanner, EmailCaptureModal } from '../components/EmailCapture';
import { AddToHomeScreenBanner } from '../components/AddToHomeScreen';
import { todayStr, hasTodayRecord } from '../utils/daily';

const MODES = [
  {
    id: 'daily-challenge',
    label: 'DAILY',
    sub: 'One shot per day — same for everyone',
    emoji: '📅',
    gradient: 'linear-gradient(135deg, #1a3a5c, #2980b9)',
    accent: '#74b9ff',
    tag: todayStr(),
  },
  {
    id: 'classic-menu',
    label: 'CLASSIC',
    sub: 'Single Player & Caller',
    emoji: '🎴',
    gradient: 'linear-gradient(135deg, #1a6b4a, #0d3d29)',
    accent: '#4ecba0',
    tag: '⭐ Most Popular',
  },
  {
    id: 'act-it-out',
    label: 'ACT IT OUT',
    sub: 'Heads Up Party Mode',
    emoji: '🎭',
    gradient: 'linear-gradient(135deg, #8B0000, #D63030)',
    accent: '#ff8080',
    tag: '🔥 Party Hit',
  },
  {
    id: 'custom-photo-deck',
    label: 'PHOTO DECK',
    sub: 'Put Faces on Cards',
    emoji: '🤳',
    gradient: 'linear-gradient(135deg, #880E4F, #E91E63)',
    accent: '#f48fb1',
    tag: '📸 Goes Viral',
  },
  {
    id: 'millennial-mode',
    label: 'MILLENNIAL',
    sub: 'Modern Remix Deck',
    emoji: '📱',
    gradient: 'linear-gradient(135deg, #1a237e, #3949AB)',
    accent: '#7986cb',
    tag: '😂 So Relatable',
  },
  {
    id: 'mini-games',
    label: 'MINI GAMES',
    sub: 'Match, Blitz, Quiz & More',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #4527A0, #6A1B9A)',
    accent: '#b39ddb',
    tag: '⚡ Arcade',
  },
];

export default function HomeScreen() {
  const { setMode, pesos, streak } = useGameStore();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const emailCaptured = localStorage.getItem('loteria-email-captured');

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '48px 24px 0',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '200px',
          background: 'radial-gradient(ellipse, rgba(245,200,66,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div className="peso-badge">
            <span>🪙</span>
            <span>{pesos}</span>
          </div>
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(214,48,48,0.15)', border: '1px solid rgba(214,48,48,0.3)',
              borderRadius: 100, padding: '6px 14px',
              color: '#ff8080', fontSize: 14, fontWeight: 700,
            }}>
              🔥 {streak} Streak
            </div>
          )}
          <button className="btn btn-icon" onClick={() => setMode('settings')}>⚙️</button>
        </div>

        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(245,200,66,0.7)', marginBottom: 4 }}>
            DON CLEMENTE PRESENTS
          </div>
          <h1 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(64px, 16vw, 96px)',
            lineHeight: 0.9, letterSpacing: 2,
            color: 'var(--cream)',
          }}>
            LOTERÍA<br />
            <span style={{ color: 'var(--gold)' }}>REMIX</span>
          </h1>
        </div>

        {/* Floating cards row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '24px 0', overflow: 'hidden' }}>
          {['🐓','🌙','☀️','❤️','💀'].map((e, i) => (
            <div key={i} style={{
              width: 52, height: 72, background: 'white', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transform: `rotate(${(i-2)*4}deg)`,
              animation: `float${(i%3)+1} ${3.5+i*0.5}s ease-in-out infinite`,
            }}>{e}</div>
          ))}
        </div>
      </div>

      {/* Mode Grid */}
      <div style={{ padding: '8px 20px 40px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(245,200,66,0.6)', textAlign: 'center', marginBottom: 20 }}>
          CHOOSE YOUR MODE
        </div>

        {/* Email + A2HS banners */}
        {!emailCaptured && <EmailCaptureBanner onOpen={() => setShowEmailModal(true)} />}
        <AddToHomeScreenBanner />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {MODES.map((m) => {
            const isDaily = m.id === 'daily-challenge';
            const dailyPlayed = isDaily && hasTodayRecord();
            return (
              <button
                key={m.id}
                className="btn"
                onClick={() => setMode(m.id)}
                style={{
                  background: m.gradient, borderRadius: 20,
                  padding: '24px 16px', flexDirection: 'column', alignItems: 'flex-start',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {dailyPlayed && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(78,203,160,0.25)', border: '1px solid rgba(78,203,160,0.6)',
                    borderRadius: 100, padding: '2px 8px',
                    fontSize: 10, color: '#4ecba0', fontWeight: 700, letterSpacing: 0.5,
                  }}>✓ Played</div>
                )}
                <div style={{ fontSize: 36, marginBottom: 10 }}>{m.emoji}</div>
                <div style={{
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 22,
                  color: 'white', letterSpacing: 1, lineHeight: 1, marginBottom: 4,
                }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textAlign: 'left', lineHeight: 1.3 }}>{m.sub}</div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 100,
                  padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600,
                }}>{m.tag}</div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{ textAlign: 'center', marginTop: 28, color: 'rgba(251,245,230,0.3)', fontSize: 13 }}>
          🌮 Hecho con amor para la familia
        </div>
      </div>

      {showEmailModal && <EmailCaptureModal onClose={() => setShowEmailModal(false)} />}

      <style>{`
        @keyframes float1 { 0%,100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(-8deg) translateY(-8px); } }
        @keyframes float2 { 0%,100% { transform: rotate(4deg) translateY(0); } 50% { transform: rotate(4deg) translateY(-12px); } }
        @keyframes float3 { 0%,100% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(-2deg) translateY(-6px); } }
      `}</style>
    </div>
  );
}
