const BASE = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

export const CLASSIC_DECK = [
  { id: 1,  name: "El Gallo",       emoji: "🐓", color: "#1a6b4a", img: `${BASE}/2/2e/Loteria_cards_-_El_gallo.jpg/200px-Loteria_cards_-_El_gallo.jpg`,             riddle: "El que le cantó a San Pedro no volverá a cantar" },
  { id: 2,  name: "El Diablito",    emoji: "😈", color: "#8B0000", img: `${BASE}/5/5e/Loteria_cards_-_El_diablito.jpg/200px-Loteria_cards_-_El_diablito.jpg`,       riddle: "Portate bien cuñado, si no te lleva el diablo" },
  { id: 3,  name: "La Dama",        emoji: "👸", color: "#8B2FC9", img: `${BASE}/3/3b/Loteria_cards_-_La_dama.jpg/200px-Loteria_cards_-_La_dama.jpg`,               riddle: "La que se pone peluca no tiene pelo que agradecer" },
  { id: 4,  name: "El Catrín",      emoji: "🎩", color: "#1D4E8F", img: `${BASE}/4/4c/Loteria_cards_-_El_catrin.jpg/200px-Loteria_cards_-_El_catrin.jpg`,           riddle: "Don Ferruco en la alameda su bastón quería tirar" },
  { id: 5,  name: "El Paraguas",    emoji: "☂️",  color: "#2d6a8f", img: `${BASE}/9/9e/Loteria_cards_-_El_paraguas.jpg/200px-Loteria_cards_-_El_paraguas.jpg`,     riddle: "Para el sol y para el agua" },
  { id: 6,  name: "La Sirena",      emoji: "🧜", color: "#0d6efd", img: `${BASE}/3/3f/Loteria_cards_-_La_sirena.jpg/200px-Loteria_cards_-_La_sirena.jpg`,           riddle: "Con los cantos de sirena no te vayas a marear" },
  { id: 7,  name: "La Escalera",    emoji: "🪜", color: "#8B4513", img: `${BASE}/0/0a/Loteria_cards_-_La_escalera.jpg/200px-Loteria_cards_-_La_escalera.jpg`,       riddle: "Súbeme paso a pasito, no quiero que te lastimes" },
  { id: 8,  name: "La Botella",     emoji: "🍾", color: "#2e7d32", img: `${BASE}/b/b7/Loteria_cards_-_La_botella.jpg/200px-Loteria_cards_-_La_botella.jpg`,         riddle: "El que con ella se acuesta, amanece con cruda" },
  { id: 9,  name: "El Barril",      emoji: "🪣", color: "#5D4037", img: `${BASE}/2/2c/Loteria_cards_-_El_barril.jpg/200px-Loteria_cards_-_El_barril.jpg`,           riddle: "Tanto bebió el albañil que quedó como barril" },
  { id: 10, name: "El Árbol",       emoji: "🌳", color: "#33691E", img: `${BASE}/a/a0/Loteria_cards_-_El_arbol.jpg/200px-Loteria_cards_-_El_arbol.jpg`,             riddle: "El que a buen árbol se arrima, buena sombra le cobija" },
  { id: 11, name: "El Melón",       emoji: "🍈", color: "#F9A825", img: `${BASE}/8/8a/Loteria_cards_-_El_melon.jpg/200px-Loteria_cards_-_El_melon.jpg`,             riddle: "La fruta más cabrona: ni se come ni se toma" },
  { id: 12, name: "El Valiente",    emoji: "⚔️",  color: "#B71C1C", img: `${BASE}/2/27/Loteria_cards_-_El_valiente.jpg/200px-Loteria_cards_-_El_valiente.jpg`,     riddle: "Al valiente se le distingue en el peligro" },
  { id: 13, name: "El Gorrito",     emoji: "🎓", color: "#E65100", img: `${BASE}/f/f8/Loteria_cards_-_El_gorrito.jpg/200px-Loteria_cards_-_El_gorrito.jpg`,         riddle: "No seas tan chipocludo y quítate el gorrito" },
  { id: 14, name: "La Muerte",      emoji: "💀", color: "#263238", img: `${BASE}/3/3e/Loteria_cards_-_La_muerte.jpg/200px-Loteria_cards_-_La_muerte.jpg`,           riddle: "La muerte tilica y flaca a todos lleva al panteón" },
  { id: 15, name: "La Pera",        emoji: "🍐", color: "#9E9D24", img: `${BASE}/1/1d/Loteria_cards_-_La_pera.jpg/200px-Loteria_cards_-_La_pera.jpg`,               riddle: "El que espera desespera, pero al cabo que te peras" },
  { id: 16, name: "La Bandera",     emoji: "🚩", color: "#C62828", img: `${BASE}/5/5c/Loteria_cards_-_La_bandera.jpg/200px-Loteria_cards_-_La_bandera.jpg`,         riddle: "Verde, blanco y colorado, la bandera del soldado" },
  { id: 17, name: "El Bandolón",    emoji: "🪕", color: "#6D4C41", img: `${BASE}/6/6e/Loteria_cards_-_El_bandolon.jpg/200px-Loteria_cards_-_El_bandolon.jpg`,       riddle: "Instrumento de los sabrosos que no se para de tocar" },
  { id: 18, name: "El Violoncello", emoji: "🎻", color: "#4527A0", img: `${BASE}/c/c5/Loteria_cards_-_El_violoncello.jpg/200px-Loteria_cards_-_El_violoncello.jpg`, riddle: "Al son del violoncello se mueven hasta los huesos" },
  { id: 19, name: "La Garza",       emoji: "🦢", color: "#0288D1", img: `${BASE}/4/4e/Loteria_cards_-_La_garza.jpg/200px-Loteria_cards_-_La_garza.jpg`,             riddle: "En el lago o en la barca, tú la ves con una pata" },
  { id: 20, name: "El Pájaro",      emoji: "🐦", color: "#00897B", img: `${BASE}/5/51/Loteria_cards_-_El_pajaro.jpg/200px-Loteria_cards_-_El_pajaro.jpg`,           riddle: "El que con pajaritos se acuesta, con pajaritos amanece" },
  { id: 21, name: "La Mano",        emoji: "✋", color: "#E64A19", img: `${BASE}/9/9d/Loteria_cards_-_La_mano.jpg/200px-Loteria_cards_-_La_mano.jpg`,               riddle: "La mano de un criminal o la mano que te da de comer" },
  { id: 22, name: "La Bota",        emoji: "🥾", color: "#4E342E", img: `${BASE}/2/2b/Loteria_cards_-_La_bota.jpg/200px-Loteria_cards_-_La_bota.jpg`,               riddle: "Con las botas bien puestas" },
  { id: 23, name: "La Luna",        emoji: "🌙", color: "#1a237e", img: `${BASE}/6/6c/Loteria_cards_-_La_luna.jpg/200px-Loteria_cards_-_La_luna.jpg`,               riddle: "La que alumbra cuando el sol ya se fue a dormir" },
  { id: 24, name: "El Cotorro",     emoji: "🦜", color: "#2E7D32", img: `${BASE}/0/08/Loteria_cards_-_El_cotorro.jpg/200px-Loteria_cards_-_El_cotorro.jpg`,         riddle: "Cotorro, cotorro, saca el pico y luego te morro" },
  { id: 25, name: "El Borracho",    emoji: "🍻", color: "#6A1B9A", img: `${BASE}/c/c0/Loteria_cards_-_El_borracho.jpg/200px-Loteria_cards_-_El_borracho.jpg`,       riddle: "El que se acuesta con el perro, amanece con pulgas" },
  { id: 26, name: "El Negrito",     emoji: "👦🏿", color: "#BF360C", img: `${BASE}/3/38/Loteria_cards_-_El_negrito.jpg/200px-Loteria_cards_-_El_negrito.jpg`,       riddle: "El que se fue a la villa, perdió su silla" },
  { id: 27, name: "El Corazón",     emoji: "❤️",  color: "#C62828", img: `${BASE}/9/9c/Loteria_cards_-_El_corazon.jpg/200px-Loteria_cards_-_El_corazon.jpg`,       riddle: "El corazón de las niñas está en la puntita de su lengua" },
  { id: 28, name: "La Sandía",      emoji: "🍉", color: "#AD1457", img: `${BASE}/a/a5/Loteria_cards_-_La_sandia.jpg/200px-Loteria_cards_-_La_sandia.jpg`,           riddle: "Colorada por dentro, verde por fuera, tonta la niña que no me quiera" },
  { id: 29, name: "El Tambor",      emoji: "🥁", color: "#4527A0", img: `${BASE}/1/1e/Loteria_cards_-_El_tambor.jpg/200px-Loteria_cards_-_El_tambor.jpg`,           riddle: "Un sonoro instrumento, que produce el talento" },
  { id: 30, name: "El Camarón",     emoji: "🦐", color: "#E64A19", img: `${BASE}/2/2a/Loteria_cards_-_El_camaron.jpg/200px-Loteria_cards_-_El_camaron.jpg`,         riddle: "El camarón que se duerme, se lo lleva la corriente" },
  { id: 31, name: "Las Jaras",      emoji: "🏹", color: "#558B2F", img: `${BASE}/7/7e/Loteria_cards_-_Las_jaras.jpg/200px-Loteria_cards_-_Las_jaras.jpg`,           riddle: "Las jaras del indio flecha en el corazón" },
  { id: 32, name: "El Músico",      emoji: "🎸", color: "#F57F17", img: `${BASE}/4/4f/Loteria_cards_-_El_musico.jpg/200px-Loteria_cards_-_El_musico.jpg`,           riddle: "El músico toca bien y el que toca de a tiro mal" },
  { id: 33, name: "La Araña",       emoji: "🕷️",  color: "#212121", img: `${BASE}/8/87/Loteria_cards_-_La_arana.jpg/200px-Loteria_cards_-_La_arana.jpg`,           riddle: "La araña que pica fuerte, mueve las caderas" },
  { id: 34, name: "El Soldado",     emoji: "💂", color: "#1B5E20", img: `${BASE}/5/5f/Loteria_cards_-_El_soldado.jpg/200px-Loteria_cards_-_El_soldado.jpg`,         riddle: "El que fue y volvió más viejo, vivió más" },
  { id: 35, name: "La Estrella",    emoji: "⭐", color: "#F9A825", img: `${BASE}/d/d9/Loteria_cards_-_La_estrella.jpg/200px-Loteria_cards_-_La_estrella.jpg`,       riddle: "La guía de los Reyes Magos" },
  { id: 36, name: "El Cazo",        emoji: "🥘", color: "#8D6E63", img: `${BASE}/8/8e/Loteria_cards_-_El_cazo.jpg/200px-Loteria_cards_-_El_cazo.jpg`,               riddle: "De barro o de peltre, al pobre le toca el cazo" },
  { id: 37, name: "El Mundo",       emoji: "🌍", color: "#1565C0", img: `${BASE}/2/26/Loteria_cards_-_El_mundo.jpg/200px-Loteria_cards_-_El_mundo.jpg`,             riddle: "Este mundo es una bola, nadie lo puede parar" },
  { id: 38, name: "El Apache",      emoji: "🪶", color: "#BF360C", img: `${BASE}/9/9f/Loteria_cards_-_El_apache.jpg/200px-Loteria_cards_-_El_apache.jpg`,           riddle: "¡Libre, fuerte y altivo!" },
  { id: 39, name: "El Nopal",       emoji: "🌵", color: "#33691E", img: `${BASE}/b/b8/Loteria_cards_-_El_nopal.jpg/200px-Loteria_cards_-_El_nopal.jpg`,             riddle: "Al nopal lo van a ver nomás cuando tiene tunas" },
  { id: 40, name: "El Alacrán",     emoji: "🦂", color: "#EF6C00", img: `${BASE}/1/15/Loteria_cards_-_El_alacran.jpg/200px-Loteria_cards_-_El_alacran.jpg`,         riddle: "El alacrán de Durango te pica y te quema el rango" },
  { id: 41, name: "La Rosa",        emoji: "🌹", color: "#AD1457", img: `${BASE}/8/8c/Loteria_cards_-_La_rosa.jpg/200px-Loteria_cards_-_La_rosa.jpg`,               riddle: "La que con su bello aroma, perfuma el jardín" },
  { id: 42, name: "La Calavera",    emoji: "💀", color: "#37474F", img: `${BASE}/9/9a/Loteria_cards_-_La_calavera.jpg/200px-Loteria_cards_-_La_calavera.jpg`,       riddle: "Al pasar por el panteón me encontré un calaveron" },
  { id: 43, name: "La Campana",     emoji: "🔔", color: "#F9A825", img: `${BASE}/8/8b/Loteria_cards_-_La_campana.jpg/200px-Loteria_cards_-_La_campana.jpg`,         riddle: "Toca que toca, la campana de la iglesia" },
  { id: 44, name: "El Cantarito",   emoji: "🏺", color: "#8D6E63", img: `${BASE}/3/3c/Loteria_cards_-_El_cantarito.jpg/200px-Loteria_cards_-_El_cantarito.jpg`,     riddle: "Tanto va el cántaro al agua hasta que se rompe" },
  { id: 45, name: "El Venado",      emoji: "🦌", color: "#5D4037", img: `${BASE}/3/3a/Loteria_cards_-_El_venado.jpg/200px-Loteria_cards_-_El_venado.jpg`,           riddle: "Saltó el venado en el monte" },
  { id: 46, name: "El Sol",         emoji: "☀️",  color: "#F9A825", img: `${BASE}/1/1a/Loteria_cards_-_El_sol.jpg/200px-Loteria_cards_-_El_sol.jpg`,               riddle: "La cobija de los pobres" },
  { id: 47, name: "La Corona",      emoji: "👑", color: "#F57F17", img: `${BASE}/0/07/Loteria_cards_-_La_corona.jpg/200px-Loteria_cards_-_La_corona.jpg`,           riddle: "El que la trae en la cabeza, ni la siente ni la ve" },
  { id: 48, name: "La Chalupa",     emoji: "⛵", color: "#0288D1", img: `${BASE}/9/98/Loteria_cards_-_La_chalupa.jpg/200px-Loteria_cards_-_La_chalupa.jpg`,         riddle: "Rema que rema Lupita, en su chalupita" },
  { id: 49, name: "El Pino",        emoji: "🌲", color: "#1B5E20", img: `${BASE}/0/05/Loteria_cards_-_El_pino.jpg/200px-Loteria_cards_-_El_pino.jpg`,               riddle: "Frío, fino y gentil, el árbol de navidad" },
  { id: 50, name: "El Pescado",     emoji: "🐟", color: "#0277BD", img: `${BASE}/8/83/Loteria_cards_-_El_pescado.jpg/200px-Loteria_cards_-_El_pescado.jpg`,         riddle: "Ni pica ni da quina, pero mueve la colita" },
  { id: 51, name: "La Palma",       emoji: "🌴", color: "#2E7D32", img: `${BASE}/5/5e/Loteria_cards_-_La_palma.jpg/200px-Loteria_cards_-_La_palma.jpg`,             riddle: "Palmera de dátiles, árbol de sabor" },
  { id: 52, name: "La Maceta",      emoji: "🪴", color: "#558B2F", img: `${BASE}/c/c4/Loteria_cards_-_La_maceta.jpg/200px-Loteria_cards_-_La_maceta.jpg`,           riddle: "No se haga maceta que el dinero no se presta" },
  { id: 53, name: "El Arpa",        emoji: "🎵", color: "#4527A0", img: `${BASE}/6/60/Loteria_cards_-_El_arpa.jpg/200px-Loteria_cards_-_El_arpa.jpg`,               riddle: "El arpa vieja de mi abuela sonaba en la mañana" },
  { id: 54, name: "La Rana",        emoji: "🐸", color: "#2E7D32", img: `${BASE}/5/5d/Loteria_cards_-_La_rana.jpg/200px-Loteria_cards_-_La_rana.jpg`,               riddle: "Al que le canta la rana, es que lluvia está cercana" },
];

