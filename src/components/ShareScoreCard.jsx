import { useRef, useEffect, useState } from 'react';

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function ShareScoreCard({ score, level, winType, pesos, cards = [], streak = 0, onClose }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 500;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0D1B3E');
    bg.addColorStop(1, '#162550');
    ctx.fillStyle = bg;
    drawRoundedRect(ctx, 0, 0, W, H, 20);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = '#F5C842';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 6, 6, W - 12, H - 12, 16);
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = 'rgba(245,200,66,0.3)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 12, 12, W - 24, H - 24, 12);
    ctx.stroke();

    // Top decorative pattern
    ctx.fillStyle = 'rgba(245,200,66,0.06)';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(25 + i * 50, 30 + j * 30, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // "LOTERÍA REMIX" title
    ctx.fillStyle = '#F5C842';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOTERÍA REMIX', W / 2, 55);

    // Decorative line
    ctx.strokeStyle = 'rgba(245,200,66,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 65);
    ctx.lineTo(W - 40, 65);
    ctx.stroke();

    // Win emoji + text
    ctx.font = '52px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉', W / 2, 120);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText('¡LOTERÍA!', W / 2, 160);

    // Level name
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px Arial';
    ctx.fillText(level || 'Classic Mode', W / 2, 182);

    // Score box
    ctx.fillStyle = 'rgba(245,200,66,0.12)';
    drawRoundedRect(ctx, 40, 195, W - 80, 70, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,200,66,0.3)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 40, 195, W - 80, 70, 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINAL SCORE', W / 2, 215);

    ctx.fillStyle = '#F5C842';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(score?.toLocaleString() || '0', W / 2, 252);

    // Stats row
    const stats = [
      ['🪙', `+${pesos || 0}`, 'Pesos'],
      ['🔥', `${streak || 0}`, 'Streak'],
      ['🎴', `${cards?.length || 0}`, 'Cards'],
    ];

    stats.forEach((stat, i) => {
      const x = 80 + i * 120;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      drawRoundedRect(ctx, x - 35, 280, 70, 65, 10);
      ctx.fill();

      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat[0], x, 308);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(stat[1], x, 328);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Arial';
      ctx.fillText(stat[2], x, 342);
    });

    // Called cards row (show up to 8 as emojis)
    if (cards && cards.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CARDS MATCHED', W / 2, 368);

      const displayCards = cards.slice(0, 8);
      const cardSize = 38;
      const totalW = displayCards.length * cardSize;
      const startX = (W - totalW) / 2;

      displayCards.forEach((card, i) => {
        const cx = startX + i * cardSize + cardSize / 2;
        ctx.fillStyle = 'white';
        drawRoundedRect(ctx, cx - 14, 374, 28, 35, 4);
        ctx.fill();
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.emoji || '🎴', cx, 398);
      });
    }

    // Bottom
    ctx.strokeStyle = 'rgba(245,200,66,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 430);
    ctx.lineTo(W - 40, 430);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('loteriaremix.vercel.app', W / 2, 452);

    ctx.fillStyle = 'rgba(245,200,66,0.5)';
    ctx.font = '11px Arial';
    ctx.fillText('Can you beat my score? 🎴', W / 2, 472);

    setImgUrl(canvas.toDataURL('image/png'));
  }, [score, level, pesos, cards, streak]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'loteria-remix-score.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '¡LOTERÍA! Check my score!',
            text: `I just scored ${score?.toLocaleString()} pts in Lotería Remix! Can you beat it? 🎴`,
            files: [file],
          });
        } else {
          // Fallback: download
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = 'loteria-remix-score.png';
          a.click();
        }
        setSharing(false);
      });
    } catch (err) {
      setSharing(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loteria-remix-score.png';
    a.click();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: 3, color: 'rgba(245,200,66,0.7)', marginBottom: 12 }}>
        SHARE YOUR WIN
      </div>

      {imgUrl && (
        <img
          src={imgUrl}
          alt="Score card"
          style={{
            width: '100%', maxWidth: 300, borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            marginBottom: 20,
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 300 }}>
        <button
          className="btn btn-gold"
          style={{ flex: 2, padding: '14px' }}
          onClick={handleShare}
          disabled={sharing}
        >
          {sharing ? '...' : '📤 Share'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: 1, padding: '14px' }}
          onClick={handleSave}
        >
          💾 Save
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: 1, padding: '14px' }}
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
        Save to camera roll then post to Instagram or TikTok
      </div>
    </div>
  );
}
