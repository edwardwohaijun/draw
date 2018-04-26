export default function rotatePoint(point, origin, rad) {
  let cos = Math.cos(rad),
      sin = Math.sin(rad),
      dX = point[0] - origin[0],
      dY = point[1] - origin[1];
	return [
		cos * dX - sin * dY + origin[0],
		sin * dX + cos * dY + origin[1]
	];
}
