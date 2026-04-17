// CardDisplay — renders real image for classic cards (1-54), styled emoji card for millennial (101+)
import { hasCardImage, getCardImageUrl } from '../data/cardArt';

export function CardDisplay({ card, style = {}, imgStyle = {}, className = '' }) {
  if (!card) return null;

  if (hasCardImage(card)) {
    return (
      <img
        src={getCardImageUrl(card)}
        alt={card.name}
        style={{
          width: '100%', aspectRatio: '200/280', objectFit: 'contain',
          borderRadius: 4, display: 'block', ...imgStyle,
        }}
      />
    );
  }

  // Millennial card — styled emoji tile at correct aspect ratio
  return (
    <div style={{
      width: '100%', aspectRatio: '200/280',
      background: `linear-gradient(145deg, ${card.color}33, ${card.color}11)`,
      border: `1.5px solid ${card.color}55`,
      borderRadius: 4, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {/* decorative corner dots */}
      <div style={{ position: 'absolute', top: 4, left: 4, width: 5, height: 5, borderRadius: '50%', background: card.color + '66' }} />
      <div style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: card.color + '66' }} />
      <div style={{ position: 'absolute', bottom: 4, left: 4, width: 5, height: 5, borderRadius: '50%', background: card.color + '66' }} />
      <div style={{ position: 'absolute', bottom: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: card.color + '66' }} />
      <div style={{ fontSize: 'clamp(20px, 6vw, 44px)', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
        {card.emoji}
      </div>
    </div>
  );
}
