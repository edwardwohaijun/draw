export default {
  circle: {
    type: 'circle', cx: 0, cy: 0, strokeWidth: 1, r: 40,
    dataBboxX: -40, dataBboxY: -40, dataBboxW: 80, dataBboxH: 80, dataCX: 0, dataCY: 0,
  },
  rect: {
    type: 'rect', fill: 'yellow', width: '160', height: '80', x: 0, y: 0, strokeWidth: 1,
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 160, dataBboxH: 80, dataCX: 80, dataCY: 40, // cx/cy can be calculated at runtime, but I'm too lazy to do that
  },
  cubicBezier: {
    type: 'cubicBezier', fillOpacity: "0", strokeWidth: 3, d: "M200,400 C200,200 400,400 400,200",
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 200, dataBboxH: 200, dataCX: 300, dataCY: 300,
  },
  triangle: {
    type: 'polygon', points: '55,0 105,70 0,70', strokeWidth: 1,
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 105, dataBboxH: 70, dataCX: 55, dataCY: 35,
  },
  diamond: {
    type: 'path', strokeWidth: 1, d: "M116.5 61.68l-56.83 66.09L0 61.68 56.83 0l59.67 61.68z",
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 116, dataBboxH: 128, dataCX: 116/2, dataCY: 128/2,
  },
  callout: {
    type: 'path', stroke: '#000',
    d: "M22.71 13.05c-24 0-30 20-10.8 24-19.2 8.8 2.4 28 18 20 10.8 16 46.8 16 58.8 0 24 0 24-16 9-24 15-16-9-32-30-24-15-12-39-12-45 4z",
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 108, dataBboxH: 69, dataCX: 108/2, dataCY: 69/2,
  },
  heart: {
    type: 'path', strokeWidth: 0,
    d: `M47.14,5.89C39.85-3.58,25.5,2,25.5,11.62,25.5,2,11.15-3.58,3.86,5.89c-7.54,9.79-.11,26.93,21.64,36.78,21.75-9.85,29.18-27,21.64-36.78Z`,
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 49, dataBboxH: 42, dataCX: 25, dataCY: 21,
  },
  star: {
    type: 'path', strokeWidth: 1,
    d: 'M26.285 2.486l5.407 10.956a2.58 2.58 0 0 0 1.944 1.412l12.091 1.757c2.118.308 2.963 2.91 1.431 4.403l-8.749 8.528a2.582 2.582 0 0 0-.742 2.285l2.065 12.042c.362 2.109-1.852 3.717-3.746 2.722l-10.814-5.685a2.585 2.585 0 0 0-2.403 0l-10.814 5.685c-1.894.996-4.108-.613-3.746-2.722l2.065-12.042a2.582 2.582 0 0 0-.742-2.285L.783 21.014c-1.532-1.494-.687-4.096 1.431-4.403l12.091-1.757a2.58 2.58 0 0 0 1.944-1.412l5.407-10.956c.946-1.919 3.682-1.919 4.629 0z',
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 48, dataBboxH: 47, dataCX: 24, dataCY: 23
  }
};