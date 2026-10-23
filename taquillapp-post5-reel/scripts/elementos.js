// Elementos animados del Reel 100% animado (docs/shotlist.md).
// Coordenadas en px sobre 1080×1920 (esquina superior izquierda del elemento); tiempos en ms desde el
// inicio de cada escena. Los elementos van debajo del texto y fuera de x>850 donde hay botones de IG,
// salvo arriba a la derecha, que queda libre.
// Cada animación: [nivel, keyframes, opciones]. Nivel 0 = contenedor (entrada), 1 = interior (loop).

const EASE = 'cubic-bezier(.2,.8,.2,1)';

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Aparece con rebote de escala
const pop = (t, dur = 380) => [0, [
  { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.15, offset: 0.55 }, { opacity: 1, scale: 0.95, offset: 0.8 }, { opacity: 1, scale: 1 },
], { delay: t, duration: dur, easing: 'ease-out' }];

// Cae desde arriba, rebota y se asienta (con aplastamiento)
const caer = (t, alto = 900) => [0, [
  { opacity: 1, translate: `0 ${-alto}px`, scale: '1 1' },
  { translate: '0 0', scale: '1.12 0.86', offset: 0.55, easing: 'ease-out' },
  { translate: '0 -36px', scale: '0.96 1.05', offset: 0.75, easing: 'ease-in' },
  { translate: '0 0', scale: '1 1' },
], { delay: t, duration: 520, easing: 'ease-in', fill: 'both' }];

// Flotación suave en loop
const flotar = (t, amp = 14, periodo = 1600, giro = 4) => {
  const kf = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    kf.push({ translate: `0 ${(-Math.sin(a) * amp).toFixed(2)}px`, rotate: `${(Math.sin(a + 1) * giro).toFixed(2)}deg` });
  }
  return [1, kf, { delay: t, duration: periodo, iterations: Infinity, easing: 'linear' }];
};

// Entra deslizándose desde dx con desaceleración
const deslizar = (t, dx, dur = 450) => [0, [
  { opacity: 0, translate: `${dx}px 0` }, { opacity: 1, translate: '0 0' },
], { delay: t, duration: dur, easing: EASE }];

// Palomitas que saltan con gravedad desde (0,0)
function estallido(t0, n, seed) {
  const r = rng(seed), out = [];
  for (let k = 0; k < n; k++) {
    const vx = (r() - 0.35) * 900, vy = -(900 + r() * 700), g = 2600, giro = (r() - 0.5) * 720;
    const dur = 1100 + r() * 400, kf = [];
    for (let i = 0; i <= 20; i++) {
      const s = (i / 20) * dur / 1000;
      kf.push({ opacity: i === 0 ? 0 : i > 17 ? (20 - i) / 3 : 1,
        translate: `${(vx * s).toFixed(1)}px ${(vy * s + 0.5 * g * s * s).toFixed(1)}px`, rotate: `${(giro * s).toFixed(1)}deg` });
    }
    out.push({ e: '🍿', size: 70 + Math.round(r() * 40), x: 0, y: 0, anims: [[0, kf, { delay: t0 + k * 35, duration: dur, easing: 'linear' }]] });
  }
  return out;
}

const mover = (el, dx, dy) => ({ ...el, x: el.x + dx, y: el.y + dy });

