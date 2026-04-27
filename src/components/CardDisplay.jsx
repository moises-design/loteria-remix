// CardDisplay — renders real image for classic cards (1-54), styled emoji card for millennial (101+)
import { useState } from 'react';
import { hasCardImage, getCardImageUrl } from '../data/cardArt';

export function CardDisplay({ card, style = {}, imgStyle = {}, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!card) return null;

  if (hasCardImage(card) && !imgFailed) {
    return (
      <img
        src={getCardImageUrl(card)}
        alt={card.name}
        onError={() => setImgFailed(true)}
        style={{
          width: '100%', aspectRatio: '200/280', objectFit: 'contain',
          borderRadius: 4, display: 'block', ...imgStyle,
        }}
      />
    );
  }

  // Emoji tile for millennial cards OR fallback when image fails to load
  const cardColor = card.color || '#8B4513';
  const cardEmoji = card.emoji || '🎴';

  return (
    <div style={{
      width: '100%', aspectRatio: '200/280',
      background: `linear-gradient(145deg, ${cardColor}33, ${cardColor}11)`,
      border: `1.5px solid ${cardColor}55`,
      borderRadius: 4, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {/* decorative corner dots */}
      <div style={{ position: 'absolute', top: 4, left: 4, width: 5, height: 5, borderRadius: '50%', background: cardColor + '66' }} />
      <div style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: cardColor + '66' }} />
      <div style={{ position: 'absolute', bottom: 4, left: 4, width: 5, height: 5, borderRadius: '50%', background: cardColor + '66' }} />
      <div style={{ position: 'absolute', bottom: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: cardColor + '66' }} />
      <div style={{ fontSize: 'clamp(28px, 8vw, 56px)', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
        {cardEmoji}
      </div>
    </div>
  );
}