export const MILLENNIAL_DECK = [
  { id: 101, name: "La Selfie",        emoji: "🤳", color: "#E91E63", riddle: "Tres filtros y veinte intentos para el Insta" },
  { id: 102, name: "El Ghosteo",       emoji: "👻", color: "#455A64", riddle: "Leído a las 11:47pm. Sin respuesta." },
  { id: 103, name: "La Student Debt",  emoji: "💸", color: "#B71C1C", riddle: "Lo que nunca se termina de pagar" },
  { id: 104, name: "El Podcaster",     emoji: "🎙️", color: "#6200EA", riddle: "Como te decía en el episodio 247..." },
  { id: 105, name: "El Emo",           emoji: "🖤", color: "#212121", riddle: "Nadie te entiende. Pero tu playlist sí." },
  { id: 106, name: "El Influencer",    emoji: "📱", color: "#F57F17", riddle: "Código de descuento: FAKE15" },
  { id: 107, name: "La Crypto Bro",    emoji: "🚀", color: "#00BCD4", riddle: "¿Pero cuándo es el moon?" },
  { id: 108, name: "El Avocado Toast", emoji: "🥑", color: "#558B2F", riddle: "Por eso no tienes casa" },
  { id: 109, name: "La Wellness",      emoji: "🧘", color: "#7B1FA2", riddle: "Manifest, no trabajes" },
  { id: 110, name: "La Cold Brew",     emoji: "☕", color: "#3E2723", riddle: "$9 el vaso pero necesario" },
  { id: 111, name: "El FOMO",          emoji: "😰", color: "#AD1457", riddle: "Todos estaban y tú no" },
  { id: 112, name: "La Vibra",         emoji: "✨", color: "#F9A825", riddle: "No me cuadra tu vibra" },
  { id: 113, name: "El Burnout",       emoji: "🥵", color: "#BF360C", riddle: "Estoy bien. (no estoy bien)" },
  { id: 114, name: "La Anxiety",       emoji: "😬", color: "#1A237E", riddle: "¿Y si todo sale mal?" },
  { id: 115, name: "El Swipe",         emoji: "💔", color: "#C62828", riddle: "Match a las 2am" },
  { id: 116, name: "La Red Flag",      emoji: "🚩", color: "#D32F2F", riddle: "Ignoraste todas las señales" },
  { id: 117, name: "El Overthink",     emoji: "🤯", color: "#4A148C", riddle: "¿Por qué dijo 'ok' y no 'okk'?" },
  { id: 118, name: "El Side Hustle",   emoji: "💼", color: "#1B5E20", riddle: "Mi trabajo, pero el real" },
  { id: 119, name: "La Situationship", emoji: "🤷", color: "#880E4F", riddle: "No somos nada. Pero tampoco cualquier cosa." },
  { id: 120, name: "El Ring Light",    emoji: "💡", color: "#F57F17", riddle: "Ilusión de contenido" },
  { id: 121, name: "La Nostalgia",     emoji: "📼", color: "#4E342E", riddle: "Los 2000s eran mejores" },
  { id: 122, name: "El Mood",          emoji: "😶", color: "#607D8B", riddle: "No hay palabras. Solo mood." },
  { id: 123, name: "El Stan",          emoji: "🎤", color: "#6A1B9A", riddle: "Yo muero por ella pero con respeto" },
  { id: 124, name: "La Cancel",        emoji: "❌", color: "#B71C1C", riddle: "El tribunal de Twitter ya decidió" },
  { id: 125, name: "El Algoritmo",     emoji: "🤖", color: "#263238", riddle: "El que decide qué ves y cuándo" },
  { id: 126, name: "El Doomscroll",    emoji: "📲", color: "#1C1C1C", riddle: "Eran las 3am y seguía cargando" },
  { id: 127, name: "El Tattoo",        emoji: "💉", color: "#212121", riddle: "Es el primero de muchos, mamá" },
  { id: 128, name: "La Oat Milk",      emoji: "🥛", color: "#5D4037", riddle: "¿Pero es leche?" },
  { id: 129, name: "El Meme",          emoji: "😂", color: "#0288D1", riddle: "El idioma universal del 2020 en adelante" },
  { id: 130, name: "El Therapist",     emoji: "🛋️",  color: "#00695C", riddle: "Dile a tu mamá que vayas" },
  { id: 131, name: "La Noche de Copas",emoji: "🍷", color: "#880E4F", riddle: "¿Qué fue lo que pasó ayer?" },
  { id: 132, name: "El Reel",          emoji: "🎬", color: "#E91E63", riddle: "15 segundos de fama" },
  { id: 133, name: "La DM",            emoji: "💬", color: "#1565C0", riddle: "Caída en el inbox con mucho valor" },
  { id: 134, name: "El Delivery",      emoji: "🛵", color: "#F57F17", riddle: "Demasiado cansado para cocinar, otra vez" },
  { id: 135, name: "La Playlist",      emoji: "🎧", color: "#1DB954", riddle: "Curada para esta vibra específica" },
  { id: 136, name: "El Airbnb",        emoji: "🏠", color: "#FF5A5F", riddle: "Pagar más, tener menos" },
  { id: 137, name: "La Gentrificación",emoji: "🏗️", color: "#795548", riddle: "Ya no reconozco mi barrio" },
  { id: 138, name: "El Vegan",         emoji: "🥗", color: "#43A047", riddle: "No te preocupes, ya te lo va a decir" },
  { id: 139, name: "La WFH",           emoji: "🏡", color: "#0097A7", riddle: "Pants de 9am a 9pm" },
  { id: 140, name: "El Imposter",      emoji: "🙈", color: "#4527A0", riddle: "¿Qué hago yo aquí?" },
  { id: 141, name: "La Sobremesa",     emoji: "🍽️",  color: "#BF360C", riddle: "Las mejores 3 horas del día" },
  { id: 142, name: "La Hora Latina",   emoji: "⏰", color: "#E65100", riddle: "Llegas a las 9, la fiesta empieza a las 11" },
  { id: 143, name: "El Abuelito Viral",emoji: "👴", color: "#795548", riddle: "El abuelo que baila mejor que todos" },
  { id: 144, name: "La Telenovela",    emoji: "📺", color: "#AD1457", riddle: "Mentiras, traiciones y looks impecables" },
  { id: 145, name: "El ChatGPT",       emoji: "🧠", color: "#10A37F", riddle: "¿Tú lo escribiste o fue la IA?" },
  { id: 146, name: "La Terapia Online",emoji: "💻", color: "#00897B", riddle: "En pijama pero procesando traumas" },
  { id: 147, name: "El Hot Take",      emoji: "🌶️",  color: "#D32F2F", riddle: "Opinión sin contexto, tuiteada a las 2am" },
  { id: 148, name: "La Bruja",         emoji: "🔮", color: "#6A1B9A", riddle: "Mercury in retrograde again" },
  { id: 149, name: "El Narco Series",  emoji: "🎭", color: "#1B5E20", riddle: "Otra vez Netflix, otra vez Medellín" },
  { id: 150, name: "La Liga",          emoji: "⚽", color: "#1A237E", riddle: "Domingo sagrado en casa de la familia" },
  { id: 151, name: "El Taco Tuesday",  emoji: "🌮", color: "#BF360C", riddle: "Cualquier día es martes de tacos" },
  { id: 152, name: "La Chancla",       emoji: "👡", color: "#8D6E63", riddle: "No necesita objetivo para encontrarte" },
  { id: 153, name: "El Quinceañero",   emoji: "💃", color: "#E91E63", riddle: "El evento más importante del año. No negociable." },
  { id: 154, name: "La Piñata",        emoji: "🎉", color: "#F9A825", riddle: "Dale dale dale, no pierdas el tino" },
];

export function shuffle(deck) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createBoard(deck) {
  return shuffle([...deck]).slice(0, 16);
}

export const WINNING_LINES = [
  [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
  [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
  [0,5,10,15],[3,6,9,12]
];

export function checkWin(marked) {
  return WINNING_LINES.find(line => line.every(i => marked.has(i))) || null;
}
