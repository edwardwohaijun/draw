import {CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN, SHAPE_LEADING_MARGIN} from "../constants/constants";
import optimisePath from "./optimisePath";

export default function updatePaths(selectedElement, connectedLine) {
  let results = [];
  if (!connectedLine || connectedLine.size === 0) return results;

  let selectedElementID = selectedElement.closest('.shape-container').id;
  let selectedElementBbox = selectedElement.children[0].getBoundingClientRect(); // todo: don't use children[0], get element by className('shape') to get the concrete child element

  for (let line of connectedLine) {
    let path;
    let ele = document.getElementById(line);
    if (!ele) continue;

    let eleProxy = ele.getElementsByClassName('shape-proxy')[0];
    ele = ele.getElementsByClassName('shape')[0];

    let points = ele.getAttribute('points').split(' ');
    let fromPoint = points[0].split(',').map(num => parseInt(num));
    let toPoint = points[points.length - 1].split(',').map(num => parseInt(num));

    let shape1 = ele.getAttribute('data-shape1'); // each line could have 2(or 1 or none) shape objects at its end point.
    let shape2 = ele.getAttribute('data-shape2'); // if shape1/shape2 is undefined, that means this end has no shape object connected

    let rects = {
      fromRec: { shapeID: shape1, points: [fromPoint, fromPoint, fromPoint, fromPoint]}, // points array is supposed to be replaced if shapeID is not undefined.
      toRec: { shapeID: shape2, points: [toPoint, toPoint, toPoint, toPoint]}
    };
    for (let r in rects ){ // after this for..in loop, fromRec/toRec in rects array are updated
      let bbox;
      if (rects[r].shapeID && rects[r].shapeID === selectedElementID){
        bbox = selectedElementBbox;
      } else if (rects[r].shapeID){
        bbox = document.getElementById( rects[r].shapeID ).children[0].getBoundingClientRect(); // todo: need to check its existence
      }

      if (bbox){
        rects[r].points = [
          [bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width/2), bbox.top - CANVAS_TOP_MARGIN],
          [bbox.right - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height/2)],
          [bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width/2), bbox.bottom],
          [bbox.left - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height/2)]
        ]
      }
    }

    path = optimisePath(rects.fromRec.points, rects.toRec.points, SHAPE_LEADING_MARGIN);
    eleProxy.setAttribute('points', path);
    ele.setAttribute('points', path);
    results.push({lineID: line, path: path})
  }
  return results
}
