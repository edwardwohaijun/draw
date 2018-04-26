export function randomNumber(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function matrixMultiply(a, b){
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ]
}

export function pointTransform(m, p){ // m = [a,b,c,d,e,f], p = [x,y]
  return [
    m[0] * p[0] + m[2] * p[1] + m[4],
    m[1] * p[0] + m[3] * p[1] + m[5]
  ]
}

// generate random string
/*
export function generateRandomID(){
  return (Math.random() + 1).toString(36).substring(7);
}
*/
function makeStr(len) {
  len = len || 12; // 12 characters long by default
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
}
export function randomString(len){
  let arr = new Uint8Array((len || 12) / 2); // 12 characters long by default
  if (window.crypto){
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('')
  } else {
    return makeStr(len)
  }
}
