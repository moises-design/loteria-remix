import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSIC_DECK, MILLENNIAL_DECK, shuffle } from '../data/decks';
import { CardDisplay } from '../components/CardDisplay';
import { speakCard } from '../utils/voice';

export default function StudyModeScreen() {
  const { setMode, activeDeck } = useGameStore();
  const originalDeck = useMemo(() => activeDeck === 'millennial' ? MILLENNIAL_DECK : CLASSIC_DECK, [activeDeck]);

  const [cards, setCards] = useState(() => shuffle([...originalDeck]));
  const [idx, setIdx] = useState(0);
  const [showRiddle, setShowRiddle] = useState(false);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const card = cards[idx];

  useEffect(() => {
    setShowRiddle(false);
    if (card) speakCard(card);
  }, [idx]);

  const next = () => setIdx(i => (i + 1) % cards.length);
  const prev = () => setIdx(i => (i - 1 + cards.length) % cards.length);

  const reshuffle = () => {
    setCards(shuffle([...originalDeck]));
    setIdx(0);
    setShowRiddle(false);
  };

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; touchEnd.current = null; };
  const onTouchMove = (e) => { touchEnd.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    if (touchStart.current == null || touchEnd.current == null) return;
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-icon" onClick={() => setMode('mini-games')}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.6)' }}>LEARN</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--cream)', letterSpacing: 1 }}>📖 STUDY MODE</div>
        </div>
        <button className="btn btn-icon" onClick={reshuffle} title="Shuffle">🔀</button>
      </div>

      <div style={{ textAlign: 'center', flexShrink: 0, padding: '4px 0 8px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 2 }}>
        Card {idx + 1} / {cards.length}
      </div>

      {/* Main card area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 24px', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 240, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '14px 14px 10px', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '2px solid #e8d5a0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, left: 12, fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.3)' }}>{card?.id}</div>
            <CardDisplay card={card} />
          </div>
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--gold)', letterSpacing: 1, lineHeight: 1, textAlign: 'center', marginBottom: 14 }}>
          {card?.name.toUpperCase()}
        </div>

        {/* Riddle */}
        <div
          onClick={() => setShowRiddle(s => !s)}
          style={{
            width: '100%', maxWidth: 380,
            minHeight: 64, padding: '14px 16px',
            background: showRiddle ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px dashed ${showRiddle ? 'rgba(245,200,66,0.4)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          {showRiddle ? (
            <span style={{ fontStyle: 'italic', color: 'white', fontSize: 14, lineHeight: 1.5 }}>"{card?.riddle}"</span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Tap to reveal riddle</span>
          )}
        </div>
      </div>

      {/* Nav footer */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: '12px 16px 18px' }}>
        <button
          onClick={prev}
          className="btn"
          style={{
            flex: 1, padding: '18px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--cream)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: 2, borderRadius: 14,
          }}
        >←</button>
        <button
          onClick={next}
          className="btn"
          style={{
            flex: 1, padding: '18px',
            background: 'var(--gold)', color: 'var(--navy)',
            fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: 2, borderRadius: 14,
            boxShadow: 'var(--shadow-btn)',
          }}
        >→</button>
      </div>
    </div>
  );
}
