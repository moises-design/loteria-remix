import { useState, useEffect } from 'react';

function detectPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  const isChrome = /chrome/i.test(ua) && !/edge/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
  return { isIOS, isAndroid, isStandalone, isChrome, isSafari };
}

export function AddToHomeScreenBanner() {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState({});

  useEffect(() => {
    const dismissed = localStorage.getItem('loteria-a2hs-dismissed');
    if (dismissed) return;
    const p = detectPlatform();
    setPlatform(p);
    // Only show if not already installed and on mobile
    if (!p.isStandalone && (p.isIOS || p.isAndroid)) {
      setTimeout(() => setVisible(true), 3000);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('loteria-a2hs-dismissed', '1');
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(29,158,117,0.15), rgba(29,158,117,0.08))',
        border: '1px solid rgba(29,158,117,0.3)',
        borderRadius: 14, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12, cursor: 'pointer',
      }}
        onClick={() => setShowModal(true)}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: '#4ecba0', letterSpacing: 1 }}>
            ADD TO HOME SCREEN
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Play like a real app — no browser bar
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
        >
          ✕
        </button>
      </div>

      {/* Instructions modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); dismiss(); } }}
        >
          <div style={{
            background: '#162550', borderRadius: '24px 24px 0 0',
            border: '1px solid rgba(29,158,117,0.3)',
            padding: '28px 24px 48px',
            width: '100%', maxWidth: 480,
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '0 auto 24px' }} />

            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>📲</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#4ecba0', textAlign: 'center', letterSpacing: 2, marginBottom: 20 }}>
              ADD TO HOME SCREEN
            </div>

            {platform.isIOS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: '1', icon: '⬆️', text: 'Tap the Share button at the bottom of Safari (the box with an arrow)' },
                  { step: '2', icon: '📋', text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: '3', icon: '✅', text: 'Tap "Add" in the top right — done!' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(78,203,160,0.15)', border: '1px solid rgba(78,203,160,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: '#4ecba0',
                      flexShrink: 0,
                    }}>{item.step}</div>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {platform.isAndroid && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: '1', icon: '⋮', text: 'Tap the three-dot menu in Chrome (top right)' },
                  { step: '2', icon: '📱', text: 'Tap "Add to Home screen"' },
                  { step: '3', icon: '✅', text: 'Tap "Add" — Lotería Remix appears on your home screen!' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(78,203,160,0.15)', border: '1px solid rgba(78,203,160,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: '#4ecba0',
                      flexShrink: 0,
                    }}>{item.step}</div>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-gold"
              style={{ width: '100%', padding: '16px', marginTop: 28 }}
              onClick={() => { setShowModal(false); dismiss(); }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
