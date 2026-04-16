// Reusable Loteria card with multiple size/style variants

const CARD_PALETTES = {
  warm:  { bg: '#fff9f0', border: '#e8c87a', accent: '#c84b00' },
  cool:  { bg: '#f0f6ff', border: '#7aa8e8', accent: '#0a3d8f' },
  earth: { bg: '#f5f0e8', border: '#a88b5a', accent: '#5a3a1a' },
  dark:  { bg: '#1a1a2e', border: '#4a4a7a', accent: '#e8c87a' },
};

const CARD_THEMES = {
  // Map card IDs to color themes for visual variety
};

function getCardTheme(cardId) {
  const themes = ['warm', 'warm', 'cool', 'earth', 'cool', 'earth', 'warm', 'cool'];
  return CARD_PALETTES[themes[cardId % themes.length]];
}

export function LoteriaCard({ card, size = 'md', marked = false, winning = false, onClick, dim = false, style = {} }) {
  const sizes = {
    xs: { width: 44, emojiSize: 18, nameSize: 9, numSize: 10, radius: 6, padding: '4px 3px 3px' },
    sm: { width: 70, emojiSize: 28, nameSize: 10, numSize: 11, radius: 8, padding: '6px 5px 5px' },
    md: { width: 100, emojiSize: 40, nameSize: 12, numSize: 13, radius: 10, padding: '8px 6px 6px' },
    lg: { width: 160, emojiSize: 64, nameSize: 16, numSize: 16, radius: 14, padding: '14px 12px 10px' },
    xl: { width: 200, emojiSize: 80, nameSize: 20, numSize: 18, radius: 18, padding: '20px 16px 14px' },
  };
  const s = sizes[size] || sizes.md;
  const theme = getCardTheme(card.id);

  return (
    <div
      onClick={onClick}
      style={{
        width: s.width,
        background: winning ? '#fffbe6' : theme.bg,
        borderRadius: s.radius,
        padding: s.padding,
        border: winning
          ? `2.5px solid #F5C842`
          : marked
          ? `2.5px solid #D63030`
          : `1.5px solid ${theme.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        boxShadow: winning
          ? '0 0 16px rgba(245,200,66,0.5)'
          : marked
          ? '0 0 10px rgba(214,48,48,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        opacity: dim ? 0.4 : 1,
        flexShrink: 0,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {/* Card number */}
      <div style={{
        position: 'absolute', top: size === 'xs' ? 2 : 4, left: size === 'xs' ? 3 : 6,
        fontFamily: 'Bebas Neue, sans-serif', fontSize: s.numSize,
        color: theme.accent, opacity: 0.6, lineHeight: 1,
      }}>
        {card.id}
      </div>

      {/* Decorative top border line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%',
        height: 2, background: `${theme.accent}30`, borderRadius: '0 0 2px 2px',
      }} />

      {/* Card image area */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: s.radius - 2,
        background: `linear-gradient(160deg, ${card.color}18, ${card.color}35)`,
        border: `1px solid ${card.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: s.emojiSize,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: size === 'xs' ? 2 : 4,
      }}>
        {/* Subtle pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${card.color}20 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, ${card.color}15 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>{card.emoji}</span>

        {/* Mark overlay */}
        {marked && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: s.radius - 2,
            background: 'rgba(214,48,48,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: s.emojiSize * 0.7,
              color: winning ? '#F5C842' : '#D63030',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}>
              {winning ? '★' : '✓'}
            </div>
          </div>
        )}
      </div>

      {/* Card name */}
      {size !== 'xs' && (
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: s.nameSize,
          color: theme.accent,
          textAlign: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.1,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {card.name.toUpperCase()}
        </div>
      )}

      {/* Decorative bottom border */}
      <div style={{
        position: 'absolute', bottom: 0, left: '25%', right: '25%',
        height: 1.5, background: `${theme.accent}25`, borderRadius: '2px 2px 0 0',
      }} />
    </div>
  );
}

export function BigCallerCard({ card, isNew = false }) {
  if (!card) return null;
  const theme = getCardTheme(card.id);

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 24,
      padding: '28px 24px 20px',
      border: `2px solid ${theme.border}`,
      boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      width: '100%', maxWidth: 260,
      animation: isNew ? 'bounce-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : undefined,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, ${card.color} 0px, ${card.color} 1px, transparent 1px, transparent 8px)`,
      }} />

      {/* Card number */}
      <div style={{
        position: 'absolute', top: 12, left: 16,
        fontFamily: 'Bebas Neue, sans-serif', fontSize: 20,
        color: theme.accent, opacity: 0.5,
      }}>
        {card.id}
      </div>

      {/* Top decorative line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, justifyContent: 'center' }}>
        <div style={{ height: 1, flex: 1, background: `${theme.accent}30` }} />
        <div style={{ fontSize: 12, color: theme.accent, opacity: 0.5 }}>✦</div>
        <div style={{ height: 1, flex: 1, background: `${theme.accent}30` }} />
      </div>

      {/* Big emoji */}
      <div style={{
        width: 160, height: 160, margin: '0 auto 16px',
        background: `linear-gradient(160deg, ${card.color}20, ${card.color}40)`,
        borderRadius: 16, border: `1px solid ${card.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 80, position: 'relative',
      }}>
        {card.emoji}
      </div>

      {/* Bottom decorative line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{ height: 1, flex: 1, background: `${theme.accent}30` }} />
        <div style={{ fontSize: 10, color: theme.accent, opacity: 0.4, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2 }}>
          LOTERÍA
        </div>
        <div style={{ height: 1, flex: 1, background: `${theme.accent}30` }} />
      </div>

      {/* Card name */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 28, color: theme.accent, letterSpacing: 2,
        textAlign: 'center', lineHeight: 1,
      }}>
        {card.name.toUpperCase()}
      </div>
    </div>
  );
}
