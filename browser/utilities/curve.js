export function composeD(arr){ //compose an array [[30, 40], [50, 60], [30, 70], [70, 80]] into string "M30,40  C50,60  30,70  70,80"
  let str = arr.map(item => item.join(','));
  str[0] = 'M' + str[0];
  str[1] = 'C' + str[1];
  return str.join(' ')
}

export function decomposeD(str){ // decompose an string back into its array format
  let arr = str.split(/\s+/);
  arr[0] = arr[0].substring(1); // strip off the first 'M' character
  arr[1] = arr[1].substring(1); // strip off the first 'C' character
  return arr.map(p => p.split(',').map(num => parseInt(num)));
}