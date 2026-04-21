// Web Speech API voice caller — Lotería Remix
// Female voice, fast & energetic, no riddles

let voices = [];

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function getVoiceLang() {
  return localStorage.getItem('voice-lang') || 'es';
}

function getBestVoice(lang) {
  const isSpanish = lang === 'es';

  if (isSpanish) {
    // Prefer female Spanish voices
    return (
      voices.find(v => v.lang === 'es-MX' && v.localService && /female|mujer|paulina|mónica|monica|karen|siri/i.test(v.name)) ||
      voices.find(v => v.lang === 'es-US' && v.localService && /female|mujer|paulina|mónica|monica|karen|siri/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith('es') && v.localService && /female|mujer|paulina|mónica|monica|karen|siri/i.test(v.name)) ||
      voices.find(v => v.lang === 'es-MX' && v.localService) ||
      voices.find(v => v.lang === 'es-US' && v.localService) ||
      voices.find(v => v.lang.startsWith('es') && v.localService) ||
      voices.find(v => v.lang.startsWith('es')) ||
      voices[0] || null
    );
  } else {
    // Prefer female English voices
    return (
      voices.find(v => v.lang === 'en-US' && v.localService && /female|samantha|victoria|karen|siri|zira/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en') && v.localService && /female|samantha|victoria|karen|siri|zira/i.test(v.name)) ||
      voices.find(v => v.lang === 'en-US' && v.localService) ||
      voices.find(v => v.lang.startsWith('en') && v.localService) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] || null
    );
  }
}

function speak(text, { rate = 1.0, pitch = 1.2, volume = 1.0, delay = 0 } = {}) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;

  const lang = getVoiceLang();
  const utterLang = lang === 'es' ? 'es-MX' : 'en-US';

  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice(lang);
    if (voice) utt.voice = voice;
    utt.lang = utterLang;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = volume;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(utt);
  };

  delay > 0 ? setTimeout(doSpeak, delay) : doSpeak();
}

// English card name translations
const EN_NAMES = {
  'El Gallo': 'The Rooster', 'El Diablito': 'The Little Devil', 'La Dama': 'The Lady',
  'El Catrín': 'The Dandy', 'El Paraguas': 'The Umbrella', 'La Sirena': 'The Mermaid',
  'La Escalera': 'The Ladder', 'La Botella': 'The Bottle', 'El Barril': 'The Barrel',
  'El Árbol': 'The Tree', 'El Melón': 'The Melon', 'El Valiente': 'The Brave One',
  'El Gorrito': 'The Little Hat', 'La Muerte': 'Death', 'La Pera': 'The Pear',
  'La Bandera': 'The Flag', 'El Bandolón': 'The Bandolón', 'El Violoncello': 'The Cello',
  'La Garza': 'The Heron', 'El Pájaro': 'The Bird', 'La Mano': 'The Hand',
  'La Bota': 'The Boot', 'La Luna': 'The Moon', 'El Cotorro': 'The Parrot',
  'El Borracho': 'The Drunk', 'El Negrito': 'The Little Black Boy', 'El Corazón': 'The Heart',
  'La Sandía': 'The Watermelon', 'El Tambor': 'The Drum', 'El Camarón': 'The Shrimp',
  'Las Jaras': 'The Arrows', 'El Músico': 'The Musician', 'La Araña': 'The Spider',
  'El Soldado': 'The Soldier', 'La Estrella': 'The Star', 'El Cazo': 'The Pot',
  'El Mundo': 'The World', 'El Apache': 'The Apache', 'El Nopal': 'The Cactus',
  'El Alacrán': 'The Scorpion', 'La Rosa': 'The Rose', 'La Calavera': 'The Skull',
  'La Campana': 'The Bell', 'El Cantarito': 'The Little Jug', 'El Venado': 'The Deer',
  'El Sol': 'The Sun', 'La Corona': 'The Crown', 'La Chalupa': 'The Boat',
  'El Pino': 'The Pine', 'El Pescado': 'The Fish', 'La Palma': 'The Palm',
  'La Maceta': 'The Flowerpot', 'El Arpa': 'The Harp', 'La Rana': 'The Frog',
};

function getCardText(card) {
  const lang = getVoiceLang();
  if (lang === 'en') return EN_NAMES[card.name] || card.name;
  return card.name;
}

// Caller Mode — just the name, fast and energetic, no riddles
export function speakCard(card) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;
  window.speechSynthesis.cancel();
  speak(getCardText(card), { rate: 1.05, pitch: 1.25 });
}

// Single Player — same fast style
export function speakCardQuick(card) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;
  window.speechSynthesis.cancel();
  speak(getCardText(card), { rate: 1.1, pitch: 1.25 });
}

export function speakText(text, lang = 'es-MX', rate = 1.0) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;
  window.speechSynthesis.cancel();
  speak(text, { rate });
}

export function speakLoteria() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const lang = getVoiceLang();
  if (lang === 'es') {
    speak('¡Lotería!', { rate: 0.85, pitch: 1.3 });
    speak('¡Tenemos ganador!', { rate: 0.9, pitch: 1.25, delay: 800 });
  } else {
    speak('Lotería!', { rate: 0.85, pitch: 1.3 });
    speak('We have a winner!', { rate: 0.9, pitch: 1.25, delay: 800 });
  }
}

export function speakCorrerSeVa() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const lang = getVoiceLang();
  if (lang === 'es') {
    speak('¡Corre y se va!', { rate: 0.9, pitch: 1.25 });
    speak('¡Lotería!', { rate: 0.85, pitch: 1.3, delay: 900 });
  } else {
    speak('Here we go!', { rate: 0.9, pitch: 1.25 });
    speak('Lotería!', { rate: 0.85, pitch: 1.3, delay: 800 });
  }
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

let unlocked = false;
export function unlockSpeech() {
  if (unlocked) return;
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(utt);
  unlocked = true;
}
