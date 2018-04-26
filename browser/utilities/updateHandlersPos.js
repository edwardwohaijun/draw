import {
  CONTROL_POINT_HANDLER_WIDTH, ROTATE_HANDLER_HEIGHT, ROTATE_HANDLER_MARGIN, ROTATE_HANDLER_WIDTH,
  SCALE_HANDLER_WIDTH
} from "../constants/constants";
import {pointTransform} from "./common";
import lineConnHandlers from './lineConnHandlers';

export default function updateHandlersPosition (staticData) { // todo: 这里也要考虑是否有line, Y: 则也要update position, 我kao.
  let ele = staticData.selected.element;
  if (!ele ) return; // curves are manipulated by 4 control points, thus no scale/rotate handlers

  let m = staticData.transform.matrix;
  let isCurve = ele.getElementsByClassName('curved-shape').length !== 0; // curves are manipulated by 4 control points, thus no scale/rotate handlers
  let isPolyline = ele.getElementsByClassName('polyline-shape').length !== 0;

  if (ele.getElementsByClassName('curved-shape').length === 0){ // regular shape
      // it's hard to correctly position the rotate handler after transform(especially scale), I have to take this simple, dirty approach
    let [x, y, w, h] = [staticData.bbox.x, staticData.bbox.y, staticData.bbox.w, staticData.bbox.h];
    let points = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x + w/2, (y - ROTATE_HANDLER_MARGIN) / staticData.transform.scalingFactor ]];
    staticData.handlersPos = points.map(p => pointTransform(m, p));

    let lineConnector = lineConnHandlers( staticData.selected.element.getBoundingClientRect() );
    Array.from( staticData.selector.getElementsByClassName('handler')).forEach((h, idx) => {
      if (idx < 4){ // 4 scale handlers
        h.setAttribute('x', staticData.handlersPos[idx][0] - SCALE_HANDLER_WIDTH/2);
        h.setAttribute('y', staticData.handlersPos[idx][1] - SCALE_HANDLER_WIDTH/2);}
      else if (idx === 4) { // 1 rotate handler
        h.setAttribute('x', staticData.handlersPos[idx][0] - ROTATE_HANDLER_WIDTH/2);
        h.setAttribute('y', staticData.handlersPos[idx][1] - ROTATE_HANDLER_HEIGHT/2);
      } else { // 4 line connect handlers
        h.setAttribute('d', lineConnector[idx - 5]);
      }
    });
  } else { // cubic bezier curve
    let CP = staticData.curve.CP.map(p => pointTransform(m, p)); // we can't apply the transform matrix on CP, CP should be changed only when user is dragging them.

    // 4 ptrs, first tangent line goes from ptr 0 to ptr 1, 2nd tangent from ptr 2 to ptr 3
    Array.from( staticData.selector.getElementsByClassName('control-point-tangent')).forEach((c, idx) => {
      c.setAttribute('x1', CP[idx * 2][0]);
      c.setAttribute('y1', CP[idx * 2][1]);
      c.setAttribute('x2', CP[idx * 2 + 1][0]);
      c.setAttribute('y2', CP[idx * 2 + 1][1]);
    });
    Array.from( staticData.selector.getElementsByClassName('control-point-handler')).forEach((c, idx) => {
      c.setAttribute('x', CP[idx][0] - CONTROL_POINT_HANDLER_WIDTH/2);
      c.setAttribute('y', CP[idx][1] - CONTROL_POINT_HANDLER_WIDTH/2);
    });
  }
};
