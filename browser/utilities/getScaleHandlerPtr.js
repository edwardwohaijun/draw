import whichQuadrant from './whichQuadrant';

export default function getScaleHandlerPtr(anchorPtr, pullPoint, rotateRad) {
  let points = [[], []];
  let midPtr = [anchorPtr[0] + (pullPoint[0] - anchorPtr[0])/2, anchorPtr[1] + (pullPoint[1] - anchorPtr[1])/2];
  let newAnchorPtr = [anchorPtr[0] - midPtr[0], anchorPtr[1] - midPtr[1]];
  let newAnchorPtrBK = newAnchorPtr.slice(); // when calculating the newAnchorPtr coordinates(after rotate), we need its old coordinates(both X and Y)

  // https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
  newAnchorPtr[0] = newAnchorPtrBK[0] * Math.cos(-rotateRad) + newAnchorPtrBK[1] * Math.sin(-rotateRad);
  newAnchorPtr[1] = newAnchorPtrBK[1] * Math.cos(-rotateRad) - newAnchorPtrBK[0] * Math.sin(-rotateRad);

  switch (whichQuadrant(newAnchorPtr, [0, 0])){
    case 1:
      points[0] = [-newAnchorPtr[0], newAnchorPtr[1]];
      points[1] = [newAnchorPtr[0], -newAnchorPtr[1]];
      break;
    case 2:
      points[0] = [newAnchorPtr[0], -newAnchorPtr[1]];
      points[1] = [-newAnchorPtr[0], newAnchorPtr[1]];
      break;
    case 3:
      points[0] = [-newAnchorPtr[0], newAnchorPtr[1]];
      points[1] = [newAnchorPtr[0], -newAnchorPtr[1]];
      break;
    case 4:
      points[0] = [newAnchorPtr[0], -newAnchorPtr[1]];
      points[1] = [-newAnchorPtr[0], newAnchorPtr[1]];
  }

  return [
    [
      points[0][0] * Math.cos(rotateRad) + points[0][1] * Math.sin(rotateRad) + midPtr[0],
      points[0][1] * Math.cos(rotateRad) - points[0][0] * Math.sin(rotateRad) + midPtr[1]
    ],
    [
      points[1][0] * Math.cos(rotateRad) + points[1][1] * Math.sin(rotateRad) + midPtr[0],
      points[1][1] * Math.cos(rotateRad) - points[1][0] * Math.sin(rotateRad) + midPtr[1]
    ]
  ]
}
