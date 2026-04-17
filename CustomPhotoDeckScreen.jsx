import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, shuffle } from '../data/decks';

// Smart face crop - crops to top 60% of image where face usually is
function cropFaceFromImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      // For portrait photos, crop to face area (top 55% centered)
      const isPortrait = img.height > img.width;
      let sx, sy, sw, sh;

      if (isPortrait) {
        // Take full width, top 60% of height (where face is)
        sw = img.width;
        sh = img.width; // square crop
        sx = 0;
        sy = Math.max(0, img.height * 0.05); // slight offset from top
      } else {
        // Landscape - take center square
        sw = img.height;
        sh = img.height;
        sx = (img.width - sw) / 2;
        sy = 0;
      }

      // Draw with slight zoom to fill face area better
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 300, 300);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = url;
  });
}

// Generate the styled card overlay with photo
function PhotoCardPreview({ card, photoUrl, size = 150 }) {
  return (
    <div style={{
      width: size, flexShrink: 0,
      background: 'white', borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      position: 'relative',
    }}>
      {/* Card number */}
      <div style={{
        position: 'absolute', top: 4, left: 6, zIndex: 3,
        fontFamily: 'Bebas Neue, sans-serif', fontSize: 12,
        color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>{card.id}</div>

      {/* Decorative top border */}
      <div style={{ height: 6, background: card.color, width: '100%' }} />

      {/* Photo area */}
      <div style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            {/* Color tint overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: card.color,
              opacity: 0.25,
              mixBlendMode: 'multiply',
            }} />
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
            }} />
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', background: card.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {card.emoji}
          </div>
        )}
      </div>

      {/* Decorative divider */}
      <div style={{ height: 3, background: card.color, width: '100%' }} />

      {/* Card name */}
      <div style={{
        background: card.color, padding: '5px 4px',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: Math.max(9, size / 14),
        color: 'white', textAlign: 'center',
        letterSpacing: 0.5, lineHeight: 1,
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      }}>
        {card.name.toUpperCase()}
      </div>
    </div>
  );
}

export default function CustomPhotoDeckScreen() {
  const { setMode, photoAssignments, setPhotoAssignments, setActiveDeck } = useGameStore();
  const [photos, setPhotos] = useState([]); // [{url, name}]
  const [assignments, setAssignments] = useState(photoAssignments || {});
  const [phase, setPhase] = useState(Object.keys(photoAssignments).length > 0 ? 'preview' : 'upload');
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setProcessing(true);

    const processed = await Promise.all(
      files.map(async (f) => ({
        url: await cropFaceFromImage(f),
        name: f.name,
      }))
    );

    setPhotos(prev => [...prev, ...processed]);
    setProcessing(false);
  }, []);

  const randomAssign = useCallback(() => {
    if (photos.length === 0) return;
    const shuffledCards = shuffle([...CLASSIC_DECK]);
    const newAssignments = {};
    shuffledCards.forEach((card, i) => {
      newAssignments[card.id] = photos[i % photos.length].url;
    });
    setAssignments(newAssignments);
    setPhotoAssignments(newAssignments);
    setPhase('preview');
  }, [photos, setPhotoAssignments]);

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const assignedCards = CLASSIC_DECK.filter(c => assignments[c.id]);

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-icon" onClick={() => setMode('home')}>←</button>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'var(--pink)' }}>CUSTOM</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, lineHeight: 1 }}>PHOTO DECK</h2>
        </div>
      </div>

      {phase === 'upload' && (
        <div style={{ padding: '16px 20px' }}>
          {/* Upload zone */}
          <div
            onClick={() => !processing && fileRef.current.click()}
            style={{
              border: '2px dashed rgba(232,82,154,0.4)',
              borderRadius: 20, padding: '36px 20px', textAlign: 'center',
              cursor: processing ? 'wait' : 'pointer', marginBottom: 24,
              background: 'rgba(232,82,154,0.04)',
            }}
          >
            {processing ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Cropping faces...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--pink)', marginBottom: 8 }}>ADD SELFIES</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Upload photos of your crew<br/>
                  We'll auto-crop to faces 👤
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                {photos.length} Photo{photos.length !== 1 ? 's' : ''} — Looking good 👌
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 5, right: 5,
                        background: 'rgba(0,0,0,0.6)', border: 'none',
                        borderRadius: '50%', width: 24, height: 24,
                        color: 'white', fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                ))}
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    aspectRatio: '1', borderRadius: 12,
                    border: '2px dashed rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                  }}
                >+</div>
              </div>

              {/* Preview how cards will look */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  PREVIEW
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                  {[1, 6, 12, 23, 41, 54].map((id, i) => {
                    const card = CLASSIC_DECK.find(c => c.id === id);
                    const photo = photos[i % photos.length];
                    return card ? <PhotoCardPreview key={id} card={card} photoUrl={photo?.url} size={110} /> : null;
                  })}
                </div>
              </div>

              <button
                className="btn btn-gold"
                style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 10 }}
                onClick={randomAssign}
              >
                🎴 Create My Deck!
              </button>
            </>
          )}

          {/* How it works */}
          {photos.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📲', text: 'Upload selfies of your friends & family' },
                { icon: '✂️', text: 'We auto-crop to center on faces' },
                { icon: '🎴', text: 'Faces get assigned to classic cards with a color tint' },
                { icon: '😂', text: 'Everyone loses it when they see their card' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0, width: 44, textAlign: 'center' }}>{item.icon}</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', paddingTop: 4, lineHeight: 1.5 }}>{item.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'preview' && (
        <div style={{ padding: '12px 20px 40px' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--pink)' }}>{photos.length || '✓'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Photos</div>
            </div>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--gold)' }}>{Object.keys(assignments).length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Cards</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 13 }}
              onClick={() => { setPhotos([]); setAssignments({}); setPhotoAssignments({}); setPhase('upload'); }}>
              ↺ Reset
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 13 }} onClick={randomAssign}>
              🔀 Re-mix
            </button>
            <button className="btn btn-gold" style={{ flex: 1, padding: '12px', fontSize: 13 }} onClick={() => { setActiveDeck('photo'); setMode('classic-menu'); }}>
              ▶ Play!
            </button>
          </div>

          {/* Cards grid */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            YOUR DECK
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {assignedCards.slice(0, 18).map(card => (
              <PhotoCardPreview key={card.id} card={card} photoUrl={assignments[card.id]} size={100} />
            ))}
          </div>
          {assignedCards.length > 18 && (
            <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              + {assignedCards.length - 18} more cards in your deck
            </div>
          )}
        </div>
      )}
    </div>
  );
}
