// Web Speech API voice caller
// Works on iOS Safari, Chrome, Android WebView

let voices = [];
let voiceReady = false;

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  voiceReady = voices.length > 0;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function getBestVoice() {
  // Prefer Spanish voices
  const spanish = voices.find(v =>
    v.lang.startsWith('es') && v.localService
  ) || voices.find(v =>
    v.lang.startsWith('es')
  );
  return spanish || voices[0] || null;
}

export function speakCard(card) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const text = card.name;
  const utt = new SpeechSynthesisUtterance(text);

  const voice = getBestVoice();
  if (voice) utt.voice = voice;

  // Spanish-appropriate settings
  utt.lang = 'es-MX';
  utt.rate = 0.88;   // slightly slower for clarity
  utt.pitch = 1.05;
  utt.volume = 1.0;

  // iOS Safari requires resuming after user interaction
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  window.speechSynthesis.speak(utt);
}

export function speakText(text, lang = 'es-MX', rate = 0.9) {
  if (!window.speechSynthesis) return;
  if (localStorage.getItem('sound') === 'off') return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  const voice = getBestVoice();
  if (voice) utt.voice = voice;
  utt.lang = lang;
  utt.rate = rate;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  window.speechSynthesis.speak(utt);
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// Unlock speech synthesis on first user interaction (required by browsers)
let unlocked = false;
export function unlockSpeech() {
  if (unlocked) return;
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(utt);
  unlocked = true;
}
