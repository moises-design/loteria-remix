// Lotería Card Images - points to real card images in /public/cards/
// Place your card images in public/cards/ named card-1.png through card-54.png

export function getCardSVG(card) {
  return null; // not used — we use img tags now
}

export function getCardImageUrl(card) {
  return `/cards/card-${card.id}.png`;
}

export function hasCardImage(card) {
  return card.id >= 1 && card.id <= 54;
}
