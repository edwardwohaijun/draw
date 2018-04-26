import React from 'react';

import {
  CONTROL_POINT_HANDLER_WIDTH, ROTATE_HANDLER_DATA, ROTATE_HANDLER_HEIGHT,
  ROTATE_HANDLER_WIDTH, SCALE_HANDLER_DATA, SCALE_HANDLER_WIDTH
} from "../constants/constants";
import lineConnHandlers from './lineConnHandlers';

const handlerDown = evt => evt.preventDefault(); // handler is represented as a dot img, this is to prevent the underlying img from capturing the mouseDown when dragging

export default function showHandlers(staticData){
    let ele = staticData.selected.element;
    if (!ele) return;

    let handlers;
    let placeHolderPoints = staticData.handlersPos.slice(0, 4);
    let isCurve = ele.getElementsByClassName('curved-shape').length !== 0; // curves are manipulated by 4 control points, thus no scale/rotate handlers
    let isPolyline = ele.getElementsByClassName('polyline-shape').length !== 0;
    let m = staticData.transform.matrix;

    let placeHolder = (
        <g id='place-holder' className='place-holder'>
          <polygon fill='none' stroke='#00a8ff' strokeDasharray='3 3' strokeWidth={1} points={placeHolderPoints.map(p => p.join(',')).join(' ')} pointerEvents='none'/>
        </g>);
    let lineConn = lineConnHandlers( ele.getBoundingClientRect() );
// todo: rename to 'draw-line-handler'

    if (isCurve){
      let CP = staticData.curve.CP.map(c => [c[0] + m[4], c[1] + m[5]]);
      handlers = ( // only 4 handlers, aka: start/controlPointStart/controlPointEnd/end point
          <g>
            <g id='handlers'>
              <line className='control-point-tangent' x1={CP[0][0]} y1={CP[0][1]}
                    x2={CP[1][0]} y2={CP[1][1]}
                    strokeWidth={2} stroke='#017cfc' strokeDasharray='5,3'/>
              <line className='control-point-tangent' x1={CP[2][0]} y1={CP[2][1]}
                    x2={CP[3][0]} y2={CP[3][1]}
                    strokeWidth={2} stroke='#017cfc' strokeDasharray='5,3'/>
              {CP.map((p, idx) =>
                  <image key={idx} onMouseDown={handlerDown} className='svg-shape control-point-handler handler' id={'control-point-' + idx} style={{cursor: 'nw-resize'}}
                         x={p[0] - CONTROL_POINT_HANDLER_WIDTH/2} y={p[1] - CONTROL_POINT_HANDLER_WIDTH/2} width={CONTROL_POINT_HANDLER_WIDTH} height={CONTROL_POINT_HANDLER_WIDTH}
                         xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={SCALE_HANDLER_DATA} preserveAspectRatio="none" />
              )}
            </g>
            {placeHolder}
          </g>)
    } else if (isPolyline){ // each turning has a dot, no rotate/scale/draw-line handlers
      handlers = (
          <g id="handlers">
            {staticData.handlersPos.map((p, idx) => {
              return <image key={idx} onMouseDown={handlerDown} className='svg-shape polyline-handler handler' x={p[0] - SCALE_HANDLER_WIDTH / 2}
                     y={p[1] - SCALE_HANDLER_WIDTH / 2}
                     width={SCALE_HANDLER_WIDTH} height={SCALE_HANDLER_WIDTH}
                     xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={SCALE_HANDLER_DATA}
                     preserveAspectRatio="none"/>
            })}
          </g>
      )
    } else { // regular shape has 4 scale handlers, 1 rotate handlers, 4 draw-line handlers
      handlers = (
        <g>
          <g id='handlers'>
            {
              staticData.handlersPos.map((p, idx) => {
                if (idx !== 4){
                  return <image key={idx} onMouseDown={handlerDown} className='svg-shape scale-handler handler' id={'scale-handler-' + idx}
                       x={p[0] - SCALE_HANDLER_WIDTH / 2} y={p[1] - SCALE_HANDLER_WIDTH / 2}
                       style={{cursor: 'nw-resize'}} width={SCALE_HANDLER_WIDTH} height={SCALE_HANDLER_WIDTH}
                       xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={SCALE_HANDLER_DATA} preserveAspectRatio="none"/>
                }
                return <image key={idx} onMouseDown={handlerDown} className='svg-shape rotate-handler handler' id={'rotate-handler'} style={{cursor: 'crosshair'}}
                              x={p[0] - ROTATE_HANDLER_WIDTH/2} y={p[1] - ROTATE_HANDLER_HEIGHT/2} width={ROTATE_HANDLER_WIDTH} height={ROTATE_HANDLER_HEIGHT}
                              xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={ROTATE_HANDLER_DATA} preserveAspectRatio="none" />
              })
            }
            {lineConn.map((l, idx) => (
                <path id={'line-connect-handler-' + idx} key={idx} className='svg-shape line-connect-handler handler' fill='#017cfc' fillOpacity='0.2'
                      d={l} />
            ))}
          </g>
          {placeHolder}
        </g>)
    }
    return handlers
  };
