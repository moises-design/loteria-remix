import { useState } from 'react';
import { getCardImageUrl } from '../data/cardArt';

function CardImage({ card, size }) {
  const [imgError, setImgError] = useState(false);
  const fontSize = size === 'xl' ? 80 : size === 'lg' ? 60 : size === 'md' ? 38 : size === 'sm' ? 26 : 18;

  if (!imgError) {
    return (
      <img
        src={getCardImageUrl(card)}
        alt={card.name}
        onError={() => setImgError(true)}
        style={{ width: '100%', aspectRatio: '200/280', borderRadius: 4, objectFit: 'cover', display: 'block' }}
      />
    );
  }

  return (
    <div style={{
      width: '100%', aspectRatio: '1', borderRadius: 4,
      background: card.color + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize,
    }}>
      {card.emoji}
    </div>
  );
}

export function LoteriaCard({ card, size = 'md', marked = false, winning = false, onClick, dim = false, photoUrl = null, style = {} }) {
  const sizes = {
    xs: { width: 44,  nameSize: 0,  numSize: 10, radius: 6,  padding: '3px 2px 2px' },
    sm: { width: 70,  nameSize: 9,  numSize: 11, radius: 8,  padding: '5px 4px 4px' },
    md: { width: 100, nameSize: 11, numSize: 13, radius: 10, padding: '8px 5px 5px' },
    lg: { width: 160, nameSize: 14, numSize: 15, radius: 14, padding: '12px 10px 8px' },
    xl: { width: 200, nameSize: 18, numSize: 17, radius: 18, padding: '18px 14px 12px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      onClick={onClick}
      style={{
        width: s.width,
        background: winning ? '#fffbe6' : 'white',
        borderRadius: s.radius,
        padding: s.padding,
        border: winning ? '2.5px solid #F5C842' : marked ? '2.5px solid #D63030' : '1.5px solid #ddd',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        boxShadow: winning ? '0 0 16px rgba(245,200,66,0.5)' : marked ? '0 0 8px rgba(214,48,48,0.25)' : '0 2px 6px rgba(0,0,0,0.18)',
        opacity: dim ? 0.4 : 1,
        flexShrink: 0,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {size !== 'xs' && (
        <div style={{
          position: 'absolute', top: 3, left: 5,
          fontFamily: 'Bebas Neue, sans-serif', fontSize: s.numSize,
          color: 'rgba(0,0,0,0.35)', lineHeight: 1,
        }}>{card.id}</div>
      )}

      <div style={{ width: '100%', position: 'relative' }}>
        {photoUrl ? (
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: card.color + '40', mixBlendMode: 'multiply' }} />
          </div>
        ) : (
          <CardImage card={card} size={size} />
        )}

        {marked && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 4,
            background: winning ? 'rgba(245,200,66,0.4)' : 'rgba(214,48,48,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: size === 'xs' ? 14 : size === 'sm' ? 18 : 24,
              color: winning ? '#c49a10' : '#D63030',
            }}>
              {winning ? '★' : '✓'}
            </div>
          </div>
        )}
      </div>

      {size !== 'xs' && s.nameSize > 0 && (
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: s.nameSize, color: '#1a1a1a',
          textAlign: 'center', letterSpacing: 0.4,
          lineHeight: 1.1, width: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginTop: 3,
        }}>
          {card.name.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function BigCallerCard({ card, isNew = false, photoUrl = null }) {
  const [imgError, setImgError] = useState(false);
  if (!card) return null;

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      padding: '18px 16px 12px',
      border: '2px solid #e8d5a0',
      boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      width: '100%', maxWidth: 240,
      animation: isNew ? 'bounce-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : undefined,
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 8, left: 12, fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: 'rgba(0,0,0,0.3)' }}>{card.id}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, justifyContent: 'center' }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2 }}>LOTERÍA</div>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.1)' }} />
      </div>

      <div style={{ width: 160, height: 160, margin: '0 auto 10px', borderRadius: 10, overflow: 'hidden' }}>
        {photoUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: card.color + '40', mixBlendMode: 'multiply' }} />
          </div>
        ) : !imgError ? (
          <img
            src={getCardImageUrl(card)}
            alt={card.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: card.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
            {card.emoji}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.2)', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 1 }}>✦</div>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.1)' }} />
      </div>

      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center', lineHeight: 1 }}>
        {card.name.toUpperCase()}
      </div>
    </div>
  );
}
