function init(rect){ // rect is a array of 4 points, return an initialized object
  return [
    {
      point: [rect[0][0], rect[0][1]],
      orient: 'horizontal',
      position: 'top', fromDirection: ''
    },
    {
      point: [rect[1][0], rect[1][1]],
      position: 'right',
      orient: 'vertical', fromDirection: ''
    },
    {
      point: [rect[2][0], rect[2][1]],
      position: 'bottom',
      orient: 'horizontal', fromDirection: ''
    },
    {
      point: [rect[3][0], rect[3][1]],
      position: 'left',
      orient: 'vertical', fromDirection: ''
    },
  ];
}

// edge case: fromPoint and toPoint are too close, draw a straight line between them, no need to turn
// edge cases: 第一步就和目标点垂直, 且可以直连. 走一步就可以直连(此时会有多个option, 但其他option非最佳), 垂直/水平 距离很接近, 可能差1个像素, 1/2个像素round后正好可以走.
// todo: if the xDistance or yDistance is less than leading shape margin(35px), draw a straight line between them, no need to optimise.
// todo: user computer is gonna crash if there are some bugs in this algorithm. please inspect the code very carefully, avoid any edge cases.
function walk(from, to, breadcrumb){
  if ( (from.point[0] === to.point[0] && to.orient === 'horizontal') // X is the same, just move Y, and we are done
      || (from.point[1] === to.point[1] && to.orient === 'vertical') ){ // Y is the same, just move X, and we are done
    breadcrumb.push([to.point[0], to.point[1]]);
    return
  }

  let xDistance = Math.abs(from.point[0] - to.point[0]),
      yDistance = Math.abs(from.point[1] - to.point[1]);

  let directions = {
    'goTop': [0, - yDistance],
    'goRight': [xDistance, 0],
    'goBottom': [0, yDistance],
    'goLeft': [-xDistance, 0]
};
   // try to move at 4 directions(up/right/bottom/left, and figure out which one could get closer to the end point)
  for (let dir in directions) {
    if (from.fromDirection === 'top' && dir === 'goBottom'){
      continue // if the last step is coming from top, the current move shouldn't be moving toward bottom. Otherwise, why couldn't we move longer in the last step. But there is exception
    } else if (from.fromDirection === 'right' && dir === 'goLeft'){
      continue
    } else if (from.fromDirection === 'bottom' && dir === 'goTop'){
      continue
    } else if (from.fromDirection === 'left' && dir === 'goRight'){
      continue
    }

    if (from.point[0] + directions[dir][0] === to.point[0]){
      from.fromDirection = from.point[0] + directions[dir][0] > from.point[0] ? 'left' : 'right'; // x is growing(moving from left), shrinking(moving from right)
      if (to.orient === 'horizontal'){ // bingo, we are one more step to the target point by moving x
        from.point[0] += directions[dir][0];
      } else { // go halfway, then let the next move make the turn
        from.point[0] += Math.round(directions[dir][0]/2);
      }
      breadcrumb.push([from.point[0], from.point[1]]);
      walk(from, to, breadcrumb);
      break;

    } else if (from.point[1] + directions[dir][1] === to.point[1]){
      from.fromDirection = from.point[1] + directions[dir][1] > from.point[1] ? 'top' : 'bottom'; // y is growing(moving from top), shrinking(moving from bottom)
      if (to.orient === 'vertical') { // bingo, we are one more step to the target point by moving y
        from.point[1] += directions[dir][1];
      } else {
        from.point[1] += Math.round(directions[dir][1]/2);
      }
      breadcrumb.push([from.point[0], from.point[1]]);
      walk(from, to, breadcrumb);
      break;
    }
  }
}

