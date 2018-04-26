import React from 'react';
let AutobotLogo = props => (
    <g>
      <path className='svg-shape shape'
            data-bboxwidth={props['data-bboxwidth']} data-bboxheight={props['data-bboxheight']}
            data-centroidx={props['data-centroidx']} data-centroidy={props['data-centroidy']}
            data-bboxx={props['data-bboxx']} data-bboxy={props['data-bboxy']}
            d="M45.84.5c-19,0-29.65,5.79-29.65,5.79l2.64,7.81L46.73,26.37,74.66,14.11,77.3,6.3S66.6.55,47.65.5h-1.8ZM1.43,3.72,6.83,33.54l12.4,9,18.62.06L35.23,24.47,16.44,16.23l-3.88-12L1.43,3.72Zm90.63,0-11.14.55L77,16.23,58.26,24.47,55.64,42.61l18.62-.06,12.4-9Zm-46,5.14h.64c7,0,10.57,2.18,10.57,2.18-3.66,3.43-10.53,6.12-10.57,6.14S39.83,14.48,36.17,11C36.17,11,39.56,8.95,46.11,8.86Zm-36,8.45,20,9.07L30.81,30,10.9,21.1Zm73.26,0-.79,3.79L62.68,30l.75-3.63,20-9.07ZM11.52,25.23l20,9.07.75,3.63L12.31,29l-.79-3.79Zm70.45,0L81.18,29,61.27,37.93,62,34.3Zm-43.5.65,3.15,17.31V69.63H51.87V43.19L55,25.88l-8.27,3.58-8.27-3.58ZM7.34,37.35l3.22,42.41,16.56,6.81V57l-10.62-6-2.2-8.6-7-5.13Zm78.81,0-7,5.13L77,51.08,66.36,57V86.57l16.56-6.81Zm-47.36,13L30.1,56.79v31.1l5.79,2.2L38.16,77H55.33L57.6,90.09l5.79-2.2V56.79L54.7,50.3V72.58H38.79Zm1.73,29.55L38.31,93H55.18L53,79.85Z"/>
      {/* the above path is not self-closed, if empty space(like the eyes) were clicked, the path won't get selected,
      I have to add the following rect with the same x/y/w/h for easy click.
      But when this shape is hovered to be linked to another shape, the hovering effect(a dropshadow filter applied) won't show up, I don't know why
       */}
      <rect x={props['data-bboxx']} y={props['data-bboxy']} width={props['data-bboxwidth']} height={props['data-bboxheight']}
            className='svg-shape shape' pointerEvents='all' fill='none' opacity={0.5}
            data-bboxwidth={props['data-bboxwidth']} data-bboxheight={props['data-bboxheight']}
            data-centroidx={props['data-centroidx']} data-centroidy={props['data-centroidy']}
            data-bboxx={props['data-bboxx']} data-bboxy={props['data-bboxy']}
      />
    </g>
);
export default AutobotLogo