module.exports = {
  // 1 · Hook (0–2 s): el 📱 ya está en el frame 0; de él sale el 🍿 (el código «se canjea») y estallan palomitas
  '01': [
    { e: '📱', x: 250, y: 1440, size: 300, rot: -10, anims: [flotar(0, 8, 1400, 2), [1, [
      { scale: '1 1' }, { scale: '1.08 0.9', offset: 0.4 }, { scale: '0.97 1.04', offset: 0.75 }, { scale: '1 1' },
    ], { delay: 150, duration: 320, easing: 'ease-out', fill: 'both' }]] },
    ...estallido(220, 12, 7).map(p => mover(p, 380, 1430)),
    { e: '🍿', x: 560, y: 975, size: 250, rot: 8, anims: [[0, [
      { opacity: 0, translate: '-200px 420px', scale: 0.25, rotate: '-30deg' },
      { opacity: 1, translate: '-120px 60px', scale: 0.9, rotate: '-8deg', offset: 0.5 },
      { opacity: 1, translate: '0 -40px', scale: 1.1, rotate: '6deg', offset: 0.8 },
      { opacity: 1, translate: '0 0', scale: 1, rotate: '0deg' },
    ], { delay: 200, duration: 520, easing: 'ease-out' }], flotar(750, 10, 1300, 4)] },
  ],
  // 2 · Canje (2–6 s): boleto → choca con el combo → ✓
  '02': [
    { e: '🍿', x: 600, y: 760, size: 230, anims: [pop(250), [1, [
      { scale: '1 1' }, { scale: '1.14 0.86', offset: 0.35 }, { scale: '0.95 1.06', offset: 0.7 }, { scale: '1 1' },
    ], { delay: 1550, duration: 380, easing: 'ease-out', fill: 'both' }]] },
    { e: '🥤', x: 790, y: 860, size: 190, rot: 8, anims: [pop(380), flotar(900, 8, 1500, 3)] },
    { e: 'boleto', x: 110, y: 800, size: 280, rot: -10, anims: [deslizar(0, -420), [1, [
      { translate: '0 0', scale: 1, opacity: 1, rotate: '0deg' },
      { translate: '360px -30px', scale: 0.8, opacity: 1, rotate: '18deg', offset: 0.8 },
      { translate: '470px 0', scale: 0.2, opacity: 0, rotate: '30deg' },
    ], { delay: 1200, duration: 380, easing: 'ease-in', fill: 'both' }]] },
    { e: '✅', x: 820, y: 690, size: 150, rot: 10, anims: [[0, [
      { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 0.9, offset: 0.6 }, { opacity: 1, scale: 1 },
    ], { delay: 1800, duration: 300, easing: 'ease-in' }]] },
    { e: '✨', x: 540, y: 690, size: 110, anims: [pop(1600, 300), flotar(1900, 6, 900, 10)] },
    { e: '✨', x: 940, y: 1030, size: 80, anims: [pop(1680, 300), flotar(1980, 6, 1100, 10)] },
  ],
  // 3 · Combo (6–9 s): el combo cae y se apila; 💸 cae por los lados
  '03': [
    ...[[880, 0, 4], [930, 700, -6], [860, 1400, 8], [120, 350, -4], [960, 2000, 3]].map(([x, d, rot], i) => ({
      e: '💸', x, y: 0, size: 110, rot, anims: [[0, [
        { opacity: 0, translate: '0 120px', rotate: '0deg' }, { opacity: 1, translate: '0 400px', rotate: '20deg', offset: 0.15 },
        { opacity: 1, translate: '-30px 1100px', rotate: '-15deg', offset: 0.6 }, { opacity: 0, translate: '20px 1750px', rotate: '10deg' },
      ], { delay: 300 + d - (i === 4 ? 1700 : 0), duration: 2600, easing: 'linear', fill: 'both' }]],
    })),
    { e: '🥤', x: 600, y: 760, size: 230, rot: 6, anims: [caer(200)] },
    { e: '🍿', x: 330, y: 780, size: 260, rot: -6, anims: [caer(500)] },
    { e: '🌭', x: 470, y: 990, size: 220, rot: -4, anims: [caer(800)] },
  ],
  // 4 · Pregunta (9–12 s): 🍬 y 🧂 entran con las tarjetas
  '04': [
    { e: '🍬', x: 330, y: 1040, size: 150, rot: -18, anims: [pop(600), flotar(1000, 8, 1200, 8)] },
    { e: '🧂', x: 740, y: 1030, size: 150, rot: 14, anims: [pop(1200), flotar(1600, 8, 1200, 8)] },
  ],
  // 5 · CTA (12–15 s): boleto de TaquillApp y 🍿 flotan arriba a la derecha
  '05': [
    { e: 'boleto', x: 690, y: 440, size: 210, rot: -16, anims: [pop(0), flotar(400, 14, 1700, 5)] },
    { e: '🍿', x: 760, y: 680, size: 250, rot: 8, anims: [pop(150), flotar(550, 12, 1500, 4)] },
  ],
};

// Efectos de sonido, en segundos absolutos (paleta de sfx.mjs)
module.exports.HITS = [
  [0.2, 'sale el 🍿 del 📱', 'whoosh', { len: 0.35 }], [0.55, '🍿 aterriza', 'pop', { pitch: 'G5' }],
  [0.32, 'palomitas', 'tick', { pan: 0.3 }], [0.42, 'palomitas', 'tick', { pan: -0.2 }], [0.55, 'palomitas', 'tick', { pan: 0.4 }],
  [2.25, 'entra el boleto', 'whoosh', { pan: -0.4 }],
  [2.25, 'aparece el combo', 'pop', { pitch: 'E5' }],
  [3.55, 'canje', 'whoosh', { pan: 0.3 }],
  [3.58, 'canje: choque', 'click+pop', { pitch: 'C6' }],
  [3.98, '✓', 'bell', { pitch: 'E6' }],
  [6.45, '🥤 cae', 'thud', { pitch: 120, to: 60 }],
  [6.75, '🍿 cae', 'thud', { pitch: 140, to: 70 }],
  [7.05, '🌭 cae', 'thud', { pitch: 165, to: 80 }],
  [7.3, '💸', 'coins'],
  [9.6, 'dulces', 'pop', { pitch: 'A5', pan: -0.3 }],
  [10.2, 'saladas', 'pop', { pitch: 'D6', pan: 0.3 }],
  [12.0, 'boleto + 🍿', 'pop', { pitch: 'G5' }],
  [12.8, 'logo', 'bell', { pitch: 'G6' }],
];