export default function optimisePath(rectA, rectB, leadingMargin){ // both are arrays of 4 points(top, right, bottom, left). return value is a path string passed as d attribute value of <polyline> tag
// 2 lines are too close to each other(like 10px), just draw a line and return.

  let fromRect = init(rectA), toRect = init(rectB); // line goes from rectA to rectB with arrow pointing at rectB.
  let fromRectCentroid = [fromRect[0].point[0], fromRect[1].point[1]]; // centroidX is the X of first point(top point), centroidY is the Y of 2nd point(right point)
  let toRectCentroid = [toRect[0].point[0], toRect[1].point[1]];
  let fromCandidatePoints = [],
      toCandidatePoints = [];

  // todo: get distance from 2 centroid points, return a straight line between them if the distance is too short.

// treat fromRect's centroid as origin, check which quadrant toRect is located in regard to fromRect's centroid.
// (we still need to comply to svg's coordinate system(x goes from left to right, y goes from top to bottom))
// then get the 2 candidate points from fromRect and toRect.
  if(fromRectCentroid[0] <= toRectCentroid[0] && fromRectCentroid[1] >= toRectCentroid[1]) { // 1st quadrant
    fromCandidatePoints = [fromRect[0], fromRect[1]];
    toCandidatePoints = [toRect[2], toRect[3]];
  } else if (fromRectCentroid[0] >= toRectCentroid[0] && fromRectCentroid[1] >= toRectCentroid[1]){ // 2nd quadrant
    fromCandidatePoints = [fromRect[0], fromRect[3]];
    toCandidatePoints = [toRect[1], toRect[2]];
  } else if (fromRectCentroid[0] >= toRectCentroid[0] && fromRectCentroid[1] <= toRectCentroid[1]){ // 3rd quadrant
    fromCandidatePoints = [fromRect[2], fromRect[3]];
    toCandidatePoints = [toRect[0], toRect[1]];
  } else { // 4th quadrant
    fromCandidatePoints = [fromRect[1], fromRect[2]];
    toCandidatePoints = [toRect[0], toRect[3]];
  }

  let lineA = {
        line: [fromCandidatePoints[0], toCandidatePoints[0]],
        length: Math.pow(fromCandidatePoints[0].point[0] - toCandidatePoints[0].point[0], 2) + Math.pow(fromCandidatePoints[0].point[1] - toCandidatePoints[0].point[1], 2)
      },
      lineB = {
        line: [fromCandidatePoints[0], toCandidatePoints[1]],
        length: Math.pow(fromCandidatePoints[0].point[0] - toCandidatePoints[1].point[0], 2) + Math.pow(fromCandidatePoints[0].point[1] - toCandidatePoints[1].point[1], 2)
      },
      lineC = {
        line: [fromCandidatePoints[1], toCandidatePoints[0]],
        length: Math.pow(fromCandidatePoints[1].point[0] - toCandidatePoints[0].point[0], 2) + Math.pow(fromCandidatePoints[1].point[1] - toCandidatePoints[0].point[1], 2)
      },
      lineD = {
        line: [fromCandidatePoints[1], toCandidatePoints[1]],
        length: Math.pow(fromCandidatePoints[1].point[0] - toCandidatePoints[1].point[0], 2) + Math.pow(fromCandidatePoints[1].point[1] - toCandidatePoints[1].point[1], 2)
      };
  let lines = [lineA, lineB, lineC, lineD].sort((a, b) => a.length - b.length);
  let shortestLine = lines[0].line;
  let breadcrumb = [[shortestLine[0].point[0], shortestLine[0].point[1]]]; // 1st point in path:

  switch (shortestLine[0].position) {
    case 'top':
      shortestLine[0].point[1] -= leadingMargin;
      shortestLine[0].fromDirection = 'bottom'; // the current point is at top of the rectangle, from the perspective of next move, it's moving from 'bottom'
      break;
    case 'right':
      shortestLine[0].point[0] += leadingMargin;
      shortestLine[0].fromDirection = 'left';
      break;
    case 'bottom':
      shortestLine[0].point[1] += leadingMargin;
      shortestLine[0].fromDirection = 'top';
      break;
    case 'left':
      shortestLine[0].point[0] -= leadingMargin;
      shortestLine[0].fromDirection = 'right';
      break;
  }
  breadcrumb.push([shortestLine[0].point[0], shortestLine[0].point[1]]); // 2nd point in path after adding/subtracting leadingMargin
  walk(shortestLine[0], shortestLine[1], breadcrumb);
  breadcrumb = breadcrumb.map(b => b.map(num => Math.round(num * 100)/100)); // by default, the returned number has too many decimals which I don't need
  return breadcrumb.join(' ')
};
