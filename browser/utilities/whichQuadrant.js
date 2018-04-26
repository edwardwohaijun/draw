export default function whichQuadrant(origin, ptr){ // return which quadrant ptr is located with regard to origin ptr. Y axis goes from top to bottom, thus 1st quadrant is at bottom-right
  if (ptr[0] >= origin[0] && ptr[1] >= origin[1]) {
    return 1
  } else if (ptr[0] >= origin[0] && ptr[1] <= origin[1]) {
    return 4
  } else if (ptr[0] <= origin[0] && ptr[1] >= origin[1]) {
    return 2
  } else {
    return 3
  }
}
