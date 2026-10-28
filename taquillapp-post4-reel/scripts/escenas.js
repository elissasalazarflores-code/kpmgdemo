// Mapa de las escenas de diseno/Post4_Reel_Mejores_Comentarios.html (ids data-dc-tpl).
// Tiempos en ms desde el inicio de cada escena (README: 0–3 s, 3–11 s, 11–14 s).
module.exports = {
  HTML: 'diseno/Post4_Reel_Mejores_Comentarios.html',
  CORTES: [0, 3, 11, 14],
  ESCENAS: {
    '01': { fondo: ['7'], piezas: { pill: '9', caja_amarilla: '10', caja_blanca: '12' },
            sinEntrada: true },  // README: en la escena 1 el texto ya está desde el frame 1
    '02': { fondo: ['15'], piezas: { pill: '17', caja: '18', burbuja1: '20', burbuja2: '21', burbuja3: '22', burbuja4: '23' },
            cajas: ['17', '18'],
            burbujas: { '20': 1000, '21': 2800, '22': 4600, '23': 6400 } },  // 4.0 / 5.8 / 7.6 / 9.4 s
    '03': { fondo: ['25', '26'], piezas: { pill: '31', link: '32', caja: '33', logo: '34' },
            cajas: ['31', '32', '33'],
            extra: { '34': 540 } },  // logo 300 ms después de que entra «en bio» (240 + 300)
  },
  ROTADAS: ['10'],
};
