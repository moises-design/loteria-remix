import { shuffle } from '../data/decks';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function strToSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyChallenge(deck) {
  const dateStr = todayStr();
  const seed = strToSeed(dateStr);
  const rng = mulberry32(seed);
  const shuffledDeck = seededShuffle(deck, rng);
  const board = shuffledDeck.slice(0, 16);
  const boardIds = new Set(board.map(c => c.id));
  const nonBoard = seededShuffle(deck.filter(c => !boardIds.has(c.id)), rng);
  const pool = seededShuffle([...board, ...board, ...nonBoard.slice(0, 22)], rng);
  return { board, pool, dateStr };
}

export function getDailyRecord() {
  try {
    const raw = localStorage.getItem('loteria-daily');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDailyRecord(score, phase) {
  const record = { date: todayStr(), score, phase };
  try {
    localStorage.setItem('loteria-daily', JSON.stringify(record));
  } catch {}
}

export function hasTodayRecord() {
  const rec = getDailyRecord();
  return !!rec && rec.date === todayStr();
}
