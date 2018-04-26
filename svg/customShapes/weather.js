
module.exports = {
  'sunRain': {
    type: 'custom', customClassName: 'weather-sunRain', dataBboxX: 0, dataBboxY: 0, dataBboxW: 32, dataBboxH: 32, dataCX: 32/2, dataCY: 32/2,
    components: [
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "translate(10.5 2.5)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p1' }},
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "rotate(45 2.672 21.107)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p2' }},
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "rotate(90 4 13.5)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p3'}},
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "rotate(-135 5.692 6.257)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p4'}},
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "rotate(-90 6.5 3)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p5'}},
      {tag: 'path', attributes: {d: "M0 1v-3", transform: "rotate(-45 7.828 -4.243)", stroke: "#d6d600", fill: "none", strokeLinecap: "round", strokeDashoffset: 30, strokeDasharray: "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 50", className: 'p6'}},

      {tag: 'ellipse', attributes: {id: "sun", rx: "4", ry: "4", stroke: "#d6d600", fill: "#ff0", transform: "translate(16.5 16.5)", className: 'ellipse1' }},
      {tag: 'path', attributes: {id: "cloud", fill: "#fff", stroke: "#7b7bff", d: "M4.5 0c0 .169-.01.336-.027.5H4.5a4 4 0 0 1 4 4c0 1.864-1.5 4-3 4h-16A4 4 0 1 1-9.41.65a4.001 4.001 0 0 1 5.474-2.833A4.5 4.5 0 0 1 4.5 0z", fillRule: "evenodd", transform: "translate(22 14)"}},
      {tag: 'path', attributes: {id: "r1", d: "M0 0l-6 7", stroke: "#6060ff", fill: "none", strokeLinecap: "round", strokeDashoffset: "19", strokeDasharray: "2 2 2 2 2 2 2 2 2 50", transform: "translate(13.5 24.5)", className: 'p7'}},
      {tag: 'path', attributes: {id: "r2", d: "M0 0l-6 7", stroke: "#6060ff", fill: "none", strokeLinecap: "round", strokeDashoffset: "19", strokeDasharray: "2 2 2 2 2 2 2 2 2 50", transform: "translate(18.5 24.5)", className: 'p8'}},
      {tag: 'path', attributes: {id: "r3", d: "M0 0l-6 7", stroke: "#6060ff", fill: "none", strokeLinecap: "round", strokeDashoffset: "19", strokeDasharray: "2 2 2 2 2 2 2 2 2 50", transform: "translate(23.5 24.5)",  className: 'p9'}},
    ]
  },

  clouds: {
    type: 'custom', customClassName: 'weather-clouds', dataBboxX: 0, dataBboxY: 0, dataBboxW: 66, dataBboxH: 52, dataCX: 66/2, dataCY: 52/2,
    components: [
      {tag: 'path', attributes: {d: "M20.34 17.17h5a14.65 14.65 0 0 1 8.87-7.09 5.14 5.14 0 0 0-6.3-2.94v-.23a6.91 6.91 0 0 0-13.63-1.53 4.14 4.14 0 0 0-4.72 1.57 5.19 5.19 0 1 0-1.31 10.22h8.3", fill: "#9fdef7"}},
      {tag: 'path', attributes: {d: "M48.71 14.03a14.62 14.62 0 0 0-24.95 6.75 8.77 8.77 0 0 0-10 3.33A11 11 0 1 0 11 45.76h12.13A6.81 6.81 0 0 1 32 39.31V39a9.16 9.16 0 0 1 18.09-2 5.49 5.49 0 0 1 6.26 2.09A6.9 6.9 0 0 1 64 42.18a10.88 10.88 0 0 0-11.36-17.67v-.5a14.56 14.56 0 0 0-1.64-6.8", fill: "#beeafc"}},
      {tag: 'path', attributes: {d: "M11.66 23.78H11a11 11 0 0 0 0 22h12.13a6.78 6.78 0 0 1 .87-3.25 34.14 34.14 0 0 1-12.34-18.75z", fill: "#aee4ff"}},
      {tag: 'path', attributes: {d: "M10.64 15.47a34.1 34.1 0 0 1 1.57-10.24 4.15 4.15 0 0 0-2.65 1.72 5.19 5.19 0 1 0-1.31 10.22h2.44q-.05-.84-.05-1.7z", fill: "#83d4ed"}},
      {tag: 'path', attributes: {d: "M58 38.55a6.9 6.9 0 0 0-1.73.22 5.49 5.49 0 0 0-6.22-2.13 9.16 9.16 0 0 0-18.09 2v.31a6.81 6.81 0 1 0-2 13.31H58a6.89 6.89 0 1 0 0-13.78z", fill: "#e4f2f9"}},
      {tag: 'path', attributes: {d: "M37.2 36.79a17 17 0 0 1 1.46-6.9A9.16 9.16 0 0 0 32 38.71v.31a6.81 6.81 0 1 0-2 13.31h17.3a17 17 0 0 1-10.1-15.54z", fill: "#d7edf9"}},
    ]
  },

  snowflake: {
    type: 'custom', customClassName: 'weather-snowflake', dataBboxX: 0, dataBboxY: 0, dataBboxW: 61, dataBboxH: 61, dataCX: 61/2, dataCY: 61/2,
    components:[
      {tag: 'path', attributes: {d: "M61 30.5a1.6 1.6 0 0 0-1.6-1.6h-2.52l2.4-2.4A1.605 1.605 0 0 0 57 24.24l-4.64 4.66H50l2.4-2.4a1.6 1.6 0 0 0-2.26-2.26l-4.67 4.66H34.36l7.85-7.9h6.59a1.6 1.6 0 0 0 0-3.2h-3.39l1.67-1.67h6.59a1.6 1.6 0 1 0 0-3.2h-3.38l1.78-1.78a1.6 1.6 0 0 0-2.27-2.22L48 10.71V7.32a1.6 1.6 0 0 0-3.2 0v6.59l-1.67 1.67V12.2a1.6 1.6 0 0 0-3.2 0v6.59l-7.83 7.85V15.53l4.66-4.66a1.6 1.6 0 0 0-2.26-2.26L32.1 11V8.64L36.76 4a1.605 1.605 0 0 0-2.26-2.28l-2.4 2.4V1.6a1.6 1.6 0 0 0-3.2 0v2.52l-2.4-2.4A1.605 1.605 0 0 0 24.24 4l4.66 4.64V11l-2.4-2.4a1.6 1.6 0 1 0-2.26 2.26l4.66 4.66v11.1l-7.85-7.85V12.2a1.6 1.6 0 0 0-3.2 0v3.39l-1.67-1.67v-6.6a1.6 1.6 0 0 0-3.2 0v3.39L11.2 8.93a1.605 1.605 0 0 0-2.27 2.27l1.78 1.8H7.33a1.6 1.6 0 0 0 0 3.2h6.59l1.67 1.67H12.2a1.6 1.6 0 0 0 0 3.2h6.59l7.85 7.85h-11.1l-4.66-4.66a1.6 1.6 0 0 0-2.27 2.24L11 28.9H8.64L4 24.24a1.605 1.605 0 0 0-2.28 2.26l2.4 2.4H1.6a1.6 1.6 0 1 0 0 3.2h2.52l-2.4 2.4A1.605 1.605 0 1 0 4 36.76l4.64-4.66H11l-2.4 2.4a1.6 1.6 0 1 0 2.26 2.26l4.66-4.66h11.1l-7.85 7.85H12.2a1.6 1.6 0 0 0 0 3.2h3.39l-1.67 1.67H7.33a1.6 1.6 0 0 0 0 3.2h3.39L8.93 49.8a1.6 1.6 0 1 0 2.26 2.26L13 50.28v3.39a1.6 1.6 0 1 0 3.2 0v-6.58l1.67-1.67v3.38a1.6 1.6 0 0 0 3.2 0v-6.59l7.85-7.85v11.1l-4.66 4.66a1.6 1.6 0 1 0 2.26 2.26L28.9 50v2.37L24.24 57a1.6 1.6 0 1 0 2.26 2.26l2.4-2.4v2.54a1.6 1.6 0 1 0 3.2 0v-2.52l2.4 2.4A1.605 1.605 0 1 0 36.76 57l-4.66-4.64V50l2.4 2.4a1.6 1.6 0 0 0 2.26-2.26l-4.66-4.68v-11.1l7.9 7.85v6.59a1.6 1.6 0 1 0 3.2 0v-3.39l1.67 1.67v6.59a1.6 1.6 0 0 0 3.2 0v-3.38l1.78 1.78a1.6 1.6 0 0 0 2.26-2.26L50.29 48h3.39a1.6 1.6 0 0 0 0-3.2h-6.59l-1.67-1.67h3.38a1.6 1.6 0 1 0 0-3.2h-6.59l-7.85-7.83h11.1l4.66 4.66a1.6 1.6 0 0 0 2.26-2.26L50 32.1h2.37L57 36.76a1.6 1.6 0 1 0 2.26-2.26l-2.4-2.4h2.54a1.6 1.6 0 0 0 1.6-1.6z", fill: "#80c7ea"}},
    ]
  },

  storm: {
    type: 'custom', customClassName: 'weather-storm', dataBboxX: 0, dataBboxY: 0, dataBboxW: 62, dataBboxH: 68, dataCX: 62/2, dataCY: 68/2,
    components: [
      {tag: 'path', attributes: {fill: "#f7cf52", d: "M48.7 33.01l-5.31 9.07-2.91 4.99h6.27L29.01 68.28l6.71-17.96h-6.5L32 42.11l3.06-9.1H48.7z"}},
      {tag: 'path', attributes: {d: "M55.48 21.26a10.75 10.75 0 0 1-3.74 20.82h-8.35L48.7 33H35.07L32 42.1H13.43a13.43 13.43 0 0 1-2.92-26.54v-.26a15.27 15.27 0 0 1 30.16-3.39 10 10 0 0 1 14.84 8.71c0 .19-.01.38-.03.64z", fill: "#1ea6c6"}}
    ]
  },

  sun: {
    type: 'custom', customClassName: 'weather-sun', dataBboxX: 0, dataBboxY: 0, dataBboxW: 63, dataBboxH: 53, dataCX: 64/2, dataCY: 52/2,
    components:[
      {tag: 'circle', attributes: {cx: "26.75", cy: "27.31", r: "15.3", fill: "#ffbe26"}},
      {tag: 'path', attributes: {d: "M13.95 27.31A15.3 15.3 0 0 1 28 12.05c-.41 0-.83-.05-1.25-.05a15.305 15.305 0 1 0 0 30.61q.63 0 1.25-.05a15.3 15.3 0 0 1-14.05-15.25z", fill: "#f99a25"}},
      {tag: 'path', attributes: {d: "M53.56 32.65a10 10 0 0 0-3.75.49.91.91 0 0 1-1-.33 12.33 12.33 0 0 0-22 5.44h-.16a7.16 7.16 0 0 0-7.16 7.29 7.24 7.24 0 0 0 7.28 7H53a10 10 0 0 0 .6-19.93z", fill: "#aae8ff"}},
      {tag: 'path', attributes: {d: "M22 45.53a7.16 7.16 0 0 1 7.16-7.29h.16a12.34 12.34 0 0 1 10.89-10.27 12.48 12.48 0 0 0-1.21-.06 12.33 12.33 0 0 0-12.21 10.34h-.16a7.16 7.16 0 0 0-7.16 7.29 7.24 7.24 0 0 0 7.28 7h2.5A7.24 7.24 0 0 1 22 45.53z", fill: "#6bd9fc"}},
      {tag: 'path', attributes: {d: "M26.51 9.01a.94.94 0 0 1-.9-1.15l.65-2.42a1.44 1.44 0 0 1-.94-1.73l.77-3a.94.94 0 0 1 1.81.47l-.64 2.48a1.4 1.4 0 0 1 .95 1.71l-.79 2.95a.94.94 0 0 1-.91.69zM13.37 14.66a.94.94 0 0 1-.81-.47l-1.25-2.17a1.44 1.44 0 0 1-1.89-.56L7.86 8.8a.94.94 0 0 1 1.62-.94l1.3 2.22a1.4 1.4 0 0 1 1.88.54l1.52 2.64a.94.94 0 0 1-.81 1.4zM4 28.24a1.45 1.45 0 0 1-.36 0l-3-.77a.94.94 0 0 1 .47-1.81l2.49.65a1.4 1.4 0 0 1 1.71-.95l2.95.79a.94.94 0 1 1-.43 1.71l-2.42-.6a1.45 1.45 0 0 1-1.37 1zM48.54 28.24a1.45 1.45 0 0 1-.36 0l-3-.77a.94.94 0 0 1 .47-1.81l2.49.65a1.4 1.4 0 0 1 1.71-.95l2.95.79a.94.94 0 0 1-.47 1.71l-2.42-.65a1.45 1.45 0 0 1-1.37 1zM8.33 45.78a.94.94 0 0 1-.47-1.74l2.22-1.3a1.4 1.4 0 0 1 .53-1.88l2.64-1.52a.94.94 0 1 1 .93 1.62L12 42.21a1.44 1.44 0 0 1-.56 1.89l-2.63 1.55a.93.93 0 0 1-.48.13zM39.8 14.31a.94.94 0 0 1-.47-1.74l2.22-1.3a1.4 1.4 0 0 1 .54-1.88l2.64-1.53a.94.94 0 0 1 .93 1.62l-2.17 1.25a1.44 1.44 0 0 1-.56 1.89l-2.65 1.56a.93.93 0 0 1-.48.13z", fill: "#ffbe26"}},
    ]
  },

};
