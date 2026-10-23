// Mapa de las escenas de diseno/Post5_Reel_Combos.html (ids data-dc-tpl).
module.exports = {
  HTML: 'diseno/Post5_Reel_Combos.html',
  // Siempre ocultos: recuadros punteados «VIDEO · …» y notas de producción
  OCULTOS: ['8', '19', '29', '50'],
  ESCENAS: {
    '01': { fondo: '7', cajas: ['12', '13', '14'], subtitulo: '16' },
    '02': { fondo: '18', cajas: ['23', '24'], subtitulo: '26' },
    '03': { fondo: '28', cajas: ['33', '34'], subtitulo: '36' },
    '04': { fondo: '38', cajas: ['40', '41'], subtitulo: '49',
            extra: { tarjeta_dulces: { id: '44', en: 0.6 }, tarjeta_saladas: { id: '46', en: 1.2 } } },
    '05': { fondo: ['52', '53'], cajas: ['58', '59', '60'], subtitulo: '62',
            extra: { logo: { id: '63', en: 0.8 } } },
  },
  // Cajas con rotación en el diseño (entran con rebote de escala)
  ROTADAS: ['14', '33', '44', '46'],
};
