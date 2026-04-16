import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, shuffle } from '../data/decks';

export default function CustomPhotoDeckScreen() {
  const { setMode, photoAssignments, setPhotoAssignments } = useGameStore();
  const [photos, setPhotos] = useState([]);
  const [assignments, setAssignments] = useState(photoAssignments || {});
  const [phase, setPhase] = useState(Object.keys(photoAssignments).length > 0 ? 'preview' : 'upload');
  const fileRef = useRef();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = (ev) => res({ url: ev.target.result, name: f.name });
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(newPhotos => {
      setPhotos(prev => [...prev, ...newPhotos]);
    });
  };

  const randomAssign = () => {
    if (photos.length === 0) return;
    const shuffledCards = shuffle([...CLASSIC_DECK]);
    const newAssignments = {};
    shuffledCards.forEach((card, i) => {
      newAssignments[card.id] = photos[i % photos.length];
    });
    setAssignments(newAssignments);
    setPhotoAssignments(newAssignments);
    setPhase('preview');
  };

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
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, lineHeight: 1, letterSpacing: 1 }}>PHOTO DECK</h2>
        </div>
      </div>

      {phase === 'upload' && (
        <div style={{ padding: '16px 20px' }}>
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed rgba(232,82,154,0.4)`,
              borderRadius: 20, padding: '40px 20px', textAlign: 'center',
              cursor: 'pointer', marginBottom: 24,
              background: 'rgba(232,82,154,0.04)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--pink)', marginBottom: 8 }}>
              ADD PHOTOS
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Upload selfies of your crew<br />Any amount works!
            </div>
            <input
              ref={fileRef}
              type="file" accept="image/*" multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {/* Photos grid */}
          {photos.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                {photos.length} Photo{photos.length !== 1 ? 's' : ''} Added
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 4, right: 4,
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
                    aspectRatio: '1', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                  }}
                >+</div>
              </div>

              <button className="btn btn-gold" style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 12 }} onClick={randomAssign}>
                🃏 Assign to Cards!
              </button>
            </>
          )}

          {/* Instructions if no photos yet */}
          {photos.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📲', text: 'Upload selfies of your friends & family' },
                { icon: '🎴', text: 'Faces get randomly assigned to classic cards' },
                { icon: '🎮', text: 'Play with your personalized deck!' },
                { icon: '📸', text: 'Everyone screams when they see their card' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0, width: 44, textAlign: 'center' }}>{item.icon}</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', paddingTop: 4 }}>{item.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'preview' && (
        <div style={{ padding: '12px 20px 40px' }}>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--pink)' }}>{photos.length || Object.keys(assignments).length > 0 ? '✓' : '0'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Photos</div>
            </div>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--gold)' }}>{Object.keys(assignments).length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Cards assigned</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className="btn btn-ghost" style={{ flex: 1, padding: '12px' }}
              onClick={() => { setPhotos([]); setAssignments({}); setPhotoAssignments({}); setPhase('upload'); }}>
              ↺ Reset
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={randomAssign}>
              🔀 Re-randomize
            </button>
            <button className="btn btn-gold" style={{ flex: 1, padding: '12px' }} onClick={() => setMode('classic-menu')}>
              ▶ Play!
            </button>
          </div>

          {/* Cards preview */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            YOUR DECK PREVIEW
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {assignedCards.slice(0, 18).map(card => (
              <div key={card.id} style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  height: 90, overflow: 'hidden', position: 'relative',
                  background: card.color + '44',
                }}>
                  <img
                    src={assignments[card.id]?.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: card.color + '55',
                    mixBlendMode: 'multiply',
                  }} />
                  <div style={{
                    position: 'absolute', top: 4, left: 6,
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 14,
                    color: 'rgba(255,255,255,0.8)',
                  }}>{card.id}</div>
                </div>
                <div style={{
                  padding: '6px 8px', textAlign: 'center',
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 11,
                  color: '#1a1a1a', letterSpacing: 0.5, lineHeight: 1.2,
                }}>
                  {card.name.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          {assignedCards.length > 18 && (
            <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              + {assignedCards.length - 18} more cards
            </div>
          )}
        </div>
      )}
    </div>
  );
}
