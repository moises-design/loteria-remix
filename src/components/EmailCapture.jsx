import { useState } from 'react';
import { saveEmail } from '../utils/supabase';

export function EmailCaptureModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async () => {
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const { error } = await saveEmail(email, name);
      if (error) console.error(error);
    } catch (err) {
      console.error('Email save failed:', err);
    }
    // Always show success — don't expose network errors to the user
    setStatus('success');
    localStorage.setItem('loteria-email-captured', '1');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 0 0',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#162550', borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(245,200,66,0.2)',
        padding: '32px 24px 48px',
        width: '100%', maxWidth: 480,
        animation: 'slideUp 0.3s ease',
      }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--gold)', letterSpacing: 2, marginBottom: 8 }}>
              ¡YOU'RE ON THE LIST!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
              We'll hit you up when the iOS & Android app drops. You'll be first to know!
            </div>
            <button className="btn btn-gold" style={{ width: '100%', padding: '16px' }} onClick={onClose}>
              ¡Órale! Let's Play
            </button>
          </div>
        ) : (
          <>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '0 auto 24px' }} />

            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>📱</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--gold)', textAlign: 'center', letterSpacing: 2, marginBottom: 8 }}>
              iOS APP COMING SOON
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
              Be first to know when Lotería Remix hits the App Store & Google Play. No spam, just the launch.
            </div>

            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, marginBottom: 10,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, marginBottom: 16,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
            />

            <button
              className="btn btn-gold"
              style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 12 }}
              onClick={handleSubmit}
              disabled={status === 'loading' || !email.includes('@')}
            >
              {status === 'loading' ? '...' : '🚀 Notify Me at Launch'}
            </button>

            <button
              onClick={onClose}
              style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', padding: '8px' }}
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Small banner shown on home screen
export function EmailCaptureBanner({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', background: 'linear-gradient(135deg, rgba(245,200,66,0.12), rgba(245,200,66,0.06))',
        border: '1px solid rgba(245,200,66,0.25)', borderRadius: 14,
        padding: '12px 16px', cursor: 'pointer', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>📱</span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'var(--gold)', letterSpacing: 1 }}>
            iOS & ANDROID APP COMING SOON
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Tap to get notified at launch
          </div>
        </div>
      </div>
      <div style={{ color: 'var(--gold)', fontSize: 18 }}>→</div>
    </button>
  );
}
